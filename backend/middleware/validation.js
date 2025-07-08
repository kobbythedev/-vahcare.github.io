const validateContact = (req, res, next) => {
  const { fullName, email, message } = req.body;
  
  // Basic validation
  if (!fullName || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required fields'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }
  
  // Sanitize inputs
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.message = message.trim();
  
  if (req.body.phone) {
    req.body.phone = req.body.phone.trim();
  }
  
  next();
};

const validateJobApplication = (req, res, next) => {
  const { jobId, fullName, email, experience, availability } = req.body;
  
  // Basic validation
  if (!jobId || !fullName || !email || !experience || !availability) {
    return res.status(400).json({
      success: false,
      error: 'Job ID, name, email, experience, and availability are required fields'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }
  
  // File validation
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'CV file is required'
    });
  }
  
  // Sanitize inputs
  req.body.jobId = jobId.trim();
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.experience = experience.trim();
  req.body.availability = availability.trim();
  
  if (req.body.message) {
    req.body.message = req.body.message.trim();
  }
  
  next();
};

module.exports = { validateContact, validateJobApplication };
