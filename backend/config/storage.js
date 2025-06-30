// ==================== config/storage.js ====================
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
require('dotenv').config();

// Storage configuration
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' or 's3'
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  try {
    await fs.mkdir(path.join(UPLOAD_DIR, 'cvs'), { recursive: true });
    await fs.mkdir(path.join(UPLOAD_DIR, 'temp'), { recursive: true });
    console.log('✅ Upload directories created');
  } catch (error) {
    console.error('❌ Error creating upload directories:', error);
  }
};

// AWS S3 Configuration
let s3 = null;
if (STORAGE_TYPE === 's3') {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: process.env.AWS_BUCKET_NAME }
  });
}

// File validation
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.pdf', '.doc', '.docx'].includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }

  cb(null, true);
};

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(UPLOAD_DIR, 'cvs');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

// Memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

// Multer configuration
const uploadConfig = {
  storage: STORAGE_TYPE === 's3' ? memoryStorage : localStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: fileFilter
};

const upload = multer(uploadConfig);

// S3 upload function
const uploadToS3 = async (file, key) => {
  if (!s3) {
    throw new Error('S3 not configured');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private' // Files are private by default
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      location: result.Location,
      key: result.Key,
      bucket: result.Bucket
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

// Get signed URL for S3 files
const getSignedUrl = async (key, expiresIn = 3600) => {
  if (!s3) {
    throw new Error('S3 not configured');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};

// Delete file function
const deleteFile = async (filePath) => {
  try {
    if (STORAGE_TYPE === 's3') {
      // Delete from S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filePath
      };
      await s3.deleteObject(params).promise();
    } else {
      // Delete from local storage
      await fs.unlink(path.join(UPLOAD_DIR, 'cvs', filePath));
    }
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// File size formatter
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  upload,
  uploadToS3,
  getSignedUrl,
  deleteFile,
  formatFileSize,
  ensureUploadDirs,
  STORAGE_TYPE,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
  UPLOAD_DIR
};
