const express = require("express");
const router = express.Router();
const { submitContactForm } = require("../controllers/contactController");
const { validateContact } = require("../middleware/validation");

// @route   POST /api/contact
// @desc    Submit contact form
router.post("/", validateContact, submitContactForm);

module.exports = router;
