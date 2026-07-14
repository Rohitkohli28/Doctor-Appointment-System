const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load models
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const MedicalHistory = require('../models/MedicalHistory');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const doctorsList = [
  { name: 'Amit Sharma',      email: 'amit.sharma@medicare.com',      gender: 'male',   spec: 'Cardiologist',       quals: ['MBBS', 'MD Cardiology', 'DM'],    exp: 14, fees: 1200, hospital: 'Fortis Heart Institute',         city: 'New Delhi' },
  { name: 'Priya Verma',      email: 'priya.verma@medicare.com',      gender: 'female', spec: 'Dermatologist',      quals: ['MBBS', 'MD Dermatology'],          exp: 8,  fees: 700,  hospital: 'Apollo Skin Clinic',             city: 'Mumbai, MH' },
  { name: 'Rajesh Mehta',     email: 'rajesh.mehta@medicare.com',     gender: 'male',   spec: 'Neurologist',        quals: ['MBBS', 'MD Neurology', 'DM'],     exp: 18, fees: 1500, hospital: 'NIMHANS',                        city: 'Bengaluru, KA' },
  { name: 'Sneha Patel',      email: 'sneha.patel@medicare.com',      gender: 'female', spec: 'Orthopedic',         quals: ['MBBS', 'MS Orthopedics'],          exp: 10, fees: 900,  hospital: 'Kokilaben Hospital',             city: 'Mumbai, MH' },
  { name: 'Vikram Joshi',     email: 'vikram.joshi@medicare.com',     gender: 'male',   spec: 'Pediatrician',       quals: ['MBBS', 'MD Pediatrics', 'DCH'],   exp: 12, fees: 600,  hospital: 'Rainbow Children Hospital',      city: 'Hyderabad, TS' },
  { name: 'Ananya Iyer',      email: 'ananya.iyer@medicare.com',      gender: 'female', spec: 'Psychiatrist',       quals: ['MBBS', 'MD Psychiatry'],           exp: 9,  fees: 1000, hospital: 'Manas Mental Health Centre',     city: 'Chennai, TN' },
  { name: 'Deepak Reddy',     email: 'deepak.reddy@medicare.com',     gender: 'male',   spec: 'Gynaecologist',      quals: ['MBBS', 'MS OBG', 'DNB'],          exp: 15, fees: 800,  hospital: 'Cloudnine Hospital',             city: 'Bengaluru, KA' },
  { name: 'Kavita Singh',     email: 'kavita.singh@medicare.com',     gender: 'female', spec: 'Dentist',            quals: ['BDS', 'MDS Orthodontics'],         exp: 6,  fees: 500,  hospital: 'Clove Dental',                   city: 'Jaipur, RJ' },
  { name: 'Arjun Kapoor',     email: 'arjun.kapoor@medicare.com',     gender: 'male',   spec: 'ENT',                quals: ['MBBS', 'MS ENT'],                  exp: 11, fees: 750,  hospital: 'Max Super Speciality',           city: 'New Delhi' },
  { name: 'Nisha Gupta',      email: 'nisha.gupta@medicare.com',      gender: 'female', spec: 'General Physician',  quals: ['MBBS', 'MD General Medicine'],     exp: 7,  fees: 400,  hospital: 'Medanta - The Medicity',         city: 'Gurugram, HR' },
  { name: 'Suresh Kumar',     email: 'suresh.kumar@medicare.com',     gender: 'male',   spec: 'Cardiologist',       quals: ['MBBS', 'MD', 'DM Cardiology'],    exp: 20, fees: 1400, hospital: 'AIIMS',                          city: 'New Delhi' },
  { name: 'Meera Nair',       email: 'meera.nair@medicare.com',       gender: 'female', spec: 'Dermatologist',      quals: ['MBBS', 'DVD', 'FRCP'],            exp: 13, fees: 900,  hospital: 'Amrita Hospital',                city: 'Kochi, KL' },
  { name: 'Rohit Saxena',     email: 'rohit.saxena@medicare.com',     gender: 'male',   spec: 'Neurologist',        quals: ['MBBS', 'MD', 'DM Neurology'],     exp: 16, fees: 1300, hospital: 'Sir Ganga Ram Hospital',         city: 'New Delhi' },
  { name: 'Pooja Deshmukh',   email: 'pooja.deshmukh@medicare.com',   gender: 'female', spec: 'Orthopedic',         quals: ['MBBS', 'DNB Orthopedics'],         exp: 9,  fees: 850,  hospital: 'Ruby Hall Clinic',               city: 'Pune, MH' },
  { name: 'Anil Chatterjee',  email: 'anil.chatterjee@medicare.com',  gender: 'male',   spec: 'Pediatrician',       quals: ['MBBS', 'MD Pediatrics'],           exp: 11, fees: 550,  hospital: 'Belle Vue Clinic',               city: 'Kolkata, WB' },
  { name: 'Ritu Aggarwal',    email: 'ritu.aggarwal@medicare.com',    gender: 'female', spec: 'Psychiatrist',       quals: ['MBBS', 'MD Psychiatry', 'DNB'],   exp: 14, fees: 1100, hospital: 'Fortis Mental Health',            city: 'Chandigarh' },
  { name: 'Karan Malhotra',   email: 'karan.malhotra@medicare.com',   gender: 'male',   spec: 'Gynaecologist',      quals: ['MBBS', 'MD OBG'],                  exp: 10, fees: 750,  hospital: 'Jaslok Hospital',                city: 'Mumbai, MH' },
  { name: 'Divya Krishnan',   email: 'divya.krishnan@medicare.com',   gender: 'female', spec: 'Dentist',            quals: ['BDS', 'MDS Prosthodontics'],       exp: 5,  fees: 450,  hospital: 'Sabka Dentist',                  city: 'Chennai, TN' },
  { name: 'Manish Tiwari',    email: 'manish.tiwari@medicare.com',    gender: 'male',   spec: 'ENT',                quals: ['MBBS', 'DNB ENT', 'FICS'],        exp: 17, fees: 950,  hospital: 'Narayana Health',                city: 'Bengaluru, KA' },
  { name: 'Shalini Dubey',    email: 'shalini.dubey@medicare.com',    gender: 'female', spec: 'General Physician',  quals: ['MBBS', 'MD Internal Medicine'],    exp: 8,  fees: 350,  hospital: 'KIMS Hospital',                  city: 'Hyderabad, TS' },
];

const patientsList = [
  { name: 'Rahul Bhatia',   email: 'rahul.bhatia@gmail.com',   gender: 'male',   phone: '9876543210' },
  { name: 'Simran Kaur',    email: 'simran.kaur@gmail.com',    gender: 'female', phone: '9876543211' },
  { name: 'Aditya Menon',   email: 'aditya.menon@gmail.com',   gender: 'male',   phone: '9876543212' },
  { name: 'Neha Srivastava',email: 'neha.srivastava@gmail.com',gender: 'female', phone: '9876543213' },
  { name: 'Varun Thakur',   email: 'varun.thakur@gmail.com',   gender: 'male',   phone: '9876543214' },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare', {
      tls: true,
      tlsAllowInvalidCertificates: true,
      connectTimeoutMS: 30000,
    });

    const seedEmails = [
      ...doctorsList.map(d => d.email),
      ...patientsList.map(p => p.email)
    ];

    // Only delete users that are in our seed list to preserve user's own data
    await User.deleteMany({ email: { $in: seedEmails } });
    
    // Delete doctors whose userId is now gone or who are in our seed list
    // A better way is to delete doctors where specialization exists (seeded) 
    // but for safety let's just delete seeded specialists
    await Doctor.deleteMany({ specialization: { $in: [...new Set(doctorsList.map(d => d.spec))] } });
    
    // For simplicity, we'll still refresh appointments/reviews/history 
    // as they are tightly coupled with the seeded users
    await Appointment.deleteMany();
    await Review.deleteMany();
    await MedicalHistory.deleteMany();

    console.log('Seed Data Refreshed (Preserving manual accounts)');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create patients
    const patientsToCreate = patientsList.map(p => ({
      name: p.name,
      email: p.email,
      password: hashedPassword,
      phone: p.phone,
      role: 'patient',
      gender: p.gender,
      profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff&size=200&bold=true`
    }));

    const createdPatients = await User.insertMany(patientsToCreate);

    // Create doctors
    const doctorsInfos = doctorsList.map(d => ({
      name: d.name,
      email: d.email,
      password: hashedPassword,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: 'doctor',
      gender: d.gender,
      profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=0D8ABC&color=fff&size=200&bold=true`
    }));

    const createdDoctorUsers = await User.insertMany(doctorsInfos);

    const doctorsProfiles = createdDoctorUsers.map((u, i) => {
        const d = doctorsList[i];
        return {
            userId: u._id,
            specialization: d.spec,
            qualifications: d.quals,
            experience: d.exp,
            hospitalName: d.hospital,
            hospitalAddress: d.city,
            consultationFee: d.fees,
            rating: parseFloat(((Math.random() * 1.5) + 3.5).toFixed(1)), // 3.5 to 5.0
            totalReviews: Math.floor(Math.random() * 150) + 10,
            isApproved: true,
            languages: ['English', 'Hindi', ...(d.city.includes('KA') ? ['Kannada'] : d.city.includes('TN') || d.city.includes('KL') ? ['Tamil'] : d.city.includes('MH') ? ['Marathi'] : d.city.includes('WB') ? ['Bengali'] : d.city.includes('TS') ? ['Telugu'] : [])],
            about: `Dr. ${d.name} is a highly experienced ${d.spec} with ${d.exp}+ years of practice at ${d.hospital}, ${d.city}. Known for exceptional patient care and advanced treatment methodologies.`,
            availableSlots: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
                day,
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30,
                isAvailable: true
            }))
        }
    });

    const doctors = await Doctor.insertMany(doctorsProfiles);

    // Create Appointments for patients
    const diagnoses = ['Seasonal Allergies', 'Hypertension Stage 1', 'Viral Fever', 'Migraine', 'Lower Back Pain', 'Mild Asthma', 'Skin Dermatitis', 'Iron Deficiency Anemia'];
    const prescriptions = [
      'Cetirizine 10mg once daily for 7 days',
      'Amlodipine 5mg once daily, low-sodium diet',
      'Paracetamol 500mg 3x/day for 5 days, rest and fluids',
      'Sumatriptan 50mg as needed, avoid bright lights',
      'Ibuprofen 400mg 2x/day for 10 days, physiotherapy',
      'Salbutamol inhaler 2 puffs as needed',
      'Hydrocortisone cream apply 2x/day for 2 weeks',
      'Ferrous Sulfate 325mg daily with Vitamin C'
    ];

    let appointmentsToCreate = [];
    for(let i=0; i< 50; i++) {
        const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        const types = ['in-person', 'online'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const futureDate = new Date();
        if (status === 'completed') {
            futureDate.setDate(futureDate.getDate() - Math.floor(Math.random() * 30) - 1);
        } else {
            futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30));
        }

        const appointmentData = {
            patientId: randomPatient._id,
            doctorId: randomDoctor._id,
            appointmentDate: futureDate,
            timeSlot: ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM'][Math.floor(Math.random() * 4)],
            status,
            type: types[Math.floor(Math.random() * types.length)],
            consultationFee: randomDoctor.consultationFee,
            symptoms: 'Fever and cold',
            paymentStatus: status === 'completed' ? 'paid' : (Math.random() > 0.5 ? 'paid' : 'pending')
        };

        if (status === 'completed') {
            appointmentData.diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            appointmentData.prescription = prescriptions[Math.floor(Math.random() * prescriptions.length)];
            appointmentData.notes = 'Follow up in 2 weeks if symptoms persist.';
        }

        appointmentsToCreate.push(appointmentData);
    }

    const createdAppointments = await Appointment.insertMany(appointmentsToCreate);

    // Create reviews for completed appointments
    const completedAppointments = createdAppointments.filter(a => a.status === 'completed');
    const reviewsToCreate = completedAppointments.map(app => ({
      patientId: app.patientId,
      doctorId: app.doctorId,
      appointmentId: app._id,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5
      comment: [
        'Very professional and caring doctor. Highly recommended!',
        'Great experience. The doctor was thorough and explained everything clearly.',
        'Good consultation. Felt heard and understood.',
        'Excellent treatment, feeling much better now.',
        'Punctual and knowledgeable. Will visit again.'
      ][Math.floor(Math.random() * 5)]
    }));

    if (reviewsToCreate.length > 0) {
      await Review.insertMany(reviewsToCreate);
      console.log(`${reviewsToCreate.length} reviews created`);
    }

    console.log('Sample Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
