const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const medicalHistorySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: { type: String },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  pastSurgeries: [{
    name: String,
    date: Date,
    hospital: String
  }],
  familyHistory: { type: String },
  documents: [medicalDocumentSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to update lastUpdated
medicalHistorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
