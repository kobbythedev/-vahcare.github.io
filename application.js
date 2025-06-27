const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const Application = require("../models/Application");
const Job = require("../models/Job");

// Submit job application (with CV upload)
router.post("/", upload.single("cv"), async (req, res) => {
  try {
    const { jobId, fullName, email, experience, availability, message } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const newApplication = new Application({
      jobId,
      fullName,
      email,
      experience,
      availability,
      cvPath: req.file.path,
      message,
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;