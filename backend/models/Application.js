const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  experience: { type: String, required: true },
  availability: { type: String, required: true },
  cvPath: { type: String, required: true }, // Path to uploaded CV
  message: { type: String },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", ApplicationSchema);