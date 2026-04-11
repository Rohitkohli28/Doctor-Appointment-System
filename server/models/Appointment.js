const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM"
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['in-person', 'online'],
    required: true
  },
  consultationFee: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentId: { type: String }, // From Razorpay/Stripe
  symptoms: { type: String, required: true },
  notes: { type: String },
  prescription: { type: String },
  diagnosis: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
