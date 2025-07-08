const mongoose = require("mongoose");

const JobApplicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true }, // CMS ID
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  experience: { type: String, required: true },
  availability: { type: String, required: true },
  message: { type: String },
  cvPath: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
