const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in environment variables!');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
