const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, service, message } = req.body;

    let contact;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Create contact entry in database
      contact = await Contact.create({
        name,
        email,
        phone,
        service,
        message
      });
    } else {
      // Create mock contact object when database is not available
      contact = {
        _id: Date.now().toString(),
        name,
        email,
        phone,
        service,
        message,
        submittedAt: new Date(),
        status: 'new'
      };
      
      console.log('📝 Contact form submitted (DB offline):', {
        name,
        email,
        service,
        message: message.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
    }

    // Send confirmation email to user (non-blocking)
    try {
      await sendContactConfirmation(email, name, service);
    } catch (emailError) {
      console.log('⚠️  Failed to send confirmation email:', emailError.message);
    }

    // Send notification email to admin (non-blocking)
    try {
      await sendContactNotification(contact);
    } catch (emailError) {
      console.log('⚠️  Failed to send admin notification:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will contact you soon.',
      data: {
        contactId: contact._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contacts
// @access  Private (Admin)
const getContacts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status
// @route   PUT /api/contacts/:id
// @access  Private (Admin)
const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send contact confirmation email
const sendContactConfirmation = async (email, name, service) => {
  const serviceNames = {
    'home_care': 'Home Care',
    'specialized_service': 'Specialized Service',
    'staff_recruitment': 'Staff Recruitment',
    'other_enquiry': 'General Inquiry'
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `Thank you for contacting VAH Care - ${serviceNames[service]}`,
    html: `
      <h2>Thank you for your inquiry!</h2>
      <p>Dear ${name},</p>
      <p>We have received your inquiry regarding <strong>${serviceNames[service]}</strong>.</p>
      <p>Our team will review your message and contact you within 24 hours during business hours.</p>
      <p>If you have any urgent concerns, please call us at 02046176170.</p>
      <p>Best regards,<br>VAH Care Team</p>
      <hr>
      <p><small>VAH Care - Transforming lives through compassionate care and unmatched recruitment expertise.</small></p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send contact notification to admin
const sendContactNotification = async (contact) => {
  const serviceNames = {
    'home_care': 'Home Care',
    'specialized_service': 'Specialized Service',
    'staff_recruitment': 'Staff Recruitment',
    'other_enquiry': 'General Inquiry'
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission - ${serviceNames[contact.service]}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
      <p><strong>Service:</strong> ${serviceNames[contact.service]}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
      <p><strong>Submitted At:</strong> ${contact.submittedAt}</p>
      <hr>
      <p>Please respond to this inquiry within 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  submitContact,
  getContacts,
  updateContactStatus
};
