const Job = require('../models/Job');
const Application = require('../models/Application');
const upload = require('../middleware/upload');
const mongoose = require('mongoose');
const { sendEmail } = require('../config/email');
const fs = require('fs');
const path = require('path');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable. Please try again later.'
      });
    }
    
    const { location, specialty, page = 1, limit = 10 } = req.query;
    
    // Build filter object for MongoDB
    const filter = {};
    if (location && location !== 'all') {
      filter.location = new RegExp(location, 'i');
    }
    if (specialty && specialty !== 'all') {
      filter.specialty = new RegExp(specialty, 'i');
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Job.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable. Please try again later.'
      });
    }
    
    // Validate ObjectId format for database operations
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Admin)
const createJob = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
const updateJob = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job ID format'
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin)
const deleteJob = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job ID format'
      });
    }

    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit job application
// @route   POST /api/jobs/apply
// @access  Public
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, fullName, email, experience, availability, message } = req.body;

    let job;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Validate jobId format for database operations
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid job ID format'
        });
      }
      
      // Check if job exists in database
      job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }
    } else {
      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable. Please try again later.'
      });
    }

    // Check if CV file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CV file is required'
      });
    }

    // Create application
    let application;
    
    if (mongoose.connection.readyState === 1) {
      // Create application in database
      application = await Application.create({
        jobId,
        fullName,
        email,
        experience,
        availability,
        cvPath: req.file.path,
        message
      });
    } else {
      // Create mock application when database is not available
      application = {
        _id: Date.now().toString(),
        jobId,
        fullName,
        email,
        experience,
        availability,
        cvPath: req.file.path,
        message,
        appliedAt: new Date(),
        status: 'pending'
      };
      
      console.log('💼 Job application submitted (DB offline):', {
        applicationId: application._id,
        jobTitle: job.title,
        fullName,
        email,
        experience,
        timestamp: new Date().toISOString()
      });
    }

    // Send confirmation email to applicant (non-blocking)
    try {
      const { sendApplicationConfirmation, sendAdminNotification } = require('../config/email');
      await sendApplicationConfirmation(email, fullName, job.title, application._id);
    } catch (emailError) {
      console.log('⚠️  Failed to send confirmation email:', emailError.message);
    }

    // Send notification email to admin (non-blocking)
    try {
      const { sendAdminNotification } = require('../config/email');
      await sendAdminNotification({
        applicantName: fullName,
        applicantEmail: email,
        jobTitle: job.title,
        experience,
        availability,
        applicationId: application._id
      });
    } catch (emailError) {
      console.log('⚠️  Failed to send admin notification:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        jobTitle: job.title
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to load and replace placeholders in email templates
const loadEmailTemplate = (templateName, placeholders) => {
  try {
    const templatePath = path.join(__dirname, '../templates', templateName);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders with actual values
    Object.keys(placeholders).forEach(key => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), placeholders[key]);
    });
    
    return template;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    // Fallback to basic HTML if template loading fails
    return `<h2>Email Content</h2><p>Template loading failed</p>`;
  }
};

// Send application confirmation email
const sendApplicationConfirmation = async (email, name, jobTitle) => {
  try {
    const htmlContent = loadEmailTemplate('application-confirmation.html', {
      fullName: name,
      jobTitle: jobTitle
    });
    
    await sendEmail({
      to: email,
      subject: `Application Received - ${jobTitle}`,
      html: htmlContent
    });
  } catch (error) {
    console.error('Error sending application confirmation email:', error);
    throw error;
  }
};

// Send application notification to admin
const sendApplicationNotification = async (application, job) => {
  try {
    const htmlContent = loadEmailTemplate('application-notification.html', {
      jobTitle: job.title,
      fullName: application.fullName,
      email: application.email,
      experience: application.experience,
      availability: application.availability,
      message: application.message || 'No message provided',
      cvPath: application.cvPath,
      appliedAt: application.appliedAt
    });
    
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Job Application - ${job.title}`,
      html: htmlContent
    });
  } catch (error) {
    console.error('Error sending application notification email:', error);
    throw error;
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob
};
