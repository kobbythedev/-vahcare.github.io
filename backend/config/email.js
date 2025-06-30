// ==================== config/email.js ====================
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Create transporter
let transporter = null;

const createTransporter = () => {
  try {
    transporter = nodemailer.createTransporter(emailConfig);
    console.log('✅ Email transporter created');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return null;
  }
};

// Test email connection
const testEmailConnection = async () => {
  if (!transporter) {
    createTransporter();
  }

  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};

// Load email template
const loadTemplate = async (templateName, variables = {}) => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key]);
    });

    return template;
  } catch (error) {
    console.error('Error loading email template:', error);
    return null;
  }
};

// Send application confirmation email
const sendApplicationConfirmation = async (applicantEmail, applicantName, jobTitle, applicationId) => {
  if (!transporter) {
    createTransporter();
  }

  try {
    const template = await loadTemplate('application_confirmation', {
      applicantName,
      jobTitle,
      applicationId,
      supportEmail: process.env.ADMIN_EMAIL || 'support@vahcare.com',
      currentYear: new Date().getFullYear()
    });

    const mailOptions = {
      from: {
        name: 'VAH Care Jobs',
        address: process.env.SMTP_USER
      },
      to: applicantEmail,
      subject: `Application Received - ${jobTitle}`,
      html: template || `
        <h2>Application Received</h2>
        <p>Dear ${applicantName},</p>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position.</p>
        <p>Your application ID is: <strong>${applicationId}</strong></p>
        <p>We will review your application and get back to you soon.</p>
        <p>Best regards,<br>VAH Care Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Application confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending application confirmation:', error);
    throw error;
  }
};

// Send admin notification email
const sendAdminNotification = async (applicationData) => {
  if (!transporter) {
    createTransporter();
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('Admin email not configured');
    return;
  }

  try {
    const template = await loadTemplate('admin_notification', {
      applicantName: applicationData.applicantName,
      applicantEmail: applicationData.applicantEmail,
      jobTitle: applicationData.jobTitle,
      experience: applicationData.experience,
      availability: applicationData.availability,
      applicationId: applicationData.applicationId,
      submittedAt: new Date().toLocaleString()
    });

    const mailOptions = {
      from: {
        name: 'VAH Care Jobs System',
        address: process.env.SMTP_USER
      },
      to: adminEmail,
      subject: `New Job Application - ${applicationData.jobTitle}`,
      html: template || `
        <h2>New Job Application Received</h2>
        <p><strong>Position:</strong> ${applicationData.jobTitle}</p>
        <p><strong>Applicant:</strong> ${applicationData.applicantName}</p>
        <p><strong>Email:</strong> ${applicationData.applicantEmail}</p>
        <p><strong>Experience:</strong> ${applicationData.experience}</p>
        <p><strong>Availability:</strong> ${applicationData.availability}</p>
        <p><strong>Application ID:</strong> ${applicationData.applicationId}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
};

// Send status update email
const sendStatusUpdate = async (applicantEmail, applicantName, jobTitle, status, message = '') => {
  if (!transporter) {
    createTransporter();
  }

  const statusMessages = {
    'under_review': 'Your application is currently under review.',
    'interviewed': 'Congratulations! You have been selected for an interview.',
    'accepted': 'Congratulations! Your application has been accepted.',
    'rejected': 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.'
  };

  try {
    const template = await loadTemplate('status_update', {
      applicantName,
      jobTitle,
      status: status.replace('_', ' ').toUpperCase(),
      statusMessage: statusMessages[status] || message,
      customMessage: message,
      supportEmail: process.env.ADMIN_EMAIL || 'support@vahcare.com'
    });

    const mailOptions = {
      from: {
        name: 'VAH Care Jobs',
        address: process.env.SMTP_USER
      },
      to: applicantEmail,
      subject: `Application Update - ${jobTitle}`,
      html: template || `
        <h2>Application Status Update</h2>
        <p>Dear ${applicantName},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
        <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
        <p>${statusMessages[status] || message}</p>
        <p>Best regards,<br>VAH Care Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Status update email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending status update:', error);
    throw error;
  }
};

// Generic email sender
const sendEmail = async (to, subject, html, attachments = []) => {
  if (!transporter) {
    createTransporter();
  }

  try {
    const mailOptions = {
      from: {
        name: 'VAH Care Jobs',
        address: process.env.SMTP_USER
      },
      to,
      subject,
      html,
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  createTransporter,
  testEmailConnection,
  sendApplicationConfirmation,
  sendAdminNotification,
  sendStatusUpdate,
  sendEmail,
  loadTemplate
};
