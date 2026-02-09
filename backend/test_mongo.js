require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    .then(() => {
        console.log('✅ SUCCESS: MongoDB connected!');
        process.exit(0);
    })
    .catch((err) => {
        console.log('❌ FAILED:', err.message);
        console.log('Full error:', err);
        process.exit(1);
    });
