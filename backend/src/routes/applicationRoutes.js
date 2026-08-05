const express = require('express');
const router = express.Router();
const { 
  submitApplication, 
  getCandidateApplications, 
  getEmployerApplications, 
  updateApplicationStatus 
} = require('../controllers/applicationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { uploadResume } = require('../config/multer');

router.post('/', verifyToken, requireRole('candidate'), uploadResume.single('resume'), submitApplication);
router.get('/candidate', verifyToken, requireRole('candidate'), getCandidateApplications);
router.get('/employer', verifyToken, requireRole('employer'), getEmployerApplications);
router.put('/:id/status', verifyToken, requireRole('employer'), updateApplicationStatus);

module.exports = router;
