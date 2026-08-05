const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google
 * Body: { credential: <Google ID token>, role: 'candidate' | 'employer', demoEmail, demoName }
 *
 * Flow:
 *  1. Verify Google ID token (or mock if credential === 'demo-token')
 *  2. If user exists by google_id or email → log in (checking approval for candidates)
 *  3. If new user → register with the supplied role, set approval_status appropriately
 *  4. Return the same JWT + user shape as regular login
 */
const googleAuth = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential token is required.' });
  }

  // Validate role when registering a new user
  const validRoles = ['candidate', 'employer'];
  const requestedRole = role && validRoles.includes(role) ? role : null;

  try {
    let googleId, email, name, picture;

    // Support demo mode if credential is "demo-token"
    if (credential === 'demo-token') {
      googleId = `google-demo-id-${role || 'candidate'}`;
      email = req.body.demoEmail || 'demo_user@gmail.com';
      name = req.body.demoName || 'Google Demo User';
      picture = 'https://lh3.googleusercontent.com/a/default-user=s96-c';
    } else {
      // 1. Verify the Google ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    if (!email) {
      return res.status(400).json({ message: 'Google account does not have a public email address.' });
    }

    // 2. Look up user by google_id or email
    let [users] = await pool.query(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    let user;

    if (users.length > 0) {
      // --- EXISTING USER: login ---
      user = users[0];

      // Link google_id if missing (first Google login for an email-registered account)
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?', [googleId, picture, user.id]);
        user.google_id = googleId;
        user.avatar_url = picture;
      }

      // Check if blocked
      if (user.blocked || user.approval_status === 'blocked') {
        return res.status(403).json({ message: 'Your account has been blocked by administrators.' });
      }

      // Check if user is approved (applicable to candidates and employers)
      if ((user.role === 'candidate' || user.role === 'employer') && user.approval_status === 'pending') {
        return res.status(403).json({
          message: `Your ${user.role} account is pending administrator approval. Please wait before logging in.`,
        });
      }
      if ((user.role === 'candidate' || user.role === 'employer') && user.approval_status === 'rejected') {
        return res.status(403).json({ message: `Your registration request has been rejected by administrators.` });
      }
    } else {
      // --- NEW USER: register ---
      if (!requestedRole) {
        return res.status(400).json({
          message: 'Please specify a role (candidate or employer) when signing up with Google.',
        });
      }

      // Both candidates and employers are pending by default
      const approvalStatus = 'pending';

      const [result] = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, approval_status, google_id, avatar_url)
         VALUES (?, NULL, ?, ?, ?, ?, ?)`,
        [email, name, requestedRole, approvalStatus, googleId, picture || null]
      );

      const newUserId = result.insertId;

      // Auto-create skeleton profile
      if (requestedRole === 'candidate') {
        await pool.query(
          'INSERT INTO candidate_profiles (user_id, full_name) VALUES (?, ?)',
          [newUserId, name]
        );
      } else if (requestedRole === 'employer') {
        await pool.query(
          'INSERT INTO employers (user_id, company_name) VALUES (?, ?)',
          [newUserId, `${name}'s Company`]
        );
      }

      // Fetch the newly created user
      const [newUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [newUserId]);
      user = newUsers[0];

      // Block sign-in for pending candidates/employers
      if ((user.role === 'candidate' || user.role === 'employer') && user.approval_status === 'pending') {
        return res.status(403).json({
          message:
            `Your ${user.role} account has been created and is pending administrator approval. You will be able to log in once approved.`,
          registered: true,
        });
      }
    }

    // 3. Load profile ID
    let profileId = null;
    if (user.role === 'candidate') {
      const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) profileId = profiles[0].id;
    } else if (user.role === 'employer') {
      const [profiles] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) profileId = profiles[0].id;
    }

    // 4. Sign JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
      profileId,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'supersecretjwttokenkey12345',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approval_status: user.approval_status,
        avatar_url: user.avatar_url,
        profileId,
      },
    });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    if (error.message && error.message.includes('Token used too late')) {
      return res.status(401).json({ message: 'Google token expired. Please try signing in again.' });
    }
    if (error.message && error.message.includes('Invalid token signature')) {
      return res.status(401).json({ message: 'Invalid Google token. Please try again.' });
    }
    return res.status(500).json({ message: 'Google sign-in failed. Please try again.' });
  }
};

module.exports = { googleAuth };
