const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob
} = require('../controllers/jobController');
const {
  validateJobApplication,
  validateJob,
  checkValidation
} = require('../middleware/validation');
const upload = require('../middleware/upload');

// Rate limiting for applications
const applyLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 applications per 15 minutes
  message: {
    success: false,
    error: 'Too many applications submitted. Please try again later.'
  }
});

// Public routes
router.route('/')
  .get(getJobs) // GET /api/jobs - Get all jobs with filtering
  .post(validateJob, checkValidation, createJob); // POST /api/jobs - Create job (admin)

router.route('/:id')
  .get(getJob) // GET /api/jobs/:id - Get single job
  .put(validateJob, checkValidation, updateJob) // PUT /api/jobs/:id - Update job (admin)
  .delete(deleteJob); // DELETE /api/jobs/:id - Delete job (admin)

// Multer error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files uploaded.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error.'
        });
    }
  }
  if (error.message === 'Only PDF and Word documents are allowed!') {
    return res.status(400).json({
      success: false,
      error: 'Only PDF and Word documents are allowed for CV upload.'
    });
  }
  next(error);
};

// Application route
router.post(
  '/apply',
  applyLimit,
  upload.single('cv'),
  handleMulterError,
  validateJobApplication,
  checkValidation,
  applyForJob
); // POST /api/jobs/apply - Submit job application

module.exports = router;
