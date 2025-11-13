const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/did', require('./routes/did'));
app.use('/api/users', require('./routes/users'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DigiLocker Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'DigiLocker API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile'
      },
      did: {
        generate: 'POST /api/did/generate',
        verify: 'GET /api/did/verify/:did',
        getMyDID: 'GET /api/did/me',
        getByWallet: 'GET /api/did/wallet/:walletAddress',
        revoke: 'POST /api/did/revoke'
      },
      users: {
        documents: 'GET /api/users/documents',
        stats: 'GET /api/users/stats'
      }
    }
  });
});

// Handle undefined routes - FIXED VERSION
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💡 Using mock blockchain mode - DIDs stored in memory`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;