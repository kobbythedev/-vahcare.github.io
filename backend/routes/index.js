const express = require('express');
const router = express.Router();

// Import route modules
const jobRoutes = require('./jobs');
const contactRoutes = require('./contact');
const applicationRoutes = require('./applications');

// Mount routes
router.use('/jobs', jobRoutes);
router.use('/contact', contactRoutes);
router.use('/applications', applicationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VAH Care API is running',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to VAH Care API',
    version: '1.0.0',
    endpoints: {
      jobs: '/api/jobs',
      contact: '/api/contact',
      applications: '/api/applications',
      health: '/api/health'
    }
  });
});

module.exports = router;
