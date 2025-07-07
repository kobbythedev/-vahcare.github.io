const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import database connection
const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vahcare.co.uk', 'https://www.vahcare.co.uk']
    : ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded CVs) - only for development
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// API Routes
app.use('/api', require('./routes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 VAH Care API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'Development localhost'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
