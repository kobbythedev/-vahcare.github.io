// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");

const connectDB = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");
const jobRoutes = require("./routes/jobRoutes");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter, formLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5000;

// === Connect to MongoDB ===
connectDB();

// === Middleware ===
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true
}));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Rate Limiting ===
app.use('/api/', apiLimiter);

// === Static files for uploaded CVs ===
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === API Routes ===
app.use("/api/contact", formLimiter, contactRoutes);
app.use("/api/jobs", formLimiter, jobRoutes);

// === 404 fallback ===
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

// === Error Handler ===
app.use(errorHandler);

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
