const MedicalHistory = require('../models/MedicalHistory');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');

exports.getMyHistory = async (req, res, next) => {
  try {
    let history = await MedicalHistory.findOne({ patientId: req.user.id });
    if (!history) {
      history = await MedicalHistory.create({ patientId: req.user.id });
    }
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

exports.getMyHistoryRecords = async (req, res, next) => {
  try {
    // 1. Fetch detailed Medical Records
    const records = await MedicalRecord.find({ patient: req.user.id })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name specialization experience profilePhoto' }
      })
      .populate('appointment')
      .sort({ createdAt: -1 });

    // 2. Fetch completed/confirmed appointments for fallback virtual records
    const completedAppointments = await Appointment.find({
      patientId: req.user.id,
      status: 'completed'
    })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name specialization experience profilePhoto' }
    })
    .sort({ appointmentDate: -1 });

    const recordAppointmentIds = new Set(records.map(r => r.appointment?._id?.toString() || r.appointment?.toString()));
    const combinedRecords = [...records];

    completedAppointments.forEach(app => {
      if (!recordAppointmentIds.has(app._id.toString())) {
        combinedRecords.push({
          _id: `virtual_${app._id}`,
          patient: app.patientId,
          doctor: app.doctorId,
          appointment: app,
          symptoms: app.symptoms || '',
          diagnosis: app.diagnosis || 'Diagnosis is not yet added by the consulting doctor.',
          prescriptions: app.prescription ? [{ medicineName: 'Prescription', instructions: app.prescription }] : [],
          doctorNotes: app.notes || '',
          recommendedTests: [],
          medicalAdvice: '',
          followUpDate: null,
          followUpInstructions: '',
          consultationType: app.type || 'in-person',
          createdAt: app.updatedAt || app.createdAt,
          updatedAt: app.updatedAt || app.createdAt
        });
      }
    });

    combinedRecords.sort((a, b) => {
      const dateA = a.appointment?.appointmentDate ? new Date(a.appointment.appointmentDate) : new Date(a.createdAt);
      const dateB = b.appointment?.appointmentDate ? new Date(b.appointment.appointmentDate) : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json({ success: true, data: combinedRecords });
  } catch (error) {
    next(error);
  }
};

exports.upsertMyHistory = async (req, res, next) => {
  try {
    const data = req.body;
    
    let history = await MedicalHistory.findOne({ patientId: req.user.id });
    
    if (history) {
      history = await MedicalHistory.findOneAndUpdate({ patientId: req.user.id }, data, { new: true, runValidators: true });
    } else {
      data.patientId = req.user.id;
      history = await MedicalHistory.create(data);
    }
    
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const fileUrl = req.file.path; // Cloudinary URL
    
    const history = await MedicalHistory.findOne({ patientId: req.user.id });
    if (!history) return res.status(404).json({ success: false, message: 'History not found' });

    history.documents.push({
      title,
      fileUrl
    });

    await history.save();

    res.status(201).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

exports.removeDocument = async (req, res, next) => {
  try {
    const history = await MedicalHistory.findOne({ patientId: req.user.id });
    if (!history) return res.status(404).json({ success: false, message: 'History not found' });

    history.documents = history.documents.filter(doc => doc._id.toString() !== req.params.docId);
    
    await history.save();
    
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

exports.getPatientHistory = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Not authorized as a doctor' });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      patientId: req.params.patientId,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    if (!appointments || appointments.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized, no scheduled appointments' });
    }

    let profile = await MedicalHistory.findOne({ patientId: req.params.patientId });
    if (!profile) {
      profile = await MedicalHistory.create({ patientId: req.params.patientId });
    }

    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name specialization' }
      })
      .populate('appointment')
      .sort({ createdAt: -1 });

    const completedApps = await Appointment.find({
      patientId: req.params.patientId,
      status: 'completed'
    })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name specialization' }
    })
    .sort({ appointmentDate: -1 });

    const recordAppointmentIds = new Set(records.map(r => r.appointment?._id?.toString() || r.appointment?.toString()));
    const combinedRecords = [...records];

    completedApps.forEach(app => {
      if (!recordAppointmentIds.has(app._id.toString())) {
        combinedRecords.push({
          _id: `virtual_${app._id}`,
          patient: app.patientId,
          doctor: app.doctorId,
          appointment: app,
          symptoms: app.symptoms || '',
          diagnosis: app.diagnosis || 'Diagnosis is not yet added by the consulting doctor.',
          prescriptions: app.prescription ? [{ medicineName: 'Prescription', instructions: app.prescription }] : [],
          doctorNotes: app.notes || '',
          recommendedTests: [],
          medicalAdvice: '',
          followUpDate: null,
          followUpInstructions: '',
          consultationType: app.type || 'in-person',
          createdAt: app.updatedAt || app.createdAt,
          updatedAt: app.updatedAt || app.createdAt
        });
      }
    });

    combinedRecords.sort((a, b) => {
      const dateA = a.appointment?.appointmentDate ? new Date(a.appointment.appointmentDate) : new Date(a.createdAt);
      const dateB = b.appointment?.appointmentDate ? new Date(b.appointment.appointmentDate) : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json({ 
      success: true, 
      profile,
      records: combinedRecords
    });
  } catch (error) {
    next(error);
  }
};
