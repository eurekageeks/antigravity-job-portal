const pool = require('../config/db');

// Candidate Profiles
const getCandidateProfile = async (req, res) => {
  try {
    const [profiles] = await pool.query(
      `SELECT cp.*, u.avatar_url 
       FROM candidate_profiles cp 
       JOIN users u ON cp.user_id = u.id 
       WHERE cp.user_id = ?`,
      [req.user.id]
    );
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const profile = profiles[0];
    const candidateId = profile.id;

    // Fetch skills
    const [skills] = await pool.query('SELECT * FROM candidate_skills WHERE candidate_id = ?', [candidateId]);
    // Fetch education
    const [education] = await pool.query('SELECT * FROM candidate_education WHERE candidate_id = ?', [candidateId]);
    // Fetch experience
    const [experience] = await pool.query('SELECT * FROM candidate_experience WHERE candidate_id = ? ORDER BY start_date DESC', [candidateId]);
    // Fetch certifications
    const [certifications] = await pool.query('SELECT * FROM candidate_certifications WHERE candidate_id = ?', [candidateId]);

    res.json({
      ...profile,
      skills,
      education,
      experience,
      certifications
    });
  } catch (error) {
    console.error('getCandidateProfile Error:', error);
    res.status(500).json({ message: 'Server error retrieving candidate profile' });
  }
};

const updateCandidateProfile = async (req, res) => {
  const { full_name, headline, about_me, expected_salary, notice_period, avatar_url } = req.body;

  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    await pool.query(
      `UPDATE candidate_profiles SET 
        full_name = COALESCE(?, full_name),
        headline = COALESCE(?, headline),
        about_me = COALESCE(?, about_me),
        expected_salary = COALESCE(?, expected_salary),
        notice_period = COALESCE(?, notice_period)
       WHERE user_id = ?`,
      [
        full_name || null,
        headline || null,
        about_me || null,
        expected_salary ? parseFloat(expected_salary) : null,
        notice_period || null,
        req.user.id
      ]
    );

    // If full_name is changed, also sync user's name
    if (full_name) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [full_name, req.user.id]);
    }

    // Sync avatar_url in users table
    if (avatar_url !== undefined) {
      await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url || null, req.user.id]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('updateCandidateProfile Error:', error);
    res.status(500).json({ message: 'Server error updating candidate profile' });
  }
};


// Skill child operations
const addSkill = async (req, res) => {
  const { skill_name, level } = req.body;
  if (!skill_name || !level) {
    return res.status(400).json({ message: 'Skill name and level are required' });
  }

  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    const [result] = await pool.query(
      'INSERT INTO candidate_skills (candidate_id, skill_name, level) VALUES (?, ?, ?)',
      [candidateId, skill_name, level]
    );

    res.status(201).json({ id: result.insertId, skill_name, level });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding skill' });
  }
};

const deleteSkill = async (req, res) => {
  const { id } = req.params;
  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    await pool.query('DELETE FROM candidate_skills WHERE id = ? AND candidate_id = ?', [id, candidateId]);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting skill' });
  }
};

// Education child operations
const addEducation = async (req, res) => {
  const { degree, institution, year, percentage } = req.body;
  if (!degree || !institution || !year) {
    return res.status(400).json({ message: 'Degree, institution, and year are required' });
  }

  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    const [result] = await pool.query(
      'INSERT INTO candidate_education (candidate_id, degree, institution, year, percentage) VALUES (?, ?, ?, ?, ?)',
      [candidateId, degree, institution, parseInt(year), percentage ? parseFloat(percentage) : null]
    );

    res.status(201).json({ id: result.insertId, degree, institution, year, percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding education' });
  }
};

const deleteEducation = async (req, res) => {
  const { id } = req.params;
  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    await pool.query('DELETE FROM candidate_education WHERE id = ? AND candidate_id = ?', [id, candidateId]);
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting education' });
  }
};

// Experience child operations
const addExperience = async (req, res) => {
  const { company, designation, technologies, start_date, end_date } = req.body;
  if (!company || !designation || !start_date) {
    return res.status(400).json({ message: 'Company, designation, and start date are required' });
  }

  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    const [result] = await pool.query(
      'INSERT INTO candidate_experience (candidate_id, company, designation, technologies, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [candidateId, company, designation, technologies || null, start_date, end_date || null]
    );

    res.status(201).json({ id: result.insertId, company, designation, technologies, start_date, end_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding experience' });
  }
};

const deleteExperience = async (req, res) => {
  const { id } = req.params;
  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    await pool.query('DELETE FROM candidate_experience WHERE id = ? AND candidate_id = ?', [id, candidateId]);
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting experience' });
  }
};

// Certifications child operations
const addCertification = async (req, res) => {
  const { name, issue_date, url } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Certification name is required' });
  }

  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    const [result] = await pool.query(
      'INSERT INTO candidate_certifications (candidate_id, name, issue_date, url) VALUES (?, ?, ?, ?)',
      [candidateId, name, issue_date || null, url || null]
    );

    res.status(201).json({ id: result.insertId, name, issue_date, url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding certification' });
  }
};

const deleteCertification = async (req, res) => {
  const { id } = req.params;
  try {
    const [profiles] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    const candidateId = profiles[0].id;

    await pool.query('DELETE FROM candidate_certifications WHERE id = ? AND candidate_id = ?', [id, candidateId]);
    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting certification' });
  }
};

// Employer Profiles
const getEmployerProfile = async (req, res) => {
  try {
    const [profiles] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    res.json(profiles[0]);
  } catch (error) {
    console.error('getEmployerProfile Error:', error);
    res.status(500).json({ message: 'Server error retrieving employer profile' });
  }
};

const updateEmployerProfile = async (req, res) => {
  const { company_name, logo, website, industry, description } = req.body;

  if (!company_name) {
    return res.status(400).json({ message: 'Company name is required' });
  }

  try {
    const [profiles] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    await pool.query(
      `UPDATE employers SET 
        company_name = ?,
        logo = COALESCE(?, logo),
        website = COALESCE(?, website),
        industry = COALESCE(?, industry),
        description = COALESCE(?, description)
       WHERE user_id = ?`,
      [company_name, logo || null, website || null, industry || null, description || null, req.user.id]
    );

    // If logo is modified, sync users.avatar_url
    if (logo !== undefined) {
      await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [logo || null, req.user.id]);
    }

    res.json({ message: 'Company profile updated successfully' });
  } catch (error) {
    console.error('updateEmployerProfile Error:', error);
    res.status(500).json({ message: 'Server error updating company profile' });
  }
};

module.exports = {
  getCandidateProfile,
  updateCandidateProfile,
  addSkill,
  deleteSkill,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  addCertification,
  deleteCertification,
  getEmployerProfile,
  updateEmployerProfile
};
