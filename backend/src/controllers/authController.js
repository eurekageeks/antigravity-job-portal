const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
  const { email, password, name, role, company_name } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!['candidate', 'employer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection' });
  }

  if (role === 'employer' && !company_name) {
    return res.status(400).json({ message: 'Company name is required for employers' });
  }

  let connection;
  try {
    // ✅ getConnection() is now inside try/catch so DB errors are properly caught
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if email already exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Determine approval status
    // Candidate & Employer = pending
    const approvalStatus = 'pending';

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, name, role, approval_status) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, name, role, approvalStatus]
    );
    const userId = userResult.insertId;

    // Create corresponding profile
    if (role === 'candidate') {
      await connection.query(
        'INSERT INTO candidate_profiles (user_id, full_name, notice_period) VALUES (?, ?, ?)',
        [userId, name, 'Immediate']
      );
    } else if (role === 'employer') {
      await connection.query(
        'INSERT INTO employers (user_id, company_name) VALUES (?, ?)',
        [userId, company_name]
      );
    }

    await connection.commit();
    res.status(201).json({
      message: 'Registration successful! Your profile is pending administrator approval. You will be able to log in once approved.'
    });
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (_) {}
    }
    console.error('Registration Error:', error);

    // Return a specific message for DB connection failures
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ message: 'Database is not reachable. Please check your MySQL server and .env configuration.' });
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ message: 'Database tables not found. Please run: npm run db:init' });
    }
    res.status(500).json({ message: `Registration error: ${error.message}` });
  } finally {
    if (connection) connection.release();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Get user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if blocked
    if (user.blocked || user.approval_status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked by administrators.' });
    }

    // Check if user is approved (applicable to candidates and employers)
    if ((user.role === 'candidate' || user.role === 'employer') && user.approval_status === 'pending') {
      return res.status(403).json({ message: `Your ${user.role} account is pending administrator approval. Please wait for approval before logging in.` });
    }
    if ((user.role === 'candidate' || user.role === 'employer') && user.approval_status === 'rejected') {
      return res.status(403).json({ message: `Your registration request has been rejected by administrators.` });
    }

    // Verify password
    if (!user.password_hash) {
      return res.status(400).json({ message: 'This account was registered using Google. Please sign in with Google.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Load Profile IDs to include in token / response
    let profileId = null;
    if (user.role === 'candidate') {
      const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) profileId = profiles[0].id;
    } else if (user.role === 'employer') {
      const [profiles] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) profileId = profiles[0].id;
    }

    // Sign JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
      profileId: profileId
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'supersecretjwttokenkey12345',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approval_status: user.approval_status,
        avatar_url: user.avatar_url || null,
        profileId: profileId
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ message: 'Database is not reachable. Please ensure MySQL is running and run: npm run db:init' });
    }
    res.status(500).json({ message: `Login error: ${error.message}` });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, name, role, approval_status, blocked, avatar_url FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (user.blocked || user.approval_status === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    let details = {};
    if (user.role === 'candidate') {
      const [profiles] = await pool.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) {
        details = profiles[0];
      }
    } else if (user.role === 'employer') {
      const [profiles] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) {
        details = profiles[0];
      }
    }

    res.json({
      user: {
        ...user,
        profileId: details.id || null
      },
      profile: details
    });
  } catch (error) {
    console.error('getMe Error:', error);
    res.status(500).json({ message: `Session error: ${error.message}` });
  }
};

module.exports = {
  register,
  login,
  getMe
};
