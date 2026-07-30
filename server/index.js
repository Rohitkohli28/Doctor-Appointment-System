const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Trigger nodemon restart to load new .env variables
const app = express();

// Secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

// Parse cookies
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000'
].filter(Boolean);

const checkAllowedOrigin = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/\/$/, '');
  
  if (allowedOrigins.some(ao => ao && ao.replace(/\/$/, '') === cleanOrigin)) return true;
  if (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')) return true;
  if (/\.vercel\.app$/.test(cleanOrigin) || /\.netlify\.app$/.test(cleanOrigin) || /\.render\.com$/.test(cleanOrigin)) return true;
  
  return true; // Allow live site origins to prevent CORS blocks
};

const corsOptions = {
  origin: (origin, callback) => {
    if (checkAllowedOrigin(origin)) {
      callback(null, origin || true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, checkAllowedOrigin(origin) ? origin || true : true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// App level io integration
app.set('io', io);

// Body parser
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// Enable CORS
app.use(cors(corsOptions));

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Route files
const auth = require('./routes/auth');
const doctors = require('./routes/doctors');
const appointments = require('./routes/appointments');
const medicalHistory = require('./routes/medicalHistory');
const ai = require('./routes/ai');
const payments = require('./routes/payments');
const notifications = require('./routes/notifications');

// Base route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'MediCare API is running successfully!' });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/doctors', doctors);
app.use('/api/appointments', appointments);
app.use('/api/medical-history', medicalHistory);
app.use('/api/ai', ai);
app.use('/api/payments', payments);
app.use('/api/notifications', notifications);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  server.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  if (process.env.VERCEL !== '1') {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Export Express app for Vercel Serverless Functions
module.exports = app;

