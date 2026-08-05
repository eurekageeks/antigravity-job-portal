const express = require('express');
const router = express.Router();
const { getStats, getUsers, moderateUser, getPendingJobs, moderateJob } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, requireRole('admin'), getStats);
router.get('/users', verifyToken, requireRole('admin'), getUsers);
router.put('/users/:id', verifyToken, requireRole('admin'), moderateUser);
router.get('/jobs/pending', verifyToken, requireRole('admin'), getPendingJobs);
router.put('/jobs/:id/moderate', verifyToken, requireRole('admin'), moderateJob);

module.exports = router;
