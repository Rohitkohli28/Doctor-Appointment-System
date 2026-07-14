const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists', code: 'USER_EXISTS' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
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
    console.log(`\n--- Login Attempt ---`);
    console.log(`Email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Result: User not found in database.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password Match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
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

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
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
    console.log(`\n--- Doctor Portal Login Attempt ---`);
    console.log(`Email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Result: User not found in database.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    if (user.role !== 'doctor') {
      console.log(`Result: User role ${user.role} is not authorized for Doctor Portal.`);
      return res.status(403).json({ success: false, message: 'This account is not authorized to access the Doctor Portal.', code: 'FORBIDDEN' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password Match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Verify Doctor profile exists and is approved
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Doctor profile not found. Please contact administration.', code: 'FORBIDDEN' });
    }
    if (!doctor.isApproved) {
      return res.status(403).json({ success: false, message: 'This doctor account is pending approval.', code: 'FORBIDDEN' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
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
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

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
      res.json({ success: true, accessToken: newAccessToken });
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
