const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

exports.getDoctors = async (req, res, next) => {
  try {
    const { specialization, city, name, minFee, maxFee, rating, page = 1, limit = 10 } = req.query;

    const query = { isApproved: true };

    if (specialization) query.specialization = specialization;
    if (name) {
      // populate match requires aggregating or manual filter. We'll find User first.
      const users = await require('../models/User').find({ name: { $regex: name, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }
    if (city) query.hospitalAddress = { $regex: city, $options: 'i' };
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }
    if (rating) query.rating = { $gte: Number(rating) };

    const skip = (page - 1) * limit;

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone profilePhoto gender')
      .skip(skip)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      count: doctors.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone profilePhoto gender');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found', code: 'NOT_FOUND' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone profilePhoto gender');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found', code: 'NOT_FOUND' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found', code: 'NOT_FOUND' });
    }

    if (doctor._id.toString() !== req.params.id) {
       return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('userId', 'name email phone profilePhoto gender');

    res.json({ success: true, data: updatedDoctor });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query; // format: 'YYYY-MM-DD'
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query param is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const reqDate = new Date(date);
    const dayOfWeek = reqDate.toLocaleDateString('en-US', { weekday: 'long' });

    const daySchedule = doctor.availableSlots.find(s => s.day === dayOfWeek);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({ success: true, data: [] });
    }

    // Generate slots
    const startStr = daySchedule.startTime.split(':');
    const endStr = daySchedule.endTime.split(':');
    let startMins = parseInt(startStr[0]) * 60 + parseInt(startStr[1]);
    const endMins = parseInt(endStr[0]) * 60 + parseInt(endStr[1]);
    const durationMins = daySchedule.slotDuration;

    const allTimeSlots = [];
    while (startMins + durationMins <= endMins) {
      const h = Math.floor(startMins / 60);
      const m = startMins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const timeString = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      allTimeSlots.push(timeString);
      startMins += durationMins;
    }

    // Get booked slots for the specific date
    const startOfDay = new Date(reqDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(reqDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedTimeSlots = appointments.map(app => app.timeSlot);

    const availableSlots = allTimeSlots.filter(t => !bookedTimeSlots.includes(t));

    res.json({ success: true, data: availableSlots });
  } catch (error) {
    next(error);
  }
};

exports.getSpecializations = async (req, res, next) => {
  try {
    const specializations = await Doctor.distinct('specialization', { isApproved: true });
    res.json({ success: true, data: specializations });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const doctorId = req.params.id;

    // Check if appointment is completed and belongs to user
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patientId.toString() !== req.user.id.toString()) {
       return res.status(403).json({ success: false, message: 'Unauthorized or appointment not found' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
    }

    const review = await Review.create({
      patientId: req.user.id,
      doctorId,
      appointmentId,
      rating,
      comment
    });

    // Update doctor average rating
    const doctor = await Doctor.findById(doctorId);
    const totalReviews = doctor.totalReviews + 1;
    const newRating = ((doctor.rating * doctor.totalReviews) + parseInt(rating)) / totalReviews;
    doctor.rating = parseFloat(newRating.toFixed(1));
    doctor.totalReviews = totalReviews;
    await doctor.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.id }).populate('patientId', 'name profilePhoto');
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.approveDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, message: 'Doctor approved', data: doctor });
  } catch (error) {
    next(error);
  }
};
