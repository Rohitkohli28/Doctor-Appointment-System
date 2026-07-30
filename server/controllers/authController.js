const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || process.env.JWT_EXPIRE || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const setTokenCookies = (res, userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.RENDER === 'true';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists', code: 'USER_EXISTS' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      phone,
      role: role || 'patient'
    });

    // If role is doctor, create doctor profile with isApproved: false
    if (user.role === 'doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: req.body.specialization || 'General Physician',
        experience: req.body.experience || 1,
        consultationFee: req.body.consultationFee || 500,
        isApproved: false,
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.', code: 'INVALID_CREDENTIALS' });
    }

    // Secure check: If role is doctor, verify approved Doctor profile exists
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (!doctor) {
        return res.status(403).json({ success: false, message: 'Doctor profile not found. Please contact administration.', code: 'FORBIDDEN' });
      }
      if (!doctor.isApproved) {
        return res.status(403).json({ success: false, message: 'This doctor account is pending approval.', code: 'FORBIDDEN' });
      }
    }

    const { accessToken, refreshToken } = setTokenCookies(res, user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.doctorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.', code: 'INVALID_CREDENTIALS' });
    }

    if (user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'This account is not authorized to access the Doctor Portal.', code: 'FORBIDDEN' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.', code: 'INVALID_CREDENTIALS' });
    }

    // Verify Doctor profile exists and is approved
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Doctor profile not found. Please contact administration.', code: 'FORBIDDEN' });
    }
    if (!doctor.isApproved) {
      return res.status(403).json({ success: false, message: 'This doctor account is pending approval.', code: 'FORBIDDEN' });
    }

    const { accessToken, refreshToken } = setTokenCookies(res, user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.RENDER === 'true';

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided', code: 'NO_TOKEN' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token', code: 'INVALID_TOKEN' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token', code: 'INVALID_TOKEN' });
      }

      const newAccessToken = generateAccessToken(user._id);

      const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.RENDER === 'true';

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.json({ success: true, token: newAccessToken, accessToken: newAccessToken });
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
      });
    }

    // Generate unhashed reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) requested a password reset for your MediCare account.\n\nPlease click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 28px;">MediCare</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Healthcare & Doctor Appointment System</p>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0284c7;">
          <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your MediCare account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.25);">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This link will expire in <strong>30 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} MediCare Healthcare System. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'MediCare - Password Reset Link',
        message,
        html
      });

      res.json({
        success: true,
        message: 'Password reset link sent to your email address!',
        resetLink: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
      });
    } catch (err) {
      console.error('SendEmail Error:', err.message);
      res.json({
        success: true,
        message: 'Password reset link generated successfully! (Delivery notice: check reset link below or dev logs)',
        resetLink: resetUrl
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new link.',
        code: 'INVALID_TOKEN'
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
