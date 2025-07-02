const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, enum: ["England", "Wales"], required: true },
  specialty: {
    type: String,
    enum: [
      "Health Assistant",
      "Registered Nurse",
      "Kitchen Assistant",
      "House Keeper",
    ],
    required: true,
  },
  description: { type: String, required: true },
  salary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", JobSchema);