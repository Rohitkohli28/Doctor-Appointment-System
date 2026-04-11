const MedicalHistory = require('../models/MedicalHistory');
const Appointment = require('../models/Appointment');

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
    const historyRecords = await Appointment.find({ 
      patientId: req.user.id,
      status: { $in: ['confirmed', 'completed'] }
    })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name specialization' }
    })
    .sort({ appointmentDate: -1 });

    res.json({ success: true, data: historyRecords });
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
    // Doctor checking patient history
    // First confirm they have an appointment
    const appointments = await Appointment.find({
      doctorId: (await require('../models/Doctor').findOne({ userId: req.user.id }))._id,
      patientId: req.params.patientId,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!appointments || appointments.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized, no confirmed appointments' });
    }

    const history = await MedicalHistory.findOne({ patientId: req.params.patientId });
    if (!history) {
      return res.status(404).json({ success: false, message: 'History not found' });
    }

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
