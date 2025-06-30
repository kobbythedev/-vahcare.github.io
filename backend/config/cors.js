// ==================== config/cors.js ====================
const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'https://your-frontend-domain.com', // Replace with your actual domain
      'https://your-client-domain.com'    // Replace with client's domain
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    const message = `The CORS policy for this origin doesn't allow access from the particular origin: ${origin}`;
    return callback(new Error(message), false);
  },

  // Allow specific HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

  // Allow specific headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight response caching (in seconds)
  maxAge: 86400, // 24 hours

  // Include successful CORS response headers in error responses
  optionsSuccessStatus: 200
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Custom CORS error handler
const corsErrorHandler = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'This origin is not allowed to access this resource',
      origin: req.get('origin') || 'unknown'
    });
  }
  next(err);
};

// Development CORS (allows all origins)
const devCorsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Export appropriate CORS configuration based on environment
module.exports = {
  corsMiddleware: process.env.NODE_ENV === 'development' ? cors(devCorsOptions) : corsMiddleware,
  corsErrorHandler,
  corsOptions: process.env.NODE_ENV === 'development' ? devCorsOptions : corsOptions
};
