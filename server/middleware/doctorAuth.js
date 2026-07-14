const Doctor = require('../models/Doctor');

const doctorCheck = async (req, res, next) => {
  try {
    // req.user should already be populated by protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this route',
        code: 'UNAUTHORIZED'
      });
    }

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'This account is not authorized to access the Doctor Portal.',
        code: 'FORBIDDEN'
      });
    }

    // Check if Doctor profile exists in collection
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found in database.',
        code: 'FORBIDDEN'
      });
    }

    // Check if Doctor is approved
    if (!doctor.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'This doctor account is pending approval.',
        code: 'FORBIDDEN'
      });
    }

    // Attach doctor profile to req
    req.doctor = doctor;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { doctorCheck };
