const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  service: { 
    type: String, 
    enum: ['home_care', 'specialized_service', 'staff_recruitment', 'other_enquiry'],
    required: true 
  },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'resolved'],
    default: 'new'
  }
});

module.exports = mongoose.model("Contact", ContactSchema);
