const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadAvatar, sendOtp, verifyOtp, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

// OTP routes (public - email-based)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Change password route (uses OTP verification)
router.post('/change-password', changePassword);

module.exports = router;

