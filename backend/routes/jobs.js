const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
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

// Application route
router.post(
  '/apply',
  applyLimit,
  upload.single('cv'),
  validateJobApplication,
  checkValidation,
  applyForJob
); // POST /api/jobs/apply - Submit job application

module.exports = router;
