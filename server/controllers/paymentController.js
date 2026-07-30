const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, appointmentId } = req.body; // Amount in INR

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      if (appointment.patientId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment', code: 'FORBIDDEN' });
      }
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json({ success: true, orderId: order.id, amount: options.amount });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId, signature, appointmentId } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret');
    shasum.update(`${orderId}|${paymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({ success: false, message: 'Transaction not legit!' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment', code: 'FORBIDDEN' });
    }

    appointment.paymentStatus = 'paid';
    appointment.paymentId = paymentId;
    appointment.status = 'confirmed'; // confirm implicitly upon payment
    await appointment.save();

    // Create DB Notification
    try {
      await Notification.create({
        userId: appointment.patientId,
        title: 'Payment Successful',
        message: `Payment of ₹${appointment.consultationFee} for appointment ref #${appointment._id.toString().slice(-8).toUpperCase()} was processed.`,
        type: 'payment',
        relatedId: appointment._id
      });
    } catch (e) {
      console.error('Failed to create payment notification', e);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('appointment-paid', {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

exports.processDemoPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment', code: 'FORBIDDEN' });
    }

    appointment.status = 'confirmed';
    appointment.paymentStatus = 'paid';
    appointment.paymentId = `demo_${Math.random().toString(36).substr(2, 9)}`;
    
    await appointment.save();

    // Create DB Notification
    try {
      await Notification.create({
        userId: appointment.patientId,
        title: 'Payment Successful',
        message: `Payment of ₹${appointment.consultationFee} for appointment ref #${appointment._id.toString().slice(-8).toUpperCase()} was processed.`,
        type: 'payment',
        relatedId: appointment._id
      });
    } catch (e) {
      console.error('Failed to create payment notification', e);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('appointment-paid', {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId
      });
    }

    res.json({
      success: true,
      data: appointment,
      message: 'Payment simulated successfully'
    });
  } catch (error) {
    next(error);
  }
};
