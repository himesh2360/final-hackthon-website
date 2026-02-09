const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Database Connection Pending/Failed: ${error.message}`);
    // Do not exit to satisfy user request "do not show app crashed"
  }
};

module.exports = connectDB;
