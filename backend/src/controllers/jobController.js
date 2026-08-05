const pool = require('../config/db');

const getJobs = async (req, res) => {
  const { search, job_type, work_mode, salary_min, experience_max, skill } = req.query;

  let query = `
    SELECT j.*, e.company_name, e.logo as company_logo, e.website as company_website, e.industry as company_industry
    FROM jobs j
    JOIN employers e ON j.employer_id = e.id
    WHERE j.status = 'approved'
  `;
  const params = [];

  if (search) {
    query += ` AND (j.title LIKE ? OR j.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (job_type) {
    query += ` AND j.job_type = ?`;
    params.push(job_type);
  }

  if (work_mode) {
    query += ` AND j.work_mode = ?`;
    params.push(work_mode);
  }

  if (salary_min) {
    query += ` AND (j.salary_max >= ? OR j.salary_max IS NULL)`;
    params.push(parseFloat(salary_min));
  }

  if (experience_max !== undefined && experience_max !== '') {
    query += ` AND j.experience_min <= ?`;
    params.push(parseInt(experience_max));
  }

  if (skill) {
    query += ` AND j.skills LIKE ?`;
    params.push(`%${skill}%`);
  }

  query += ` ORDER BY j.created_at DESC`;

  try {
    const [jobs] = await pool.query(query, params);
    // Parse skills JSON array for each job
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
    console.error('getJobs Error:', error);
    res.status(500).json({ message: 'Server error retrieving job listings' });
  }
};

const getMyJobs = async (req, res) => {
  try {
    // Resolve employer profile first
    const [employers] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [req.user.id]);
    if (employers.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    const employerId = employers[0].id;

    const [jobs] = await pool.query(
      `SELECT j.*, 
       (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count
       FROM jobs j 
       WHERE j.employer_id = ? 
       ORDER BY j.created_at DESC`, 
      [employerId]
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
    console.error('getMyJobs Error:', error);
    res.status(500).json({ message: 'Server error retrieving your jobs' });
  }
};

const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const [jobs] = await pool.query(
      `SELECT j.*, e.company_name, e.logo as company_logo, e.website as company_website, e.industry as company_industry, e.description as company_description
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.id = ?`,
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = jobs[0];
    try {
      job.skills = JSON.parse(job.skills);
    } catch (e) {
      job.skills = typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : [];
    }

    res.json(job);
  } catch (error) {
    console.error('getJobById Error:', error);
    res.status(500).json({ message: 'Server error retrieving job details' });
  }
};

const createJob = async (req, res) => {
  const { title, description, skills, salary_min, salary_max, experience_min, experience_max, job_type, work_mode, vacancies, last_date } = req.body;

  if (!title || !description || !skills || !job_type || !work_mode) {
    return res.status(400).json({ message: 'Missing required job posting fields' });
  }

  try {
    // Resolve employer profile id
    const [employers] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [req.user.id]);
    if (employers.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    const employerId = employers[0].id;

    // Convert skills to JSON string
    const skillsString = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([skills]);

    const [result] = await pool.query(
      `INSERT INTO jobs (employer_id, title, description, skills, salary_min, salary_max, experience_min, experience_max, job_type, work_mode, vacancies, last_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval')`,
      [
        employerId,
        title,
        description,
        skillsString,
        salary_min ? parseFloat(salary_min) : null,
        salary_max ? parseFloat(salary_max) : null,
        experience_min ? parseInt(experience_min) : 0,
        experience_max ? parseInt(experience_max) : 0,
        job_type,
        work_mode,
        vacancies ? parseInt(vacancies) : 1,
        last_date || null
      ]
    );

    res.status(201).json({ 
      message: 'Job posting submitted successfully and is pending administrator review.',
      jobId: result.insertId 
    });
  } catch (error) {
    console.error('createJob Error:', error);
    res.status(500).json({ message: 'Server error creating job posting' });
  }
};

const updateJob = async (req, res) => {
  const { id } = req.params;
  const { title, description, skills, salary_min, salary_max, experience_min, experience_max, job_type, work_mode, vacancies, last_date, status } = req.body;

  try {
    // Verify ownership
    const [employers] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [req.user.id]);
    if (employers.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    const employerId = employers[0].id;

    const [jobs] = await pool.query('SELECT employer_id FROM jobs WHERE id = ?', [id]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (jobs[0].employer_id !== employerId) {
      return res.status(403).json({ message: 'Not authorized to modify this job' });
    }

    // Convert skills to JSON string if provided
    let skillsString = undefined;
    if (skills) {
      skillsString = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([skills]);
    }

    // If employer updates the job, set status back to pending_approval or allow them to close it directly
    let targetStatus = 'pending_approval';
    if (status === 'closed') {
      targetStatus = 'closed';
    }

    await pool.query(
      `UPDATE jobs SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        skills = COALESCE(?, skills),
        salary_min = COALESCE(?, salary_min),
        salary_max = COALESCE(?, salary_max),
        experience_min = COALESCE(?, experience_min),
        experience_max = COALESCE(?, experience_max),
        job_type = COALESCE(?, job_type),
        work_mode = COALESCE(?, work_mode),
        vacancies = COALESCE(?, vacancies),
        last_date = COALESCE(?, last_date),
        status = ?
       WHERE id = ?`,
      [
        title || null,
        description || null,
        skillsString || null,
        salary_min ? parseFloat(salary_min) : null,
        salary_max ? parseFloat(salary_max) : null,
        experience_min !== undefined ? parseInt(experience_min) : null,
        experience_max !== undefined ? parseInt(experience_max) : null,
        job_type || null,
        work_mode || null,
        vacancies !== undefined ? parseInt(vacancies) : null,
        last_date || null,
        targetStatus,
        id
      ]
    );

    res.json({ message: targetStatus === 'closed' ? 'Job closed successfully' : 'Job updated successfully. Sent for administrator review.' });
  } catch (error) {
    console.error('updateJob Error:', error);
    res.status(500).json({ message: 'Server error updating job' });
  }
};

module.exports = {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob
};
