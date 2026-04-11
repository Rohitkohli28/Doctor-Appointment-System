const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, symptoms } = req.body;
    const patientId = req.user.id;

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const consultationFee = doctor.consultationFee;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      type,
      symptoms,
      consultationFee,
      status: 'pending' // pending until paid if razorpay requires it, otherwise confirmed. Standard is pending.
    });

    const user = await User.findById(patientId);

    // Email
    try {
      const message = `Dear ${user.name},\n\Your appointment with Dr. ${doctor.userId.name} on ${new Date(appointmentDate).toDateString()} at ${timeSlot} is booked.\n\nThank you for choosing MediCare.`;
      await sendEmail({
        email: user.email,
        subject: 'Appointment Confirmation',
        message: message
      });
    } catch (err) {
      console.error('Email not sent', err);
    }

    // Socket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('slot-booked', {
        doctorId,
        appointmentDate,
        timeSlot
      });
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name profilePhoto' },
      })
      .sort({ appointmentDate: 1, timeSlot: 1 });

    const grouped = {
      upcoming: [],
      past: [],
      cancelled: []
    };

    const now = new Date();

    appointments.forEach(app => {
      if (app.status === 'cancelled') {
        grouped.cancelled.push(app);
      } else if (new Date(app.appointmentDate) >= now || app.status === 'pending' || app.status === 'confirmed') {
        grouped.upcoming.push(app);
      } else {
        grouped.past.push(app);
      }
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile required' });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone profilePhoto bloodGroup dateOfBirth gender')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    // Ensure authorized to cancel
    if (appointment.patientId.toString() !== req.user.id) {
       // if not patient, check if doctor is canceling it
       const doctor = await Doctor.findOne({ userId: req.user.id });
       if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
           return res.status(403).json({ success: false, message: 'Not authorized' });
       }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.completeAppointment = async (req, res, next) => {
  try {
    const { prescription, notes, diagnosis } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'completed';
    appointment.prescription = prescription;
    appointment.notes = notes;
    appointment.diagnosis = diagnosis;
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment || appointment.patientId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Not found or auth error' });
    }

    // Checking if 48 hours before
    const appDate = new Date(appointment.appointmentDate);
    const timeDiff = appDate.getTime() - new Date().getTime();
    if (timeDiff < 48 * 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Reschedule allowed only 48 hours before' });
    }

    appointment.appointmentDate = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'pending';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentDetails = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone profilePhoto')
      .populate({
         path: 'doctorId',
         populate: { path: 'userId', select: 'name email phone' }
      });

    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
