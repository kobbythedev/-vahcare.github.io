// controllers/jobController.js
const JobApplication = require("../models/JobApplication");
const sendEmail = require("../utils/email");
const path = require("path");

exports.submitApplication = async (req, res) => {
  try {
    const { jobId, fullName, email, experience, availability, message } =
      req.body;

    if (
      !jobId ||
      !fullName ||
      !email ||
      !experience ||
      !availability ||
      !req.file
    ) {
      return res
        .status(400)
        .json({ error: "All fields including CV are required." });
    }

    // Save to DB
    const newApplication = new JobApplication({
      jobId,
      fullName,
      email,
      experience,
      availability,
      message,
      cvPath: req.file.path,
    });

    await newApplication.save();

    // === Email to User ===
    await sendEmail({
      to: email,
      subject: "VAH Care — Application Received",
      html: `
        <h2>Hello ${fullName},</h2>
        <p>Thank you for applying through VAH Care.</p>
        <p>We've received your application and will review it shortly.</p>
        <p><strong>Role ID:</strong> ${jobId}</p>
        <br>
        <p>Best regards,</p>
        <p><strong>VAH Care Team</strong></p>
      `,
    });

    // === Email to Admin ===
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `📄 New Job Application — ${fullName}`,
      html: `
        <h2>New Application Submitted</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Availability:</strong> ${availability}</p>
        <p><strong>Message:</strong> ${message || "No message"}</p>
        <p><strong>Job ID:</strong> ${jobId}</p>
        <br>
        <p><strong>CV:</strong> <a href="${process.env.BASE_URL}/uploads/${path.basename(req.file.path)}" target="_blank">Download CV</a></p>
      `,
    });

    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Application error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};
