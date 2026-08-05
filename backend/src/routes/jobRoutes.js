const express = require('express');
const router = express.Router();
const { getJobs, getMyJobs, getJobById, createJob, updateJob } = require('../controllers/jobController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/my-jobs', verifyToken, requireRole('employer'), getMyJobs);
router.get('/:id', getJobById);
router.post('/', verifyToken, requireRole('employer'), createJob);
router.put('/:id', verifyToken, requireRole('employer'), updateJob);

module.exports = router;
