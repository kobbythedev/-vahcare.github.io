const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// Get all jobs (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { location, specialty } = req.query;
    const filters = {};
    if (location) filters.location = location;
    if (specialty) filters.specialty = specialty;

    const jobs = await Job.find(filters);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add more routes (create, update, delete jobs) if needed

module.exports = router;