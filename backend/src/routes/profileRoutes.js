const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/profileController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Candidate Profile Routes
router.get('/candidate', verifyToken, requireRole('candidate'), getCandidateProfile);
router.put('/candidate', verifyToken, requireRole('candidate'), updateCandidateProfile);

router.post('/candidate/skills', verifyToken, requireRole('candidate'), addSkill);
router.delete('/candidate/skills/:id', verifyToken, requireRole('candidate'), deleteSkill);

router.post('/candidate/education', verifyToken, requireRole('candidate'), addEducation);
router.delete('/candidate/education/:id', verifyToken, requireRole('candidate'), deleteEducation);

router.post('/candidate/experience', verifyToken, requireRole('candidate'), addExperience);
router.delete('/candidate/experience/:id', verifyToken, requireRole('candidate'), deleteExperience);

router.post('/candidate/certifications', verifyToken, requireRole('candidate'), addCertification);
router.delete('/candidate/certifications/:id', verifyToken, requireRole('candidate'), deleteCertification);

// Employer Profile Routes
router.get('/employer', verifyToken, requireRole('employer'), getEmployerProfile);
router.put('/employer', verifyToken, requireRole('employer'), updateEmployerProfile);

// Profile Image Upload Route (shared by both Candidate and Employer)
const { uploadLogo } = require('../config/multer');
const pool = require('../config/db');
router.post('/upload-image', verifyToken, uploadLogo.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  const relativePath = `/uploads/logos/${req.file.filename}`;
  try {
    // Persist to users table so Navbar and getMe always return the latest photo
    await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [relativePath, req.user.id]);
    res.json({ url: relativePath, imageUrl: relativePath });
  } catch (err) {
    console.error('upload-image DB error:', err);
    res.status(500).json({ message: 'Upload saved but DB update failed' });
  }
});

module.exports = router;
