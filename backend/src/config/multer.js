const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const resumeDir = path.join(__dirname, '../../uploads/resumes');
const logoDir = path.join(__dirname, '../../uploads/logos');

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Storage configurations
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (PDF, DOCX for resumes; Images for logos)
const fileFilter = (type) => (req, file, cb) => {
  if (type === 'resume') {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.mimetype === 'application/msword') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed for resumes!'), false);
    }
  } else if (type === 'logo') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logos!'), false);
    }
  }
};

const uploadResume = multer({ 
  storage: resumeStorage, 
  fileFilter: fileFilter('resume'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadLogo = multer({ 
  storage: logoStorage, 
  fileFilter: fileFilter('logo'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = {
  uploadResume,
  uploadLogo
};
