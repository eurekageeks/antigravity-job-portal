const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { googleAuth } = require('../controllers/googleAuthController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', verifyToken, getMe);

module.exports = router;
