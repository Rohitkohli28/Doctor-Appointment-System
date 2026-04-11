const { GoogleGenAI } = require('@google/genai');
const getGeminiSystemPrompt = require('../utils/geminiPrompt');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    // Gather context
    const specializations = await Doctor.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: "$specialization", avgFee: { $avg: "$consultationFee" }, count: { $sum: 1 } } }
    ]);
    
    const specData = specializations.map(s => ({
      specialization: s._id,
      averageFee: Math.round(s.avgFee),
      availableDoctors: s.count
    }));

    let userAppointments = [];
    if (req.user) {
      userAppointments = await Appointment.find({
        patientId: req.user.id,
        status: { $in: ['pending', 'confirmed'] }
      }).populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      }).limit(5);
    }

    const systemInstruction = getGeminiSystemPrompt(specData, req.user, userAppointments);

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const messages = conversationHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.parts[0].text }]
    }));
    
    // Add current message
    messages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ success: true, text: response.text() });
  } catch (error) {
    next(error);
  }
};
