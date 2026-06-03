const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validateAuthInput } = require('../middleware/validation');
const { sendOtpEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    const errors = validateAuthInput({ email, password, name });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: error.message || 'Registration failed. Please try again.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('studyGroups', 'name subject');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload user avatar
// @route   POST /api/auth/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cloudinary returns the secure URL in req.file.path
    const avatarUrl = req.file.path;
    user.avatar = avatarUrl;
    const updatedUser = await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: updatedUser.avatar,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP to user's email (for password change / account deletion)
// @route   POST /api/auth/send-otp
// @access  Public (email-based verification)
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate OTP (6 digits)
    const otp = generateOTP();

    // Set OTP expiry to 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail(email, otp);
      console.log(`✅ OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error('❌ Email send error:', emailError.message);
      // Clear OTP if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(500).json({ message: 'Failed to send OTP. Please check your email configuration and try again.' });
    }

    res.json({
      message: 'OTP sent successfully to your email',
      email: user.email,
      expiresIn: '5 minutes'
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public (email-based verification)
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({ message: 'No OTP request found. Please send OTP first.' });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP (case-insensitive, trim spaces)
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP verified successfully - clear it but keep for change-password route
    // Don't clear yet, let change-password verify it
    res.json({
      message: 'OTP verified successfully',
      isVerified: true,
      email: user.email
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
  }
};

// @desc    Change password with OTP verification
// @route   POST /api/auth/change-password
// @access  Public (OTP-based verification)
const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, otp } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword || !otp) {
      return res.status(400).json({ message: 'Email, current password, new password, and OTP are required' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Verify OTP
    if (!user.otp) {
      return res.status(400).json({ message: 'Please verify OTP first' });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current password' });
    }

    // Update password
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    console.log(`✅ Password changed successfully for ${email}`);

    res.json({
      message: 'Password changed successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Failed to change password. Please try again.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  sendOtp,
  verifyOtp,
  changePassword
};

