const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load models
const User = require('../models/User');
const Doctor = require('../models/Doctor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const doctorsData = [
  { name: 'Demo Doctor', email: 'doctor.demo@medicare.test', spec: 'General Physician', exp: 10, fees: 500, gender: 'male' },
  { name: 'Amit Sharma', email: 'amit@example.com', spec: 'Cardiologist', exp: 10, fees: 800, gender: 'male' },
  { name: 'Priya Verma', email: 'priya@example.com', spec: 'Dermatologist', exp: 6, fees: 500, gender: 'female' },
  { name: 'Raj Mehta', email: 'raj@example.com', spec: 'Orthopedic', exp: 12, fees: 1000, gender: 'male' },
  { name: 'Neha Singh', email: 'neha@example.com', spec: 'Gynecologist', exp: 8, fees: 700, gender: 'female' },
  { name: 'Arjun Kapoor', email: 'arjun@example.com', spec: 'Neurologist', exp: 15, fees: 1200, gender: 'male' },
  { name: 'Sneha Patel', email: 'sneha@example.com', spec: 'Dentist', exp: 5, fees: 400, gender: 'female' },
  { name: 'Vikram Joshi', email: 'vikram@example.com', spec: 'General Physician', exp: 7, fees: 300, gender: 'male' },
  { name: 'Anjali Gupta', email: 'anjali@example.com', spec: 'Pediatrician', exp: 9, fees: 600, gender: 'female' },
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare');

    console.log('Connected to MongoDB...');

    // Optionally delete existing doctors to avoid duplicates
    await Doctor.deleteMany();
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing doctors...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    for (let i = 0; i < doctorsData.length; i++) {
        const docInfo = doctorsData[i];

        // 1. Create User first
        const user = await User.create({
            name: docInfo.name,
            email: docInfo.email,
            password: hashedPassword,
            role: 'doctor',
            phone: `987654321${i}`,
            profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(docInfo.name)}&background=0D8ABC&color=fff&size=200&bold=true`
        });

        // 2. Create Doctor profile
        await Doctor.create({
            userId: user._id,
            specialization: docInfo.spec,
            experience: docInfo.exp,
            consultationFee: docInfo.fees,
            hospitalName: 'Medicare City Hospital',
            hospitalAddress: 'Mumbai, MH',
            rating: parseFloat(((Math.random() * 1.5) + 3.5).toFixed(1)), // random rating 3.5 - 5.0
            totalReviews: Math.floor(Math.random() * 100) + 20,
            isApproved: true,
            availableSlots: [
                { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true }
            ]
        });
    }

    console.log('Dummy Doctor Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

function generateRandomStr() {
    return Math.random().toString(36).substring(7);
}

seedDoctors();
