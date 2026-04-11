const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, appointmentId } = req.body; // Amount in INR

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

    appointment.paymentStatus = 'paid';
    appointment.paymentId = paymentId;
    appointment.status = 'confirmed'; // confirm implicitly upon payment
    await appointment.save();

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

    appointment.status = 'confirmed';
    appointment.paymentStatus = 'paid';
    appointment.paymentId = `demo_${Math.random().toString(36).substr(2, 9)}`;
    
    await appointment.save();

    res.json({
      success: true,
      data: appointment,
      message: 'Payment simulated successfully'
    });
  } catch (error) {
    next(error);
  }
};
