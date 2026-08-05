const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    const [userCounts] = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const [jobCounts] = await pool.query('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');
    const [appCount] = await pool.query('SELECT COUNT(*) as count FROM applications');

    const stats = {
      candidates: 0,
      employers: 0,
      admins: 0,
      jobs_approved: 0,
      jobs_pending: 0,
      jobs_rejected: 0,
      jobs_closed: 0,
      applications: appCount[0].count || 0
    };

    userCounts.forEach(uc => {
      if (uc.role === 'candidate') stats.candidates = uc.count;
      else if (uc.role === 'employer') stats.employers = uc.count;
      else if (uc.role === 'admin') stats.admins = uc.count;
    });

    jobCounts.forEach(jc => {
      if (jc.status === 'approved') stats.jobs_approved = jc.count;
      else if (jc.status === 'pending_approval') stats.jobs_pending = jc.count;
      else if (jc.status === 'rejected') stats.jobs_rejected = jc.count;
      else if (jc.status === 'closed') stats.jobs_closed = jc.count;
    });

    res.json(stats);
  } catch (error) {
    console.error('getStats Error:', error);
    res.status(500).json({ message: 'Server error retrieving admin statistics' });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, name, role, approval_status, blocked, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error('getUsers Error:', error);
    res.status(500).json({ message: 'Server error retrieving user list' });
  }
};

const moderateUser = async (req, res) => {
  const { id } = req.params;
  const { approval_status, blocked } = req.body;

  try {
    const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = [];
    const params = [];

    if (approval_status !== undefined) {
      updates.push('approval_status = ?');
      params.push(approval_status);
    }

    if (blocked !== undefined) {
      updates.push('blocked = ?');
      params.push(blocked ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid modification parameters provided' });
    }

    params.push(id);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('moderateUser Error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

const getPendingJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, e.company_name, e.logo as company_logo 
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.status = 'pending_approval'
       ORDER BY j.created_at ASC`
    );

    const formattedJobs = jobs.map(job => {
      try {
        job.skills = JSON.parse(job.skills);
      } catch (e) {
        job.skills = typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : [];
      }
      return job;
    });

    res.json(formattedJobs);
  } catch (error) {
    console.error('getPendingJobs Error:', error);
    res.status(500).json({ message: 'Server error retrieving pending jobs queue' });
  }
};

const moderateJob = async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: 'approve' or 'reject'

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid moderation action. Must be "approve" or "reject".' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [jobs] = await connection.query('SELECT id FROM jobs WHERE id = ?', [id]);
    if (jobs.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update job status
    await connection.query('UPDATE jobs SET status = ? WHERE id = ?', [newStatus, id]);

    // Insert job review audit log
    await connection.query(
      'INSERT INTO job_reviews (job_id, admin_id, action, reason) VALUES (?, ?, ?, ?)',
      [id, req.user.id, action, reason || null]
    );

    await connection.commit();
    res.json({ message: `Job has been successfully ${newStatus}` });
  } catch (error) {
    await connection.rollback();
    console.error('moderateJob Error:', error);
    res.status(500).json({ message: 'Server error during job moderation' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getStats,
  getUsers,
  moderateUser,
  getPendingJobs,
  moderateJob
};
