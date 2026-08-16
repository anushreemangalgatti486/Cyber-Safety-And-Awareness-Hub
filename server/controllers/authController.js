const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createThreatLog } = require('../utils/threatLogger');
const { generateAccessToken, generateRefreshToken, generateResetPasswordToken } = require('../services/authService');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    if (user) {
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      // Log registration
      await createThreatLog({
        action: 'USER_REGISTERED',
        description: `New user registered: ${name} (${email})`,
        actorId: user._id,
        actorName: name,
        severity: 'info',
        metadata: { email, role: user.role },
      });

      res.cookie('jwt', refreshToken, cookieOptions);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      if (user) {
        await createThreatLog({
          action: 'FAILED_LOGIN',
          description: `Failed login attempt for email: ${email}`,
          actorId: user._id,
          actorName: user.name,
          severity: 'low',
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.cookie('jwt', refreshToken, cookieOptions);

    await createThreatLog({
      action: user.role === 'admin' || user.role === 'superadmin' ? 'ADMIN_LOGIN' : 'USER_LOGIN',
      description: `User login: ${user.name} (${user.role})`,
      actorId: user._id,
      actorName: user.name,
      severity: user.role === 'user' ? 'info' : 'medium',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Public
 */
const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content

  const refreshToken = cookies.jwt;
  
  // Is refreshToken in db?
  const user = await User.findOne({ refreshToken });
  if (user) {
    // Log logout
    await createThreatLog({
      action: 'USER_LOGOUT',
      description: `User logout: ${user.name}`,
      actorId: user._id,
      actorName: user.name,
      severity: 'info',
    });

    // Delete refresh token in db
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * @route   GET /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
const refreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });

  if (!user) return res.status(403).json({ message: 'Forbidden' });

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) return res.status(403).json({ message: 'Forbidden' });
      const accessToken = generateAccessToken(user._id, user.role);
      res.json({ token: accessToken });
    }
  );
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await createThreatLog({
      action: 'PASSWORD_CHANGED',
      description: `User changed password: ${user.name}`,
      actorId: user._id,
      actorName: user.name,
      severity: 'info',
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot password (email-ready)
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    const { resetToken, resetPasswordToken } = generateResetPasswordToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Log the event instead of sending email (email-ready architecture)
    await createThreatLog({
      action: 'PASSWORD_RESET_REQUESTED',
      description: `Password reset requested for: ${user.email}. Reset URL: ${resetUrl}`,
      actorId: user._id,
      actorName: user.name,
      severity: 'medium',
    });

    console.log(`[Email Ready] Send email to ${user.email} with reset link: ${resetUrl}`);

    res.json({ message: 'Password reset link generated. Check system logs.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await createThreatLog({
      action: 'PASSWORD_RESET',
      description: `Password reset successfully for: ${user.email}`,
      actorId: user._id,
      actorName: user.name,
      severity: 'info',
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshToken, 
  changePassword, 
  forgotPassword, 
  resetPassword, 
  getMe 
};
