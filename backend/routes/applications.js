const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Private (Admin)
const getApplications = async (req, res, next) => {
  try {
    const { jobId, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (jobId) {
      filter.jobId = jobId;
    }
    
    const skip = (page - 1) * limit;
    
    const applications = await Application.find(filter)
      .populate('jobId', 'title location specialty salary')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Application.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application (Admin)
// @route   GET /api/applications/:id
// @access  Private (Admin)
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title location specialty salary description');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application (Admin)
// @route   DELETE /api/applications/:id
// @access  Private (Admin)
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
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

// Routes
router.get('/', getApplications);
router.get('/:id', getApplication);
router.delete('/:id', deleteApplication);

module.exports = router;
