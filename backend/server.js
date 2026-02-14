// require('dotenv').config();
// const express = require('express');
// const dns = require('dns');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const connectDB = require('./config/db');
// const { errorHandler } = require('./middleware/errorHandler');

// // Force using Google DNS to bypass local ISP resolution blocks
// dns.setServers(['8.8.8.8']);

// // Route imports
// const authRoutes = require('./routes/auth');
// const issueRoutes = require('./routes/issues');
// const adminRoutes = require('./routes/admin');
// const analyticsRoutes = require('./routes/analytics');

// // Initialize express
// const app = express();

// // Connect to database
// connectDB();

// // Security middleware
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // CORS configuration
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true
// }));

// // Rate limiting
// // const limiter = rateLimit({
// //     windowMs: 15 * 60 * 1000, // 15 minutes
// //     max: 500, // Increased from 100 to accommodate SPA traffic
// //     message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
// // });
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 1000, // allow more requests
//     message: {
//         success: false,
//         message: "Too many requests, please try again later"
//     }
// });

// app.use('/api', limiter);

// // Auth endpoints have stricter limits
// const authLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 200, // 200 requests per hour (Increased from 100 for development)
//     message: { message: 'Too many authentication attempts, please try again later' }
// });
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// // Body parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/issues', issueRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/analytics', analyticsRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//     res.json({
//         status: 'ok',
//         timestamp: new Date().toISOString(),
//         environment: process.env.NODE_ENV
//     });
// });

// // Root route
// app.get('/', (req, res) => {
//     res.json({
//         message: 'Welcome to Civic Engine API',
//         version: '1.0.0',
//         docs: '/api/health'
//     });
// });

// // Error handling middleware
// app.use(errorHandler);

// // Handle 404
// app.use((req, res) => {
//     res.status(404).json({ message: 'Route not found' });
// });

// // Start server
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`
// ╔═══════════════════════════════════════════════╗
// ║          CIVIC ENGINE API SERVER              ║
// ╠═══════════════════════════════════════════════╣
// ║  🚀 Server running on port ${PORT}               ║
// ║  📊 Environment: ${process.env.NODE_ENV || 'development'}             ║
// ║  🌐 API: http://localhost:${PORT}/api            ║
// ╚═══════════════════════════════════════════════╝
//   `);
// });

// module.exports = app;

require('dotenv').config();
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // ✅ Keep only this one
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Force using Google DNS to bypass local ISP resolution blocks
dns.setServers(['8.8.8.8']);

// Route imports
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// ======================
// Rate limiting
// ======================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
});

app.use('/api', limiter);

// Auth endpoints have stricter limits
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200,
    message: {
        message: 'Too many authentication attempts, please try again later',
    },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Civic Engine API',
        version: '1.0.0',
        docs: '/api/health',
    });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║          CIVIC ENGINE API SERVER              ║
╠═══════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}               
║  📊 Environment: ${process.env.NODE_ENV || 'development'}             
║  🌐 API: http://localhost:${PORT}/api            
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
