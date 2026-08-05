const pool = require('../config/db');

const submitApplication = async (req, res) => {
  const { job_id, cover_letter } = req.body;

  if (!job_id) {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  // File check
  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required' });
  }

  try {
    // Resolve user approval status and candidate profile
    const [users] = await pool.query('SELECT approval_status FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (users[0].approval_status !== 'approved') {
      return res.status(403).json({ message: 'Your candidate profile is pending admin approval. You cannot apply to jobs yet.' });
    }

    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    const candidateId = profiles[0].id;

    // Verify job exists and is approved
    const [jobs] = await pool.query('SELECT status, last_date FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = jobs[0];
    if (job.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot apply to a job that is not approved or is closed' });
    }

    if (job.last_date && new Date(job.last_date) < new Date()) {
      return res.status(400).json({ message: 'The deadline for this job posting has passed.' });
    }

    // Check duplicate application
    const [existing] = await pool.query('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?', [job_id, candidateId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this job posting.' });
    }

    // Store resume path
    const resumePath = `/uploads/resumes/${req.file.filename}`;

    const [result] = await pool.query(
      'INSERT INTO applications (job_id, candidate_id, resume, cover_letter, status) VALUES (?, ?, ?, ?, "Applied")',
      [job_id, candidateId, resumePath, cover_letter || null]
    );

    // Also update candidate_profile's resume_url automatically if they uploaded a new resume
    await pool.query('UPDATE candidate_profiles SET resume_url = ? WHERE id = ?', [resumePath, candidateId]);

    res.status(201).json({
      message: 'Application submitted successfully!',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('submitApplication Error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

const getCandidateApplications = async (req, res) => {
  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    const candidateId = profiles[0].id;

    const [applications] = await pool.query(
      `SELECT a.*, j.title as job_title, j.job_type, j.work_mode, e.company_name, e.logo as company_logo
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       WHERE a.candidate_id = ?
       ORDER BY a.created_at DESC`,
      [candidateId]
    );

    res.json(applications);
  } catch (error) {
    console.error('getCandidateApplications Error:', error);
    res.status(500).json({ message: 'Server error retrieving applications' });
  }
};

const getEmployerApplications = async (req, res) => {
  try {
    // Resolve employer profile
    const [employers] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [req.user.id]);
    if (employers.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    const employerId = employers[0].id;

    const [applications] = await pool.query(
      `SELECT a.*, j.title as job_title, c.full_name as candidate_name, c.headline as candidate_headline, c.resume_url, u.email as candidate_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN candidate_profiles c ON a.candidate_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE j.employer_id = ?
       ORDER BY a.created_at DESC`,
      [employerId]
    );

    res.json(applications);
  } catch (error) {
    console.error('getEmployerApplications Error:', error);
    res.status(500).json({ message: 'Server error retrieving applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status' });
  }

  try {
    // Resolve employer profile
    const [employers] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [req.user.id]);
    if (employers.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    const employerId = employers[0].id;

    // Verify application and job ownership
    const [applications] = await pool.query(
      `SELECT a.id, j.employer_id 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (applications[0].employer_id !== employerId) {
      return res.status(403).json({ message: 'Not authorized to modify status for this application' });
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: `Application status updated to ${status} successfully` });
  } catch (error) {
    console.error('updateApplicationStatus Error:', error);
    res.status(500).json({ message: 'Server error updating application status' });
  }
};

module.exports = {
  submitApplication,
  getCandidateApplications,
  getEmployerApplications,
  updateApplicationStatus
};
