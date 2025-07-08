const { body, validationResult } = require('express-validator');

// Validation for job application
const validateJobApplication = [
  body('jobId').trim().isLength({ min: 1 }).withMessage('Job ID is required'),
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('experience').isIn(['0-1', '1-3', '3-5', '5+']).withMessage('Please select a valid experience level'),
  body('availability').isIn(['immediately', '1month', '3months']).withMessage('Please select a valid availability option'),
  body('message').optional().trim().isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
];

// Validation for contact form
const validateContact = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('service').isIn(['home_care', 'specialized_service', 'staff_recruitment', 'other_enquiry']).withMessage('Please select a valid service'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
];

// Validation for job creation (admin)
const validateJob = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Job title must be between 5 and 200 characters'),
  body('location').isIn(['England', 'Wales']).withMessage('Location must be England or Wales'),
  body('specialty').isIn(['Health Assistant', 'Registered Nurse', 'Kitchen Assistant', 'House Keeper']).withMessage('Please select a valid specialty'),
  body('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Job description must be between 50 and 2000 characters'),
  body('salary').trim().isLength({ min: 1, max: 100 }).withMessage('Salary information is required')
];

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateJobApplication,
  validateContact,
  validateJob,
  checkValidation
};
