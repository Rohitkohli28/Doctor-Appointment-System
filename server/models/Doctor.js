const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "17:00"
  slotDuration: { type: Number, default: 30 }, // in minutes
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  qualifications: [{ type: String }],
  experience: { type: Number, required: true },
  hospitalName: { type: String },
  hospitalAddress: { type: String },
  consultationFee: { type: Number, required: true },
  availableSlots: [slotSchema],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  languages: [{ type: String }],
  about: { type: String },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
