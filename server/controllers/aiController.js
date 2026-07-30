const { GoogleGenerativeAI } = require('@google/generative-ai');
const getGeminiSystemPrompt = require('../utils/geminiPrompt');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    // Gather full database context
    const allDoctors = await Doctor.find({ isApproved: true }).populate('userId', 'name email phone');

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

    const systemInstruction = getGeminiSystemPrompt(specData, req.user, userAppointments, allDoctors);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 10 && apiKey !== 'your_gemini_api_key_here') {
      const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro'];
      const genAI = new GoogleGenerativeAI(apiKey.trim());

      const fullPrompt = `${systemInstruction}\n\nUser Question: ${message}`;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction
          });

          const contents = [];
          for (const m of conversationHistory) {
            const role = m.role === 'user' ? 'user' : 'model';
            const text = m.parts?.[0]?.text || m.text || '';
            if (text) {
              contents.push({ role, parts: [{ text }] });
            }
          }
          contents.push({ role: 'user', parts: [{ text: message }] });

          const result = await model.generateContent(contents);
          const responseText = result.response?.text();
          
          if (responseText && responseText.trim().length > 0) {
            return res.json({ success: true, text: responseText });
          }
        } catch (mErr) {
          console.warn(`Gemini model ${modelName} notice:`, mErr.message);

          try {
            const fallbackModel = genAI.getGenerativeModel({ model: modelName });
            const result = await fallbackModel.generateContent(fullPrompt);
            const responseText = result.response?.text();

            if (responseText && responseText.trim().length > 0) {
              return res.json({ success: true, text: responseText });
            }
          } catch (e2) {
            console.warn(`Gemini text prompt fallback notice:`, e2.message);
          }
        }
      }
    }

    // Fallback: Intelligent MediBot Engine with Doctor Lookup
    const fallbackText = getFallbackMedicalResponse(message, specData, userAppointments, allDoctors);
    return res.json({ success: true, text: fallbackText });

  } catch (error) {
    console.error("AI Controller Error:", error);
    res.json({
      success: true,
      text: "I am MediBot! How can I assist you with doctor recommendations, doctor availability, or booking appointments today?"
    });
  }
};

function getFallbackMedicalResponse(message, specData, userAppointments, doctors = []) {
  const msg = message.toLowerCase().trim();

  // 1. Doctor Name Specific Search
  if (doctors.length > 0) {
    for (const doc of doctors) {
      const docName = (doc.userId?.name || '').toLowerCase();
      if (docName && (msg.includes(docName) || docName.split(' ').some(part => part.length > 3 && msg.includes(part)))) {
        const fullDocName = doc.userId?.name || 'Doctor';
        const activeDays = doc.availableSlots?.filter(s => s.isAvailable).map(s => s.day).join(', ') || 'Monday, Tuesday, Wednesday';
        const timeSlot = doc.availableSlots?.find(s => s.isAvailable);
        const hours = timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : '10:00 - 18:00';
        
        return `Yes! Dr. ${fullDocName} is an active medical practitioner on MediCare 😊\n\n` +
               `• **Specialization**: ${doc.specialization}\n` +
               `• **Experience**: ${doc.experience} Years\n` +
               `• **Consultation Fee**: ₹${doc.consultationFee}\n` +
               `• **Hospital**: ${doc.hospitalName || 'Medicare City Hospital'}\n` +
               `• **Available Days**: ${activeDays} (${hours})\n\n` +
               `Would you like to book a consultation slot with Dr. ${fullDocName}? Click 'Find Doctors' to view available slots!`;
      }
    }
  }

  // 2. Comprehensive Medical Domain Knowledge Matrix
  const medicalKnowledgeMap = [
    {
      keywords: ['fever', 'temperature', 'chills', 'flu', 'viral', 'body ache', 'shivering'],
      title: '🌡️ Fever & Infection Guidance',
      specialty: 'General Physician',
      advice: [
        'Stay well-hydrated by drinking water, warm soups, or ORS fluids.',
        'Get plenty of rest to help your immune system fight off the infection.',
        'Apply a cool water compress to your forehead if temperature is high.'
      ],
      warning: 'If fever exceeds 101°F (38.3°C) or persists for over 48 hours, please consult a General Physician.'
    },
    {
      keywords: ['headache', 'migraine', 'head pain', 'throbbing', 'temple pain'],
      title: '🤕 Headache & Migraine Care',
      specialty: 'Neurologist or General Physician',
      advice: [
        'Rest in a quiet, dimly lit, and well-ventilated room.',
        'Hydrate immediately with water or electrolyte fluids.',
        'Gently apply a cold pack or warm compress to your neck or forehead.'
      ],
      warning: 'If headaches are severe, sudden, or accompanied by vision changes or numbness, consult a Neurologist promptly.'
    },
    {
      keywords: ['cough', 'cold', 'sore throat', 'throat', 'sneezing', 'runny nose', 'phlegm', 'congestion'],
      title: '😷 Cough, Cold & Respiratory Relief',
      specialty: 'ENT Specialist or General Physician',
      advice: [
        'Gargle with warm salt water 2-3 times daily for sore throat relief.',
        'Inhale steam to ease nasal congestion and airway tightness.',
        'Drink warm herbal teas with honey or ginger.'
      ],
      warning: 'If you experience short breath, persistent wheezing, or cough over 7 days, please consult a specialist.'
    },
    {
      keywords: ['stomach', 'acidity', 'gas', 'indigestion', 'nausea', 'vomit', 'diarrhea', 'constipation', 'gut', 'abdominal', 'cramps'],
      title: '🤢 Stomach & Gastrointestinal Care',
      specialty: 'Gastroenterologist or General Physician',
      advice: [
        'Follow a gentle BRAT diet (Bananas, Rice, Applesauce, Toast).',
        'Avoid spicy, fried, acidic, and caffeinated beverages.',
        'Sip warm water slowly to soothe stomach lining.'
      ],
      warning: 'If stomach pain is acute, sharp, or accompanied by blood in stool/vomit, seek immediate medical attention.'
    },
    {
      keywords: ['heart', 'cardio', 'chest pain', 'palpitations', 'high bp', 'blood pressure', 'hypertension'],
      title: '❤️ Cardiac & Heart Health Care',
      specialty: 'Cardiologist',
      advice: [
        'Sit comfortably, relax, and take deep, slow breaths.',
        'Avoid intense physical exertion or high sodium/fat foods.',
        'Keep a daily log of blood pressure readings if monitored.'
      ],
      warning: '⚠️ EMERGENCY: Sudden heavy chest pressure or radiating pain to arm/jaw requires emergency medical care!'
    },
    {
      keywords: ['skin', 'rash', 'acne', 'itching', 'allergy', 'eczema', 'dermatitis', 'hives', 'spots'],
      title: '✨ Skin & Dermatology Care',
      specialty: 'Dermatologist',
      advice: [
        'Wash affected area gently with mild, unscented cleanser.',
        'Avoid scratching or picking at skin lesions or rashes.',
        'Apply soothing aloe vera or hypoallergenic moisturizer.'
      ],
      warning: 'If rash spreads rapidly or causes severe swelling, consult a Dermatologist.'
    },
    {
      keywords: ['bone', 'joint', 'back pain', 'knee', 'spine', 'fracture', 'arthritis', 'muscle', 'sprain', 'shoulder'],
      title: '🦴 Orthopedic & Musculoskeletal Care',
      specialty: 'Orthopedic Specialist',
      advice: [
        'Apply R.I.C.E protocol (Rest, Ice for acute pain, Compression, Elevation).',
        'Avoid heavy lifting or sudden twisting movements.',
        'Perform light stretching under medical guidance.'
      ],
      warning: 'If pain persists over a week or joint swelling limits mobility, consult an Orthopedic doctor.'
    },
    {
      keywords: ['nerve', 'numbness', 'tingling', 'dizziness', 'vertigo', 'seizure', 'paralysis'],
      title: '🧠 Neurological & Nerve Health',
      specialty: 'Neurologist',
      advice: [
        'Avoid sudden head position changes if experiencing dizziness.',
        'Maintain good spinal posture while sitting and sleeping.',
        'Ensure 7-8 hours of restful sleep daily.'
      ],
      warning: 'Sudden weakness on one side of the face or body requires urgent medical evaluation.'
    },
    {
      keywords: ['women', 'period', 'pregnancy', 'pcos', 'menstrual', 'cramps', 'gynaec'],
      title: '👩‍⚕️ Gynecology & Women Health',
      specialty: 'Gynecologist',
      advice: [
        'Use warm heating pads for menstrual pain relief.',
        'Maintain balanced hydration and iron-rich diet.',
        'Track your cycle regularly.'
      ],
      warning: 'Consult a Gynecologist for irregular cycles, severe abdominal pain, or maternal checkups.'
    },
    {
      keywords: ['child', 'baby', 'pediatric', 'infant', 'kid'],
      title: '👶 Pediatric Child Care',
      specialty: 'Pediatrician',
      advice: [
        'Keep infants hydrated with fluids/breastmilk.',
        'Monitor temperature regularly using a digital thermometer.',
        'Ensure child immunizations are up to date.'
      ],
      warning: 'Always consult a certified Pediatrician for dosages or fever in young children.'
    },
    {
      keywords: ['tooth', 'teeth', 'gum', 'dental', 'cavity', 'mouth'],
      title: '🦷 Dental & Oral Health Care',
      specialty: 'Dentist',
      advice: [
        'Rinse gently with warm salt water for gum irritation.',
        'Brush twice daily with fluoride toothpaste.',
        'Avoid sugary drinks and hard chewing.'
      ],
      warning: 'Consult a Dentist for toothache, swelling, or bleeding gums.'
    },
    {
      keywords: ['stress', 'anxiety', 'depression', 'insomnia', 'sleep', 'mental', 'panic'],
      title: '🧠 Mental Health & Wellness',
      specialty: 'Psychiatrist or Counselor',
      advice: [
        'Practice 4-7-8 deep breathing exercises.',
        'Maintain a consistent sleep routine without screens before bed.',
        'Engage in outdoor walks and mindfulness.'
      ],
      warning: 'Reach out to a qualified Mental Health Professional or hotline if feeling overwhelmed.'
    },
    {
      keywords: ['diabetes', 'sugar', 'thyroid', 'hormone', 'weight loss', 'fatigue'],
      title: '🩸 Metabolic & Endocrine Health',
      specialty: 'Endocrinologist or General Physician',
      advice: [
        'Monitor blood glucose levels as advised.',
        'Eat fiber-rich meals with low glycemic index foods.',
        'Maintain regular daily physical activity.'
      ],
      warning: 'Consult an Endocrinologist for blood sugar management or thyroid disorders.'
    }
  ];

  // 3. Match Knowledge Matrix
  for (const item of medicalKnowledgeMap) {
    if (item.keywords.some(k => msg.includes(k))) {
      // Find matching doctors in database for this specialty
      const matchedDocs = doctors.filter(d => {
        const spec = (d.specialization || '').toLowerCase();
        return item.keywords.some(k => spec.includes(k)) || spec.includes(item.specialty.toLowerCase().split(' ')[0]);
      });

      const docListStr = matchedDocs.length > 0 
        ? `\n\n👨‍⚕️ **Recommended Doctors on MediCare:**\n` + matchedDocs.map(d => `• **Dr. ${d.userId?.name}** (${d.specialization}, ${d.experience} yrs exp) - Fee: ₹${d.consultationFee}`).join('\n')
        : `\n\n👨‍⚕️ **Recommended Specialist:** We have verified **${item.specialty}** doctors available on MediCare!`;

      return `${item.title}\n\n` +
             `**Care Guidance:**\n` +
             item.advice.map((a, i) => `${i + 1}. ${a}`).join('\n') + `\n\n` +
             `⚠️ **Medical Notice:** ${item.warning}` +
             docListStr + `\n\n` +
             `Click **Find Doctors** in the navigation menu to book an appointment slot!`;
    }
  }

  // 4. Platform Navigation / Booking Questions
  if (msg.includes('appoint') || msg.includes('book') || msg.includes('slot') || msg.includes('fee') || msg.includes('price')) {
    return "📅 **Booking an Appointment on MediCare:**\n\n" +
           "1. Click **Find Doctors** in the top navigation bar.\n" +
           "2. Filter by specialization or search by doctor name.\n" +
           "3. Click **Book Appointment** & select an available date & time slot.\n" +
           "4. Confirm booking details & complete instant payment.\n\n" +
           "Your appointment confirmation and prescription receipt will be generated instantly!";
  }

  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('hii')) {
    return "Hello! I am MediBot, your AI healthcare assistant 👋\n\nHow can I help you today? You can ask me about:\n• Any medical problem or symptom (*e.g. fever, headache, back pain, chest tightness, skin rash, diabetes*)\n• Doctor availability (*e.g. 'Is Dr. Priya Verma available?'*)\n• How to book appointments or download medical reports";
  }

  // 5. Universal Dynamic Generative Responder for any arbitrary query
  const cleanMsg = message.replace(/[^a-zA-Z0-9 ]/g, '');
  return `🩺 **MediBot Medical Guidance for "${cleanMsg}":**\n\n` +
         `Thank you for reaching out. Based on your query regarding **"${cleanMsg}"**, here is general healthcare advice:\n\n` +
         `1. **Monitoring**: Track the duration and intensity of any symptoms you are experiencing.\n` +
         `2. **Self-Care**: Ensure proper hydration, balanced nutrition, and adequate physical rest.\n` +
         `3. **Professional Evaluation**: For persistent or concerning health symptoms, a professional clinical consultation is recommended.\n\n` +
         `👨‍⚕️ **Find a Specialist:** You can browse our verified doctors across all medical specializations (Cardiology, Dermatology, Neurology, Orthopedics, General Medicine, Pediatrics) under the **Find Doctors** section to book a consultation!`;
}
