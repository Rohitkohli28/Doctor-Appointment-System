const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, default: '' },
  frequency: { type: String, default: '' },
  duration: { type: String, default: '' },
  instructions: { type: String, default: '' }
}, { _id: false });

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  symptoms: { type: String, default: '' },
  diagnosis: { type: String, required: true },
  prescriptions: [prescriptionSchema],
  doctorNotes: { type: String, default: '' },
  recommendedTests: [{ type: String }],
  medicalAdvice: { type: String, default: '' },
  followUpDate: { type: Date },
  followUpInstructions: { type: String, default: '' },
  consultationType: { type: String, enum: ['in-person', 'online'], default: 'in-person' }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
