const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
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
    const { 
      diagnosis, 
      prescriptions, 
      doctorNotes, 
      recommendedTests, 
      medicalAdvice, 
      followUpDate, 
      followUpInstructions,
      prescription, // legacy fallback
      notes // legacy fallback
    } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Format a legacy prescription string to preserve backwards compatibility
    let legacyPrescriptionStr = '';
    if (prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0) {
      legacyPrescriptionStr = prescriptions.map(p => 
        `- ${p.medicineName}: ${p.dosage || ''} | ${p.frequency || ''} | ${p.duration || ''}${p.instructions ? ` (${p.instructions})` : ''}`
      ).join('\n');
    } else {
      legacyPrescriptionStr = prescription || '';
    }

    appointment.status = 'completed';
    appointment.prescription = legacyPrescriptionStr;
    appointment.notes = doctorNotes || notes || '';
    appointment.diagnosis = diagnosis;
    await appointment.save();

    // Create or update detailed medical record
    let record = await MedicalRecord.findOne({ appointment: appointment._id });
    const recordData = {
      patient: appointment.patientId,
      doctor: doctor._id,
      appointment: appointment._id,
      symptoms: appointment.symptoms,
      diagnosis,
      prescriptions: prescriptions || [],
      doctorNotes: doctorNotes || notes || '',
      recommendedTests: recommendedTests || [],
      medicalAdvice: medicalAdvice || '',
      followUpDate: followUpDate || null,
      followUpInstructions: followUpInstructions || '',
      consultationType: appointment.type || 'in-person'
    };

    if (record) {
      record = await MedicalRecord.findOneAndUpdate({ appointment: appointment._id }, recordData, { new: true });
    } else {
      record = await MedicalRecord.create(recordData);
    }

    res.json({ success: true, data: appointment, record });
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

    // Authorization check: Patient, Doctor, or Admin
    const isPatient = appointment.patientId._id.toString() === req.user.id;
    
    // Find doctor profile if req.user is a doctor
    let isDoctor = false;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor && appointment.doctorId._id.toString() === doctor._id.toString()) {
        isDoctor = true;
      }
    }
    
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this appointment', code: 'FORBIDDEN' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
