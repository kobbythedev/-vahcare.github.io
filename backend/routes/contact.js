const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  submitContact,
  getContacts,
  updateContactStatus
} = require('../controllers/contactController');
const {
  validateContact,
  checkValidation
} = require('../middleware/validation');

// Rate limiting for contact form
const contactLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 contact submissions per 15 minutes
  message: {
    success: false,
    error: 'Too many contact requests. Please try again later.'
  }
});

// Public route - Submit contact form
router.post(
  '/',
  contactLimit,
  validateContact,
  checkValidation,
  submitContact
); // POST /api/contact - Submit contact form

// Admin routes - Get and manage contacts
router.get('/', getContacts); // GET /api/contact - Get all contacts (admin)
router.put('/:id', updateContactStatus); // PUT /api/contact/:id - Update contact status (admin)

module.exports = router;
