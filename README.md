# 🏥 MediCare - Doctor Appointment System

MediCare is a comprehensive full-stack healthcare platform designed to bridge the gap between patients and healthcare providers. It offers a seamless experience for finding doctors, booking appointments, managing medical history, and even includes an AI-powered health assistant.

![MediCare Preview](https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000)

## 🌟 Key Features

### 👤 For Patients
- **Doctor Discovery**: Search and filter doctors by specialization, rating, or fee.
- **Smart Booking**: Choose available time slots and book appointments instantly.
- **Medical History**: A digital vault for all your diagnoses, prescriptions, and medical records.
- **AI Assistant**: A Gemini-powered health assistant to answer your medical queries.
- **Secure Payments**: Integrated Razorpay for hassle-free consultation fee payments.
- **Real-time Notifications**: Immediate updates on appointment status.

### 👨‍⚕️ For Doctors
- **Dashboard**: Manage upcoming, past, and cancelled appointments.
- **Patient Records**: Access and update patient medical history during consultations.
- **Profile Management**: Update practice details, fees, and availability slots.

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**: For a lightning-fast user interface.
- **Tailwind CSS**: Modern styling with a premium "Glassmorphism" feel.
- **Lucide React**: For beautiful, consistent iconography.
- **React Query & Axios**: Robust data fetching and state management.
- **Framer Motion**: Smooth animations and transitions.

### Backend
- **Node.js & Express**: Scalable server-side architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database for medical records.
- **JWT & Bcrypt**: Secure authentication and password hashing.
- **Gemini AI**: Advanced AI integration for health assistance.
- **Socket.io**: Real-time communication for instant updates.
- **Nodemailer**: Email notifications for appointments.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance
- Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rohitkohli28/Doctor-Appointment-System.git
   cd Doctor-Appointment-System
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory (use `.env.example` as a template):
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   ```

3. **Client Setup**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd client
   npm run dev
   ```

## 🛡️ Security
- Environment variables are protected and never committed to GitHub.
- Secure password hashing using Bcrypt.
- Protected API routes using JWT middleware.

## 📄 License
This project is licensed under the MIT License.

---
Built with ❤️ by [Rohit Kohli](https://github.com/Rohitkohli28)
