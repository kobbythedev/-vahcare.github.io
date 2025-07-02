const Job = require('../models/Job');
const Application = require('../models/Application');
const upload = require('../middleware/upload');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { mockJobs } = require('../services/mockData');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { location, specialty, page = 1, limit = 10 } = req.query;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data when MongoDB is not connected
      let filteredJobs = [...mockJobs];
      
      // Apply filters
      if (location && location !== 'all') {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      if (specialty && specialty !== 'all') {
        filteredJobs = filteredJobs.filter(job => 
          job.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
      }
      
      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedJobs = filteredJobs.slice(skip, skip + parseInt(limit));
      
      return res.status(200).json({
        success: true,
        count: paginatedJobs.length,
        total: filteredJobs.length,
        page: parseInt(page),
        pages: Math.ceil(filteredJobs.length / limit),
        data: paginatedJobs,
        note: 'Using mock data - MongoDB not connected'
      });
    }
    
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
// @route   POST /api/jobs/:id/apply
// @access  Public
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, fullName, email, experience, availability, message } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
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
    const application = await Application.create({
      jobId,
      fullName,
      email,
      experience,
      availability,
      cvPath: req.file.path,
      message
    });

    // Send confirmation email to applicant
    await sendApplicationConfirmation(email, fullName, job.title);

    // Send notification email to admin
    await sendApplicationNotification(application, job);

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

// Send application confirmation email
const sendApplicationConfirmation = async (email, name, jobTitle) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `Application Received - ${jobTitle}`,
    html: `
      <h2>Thank you for your application!</h2>
      <p>Dear ${name},</p>
      <p>We have received your application for the position of <strong>${jobTitle}</strong>.</p>
      <p>Our team will review your application and contact you within 5-7 business days.</p>
      <p>Best regards,<br>VAH Care Recruitment Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send application notification to admin
const sendApplicationNotification = async (application, job) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Job Application - ${job.title}`,
    html: `
      <h2>New Job Application Received</h2>
      <p><strong>Job:</strong> ${job.title}</p>
      <p><strong>Applicant:</strong> ${application.fullName}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Experience:</strong> ${application.experience}</p>
      <p><strong>Availability:</strong> ${application.availability}</p>
      <p><strong>Message:</strong> ${application.message || 'No message provided'}</p>
      <p><strong>CV:</strong> ${application.cvPath}</p>
      <p><strong>Applied At:</strong> ${application.appliedAt}</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob
};
