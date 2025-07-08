const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { submitApplication } = require("../controllers/jobController");
const { validateJobApplication } = require("../middleware/validation");

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// @route   POST /api/jobs/apply
router.post("/apply", upload.single("cv"), validateJobApplication, submitApplication);

module.exports = router;
