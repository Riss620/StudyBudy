const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ------------------------------------------------------------------
// Cloudinary storage for general group files (docs, images, etc.)
// ------------------------------------------------------------------
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studybudy/files',
    // Cloudinary will detect the resource type automatically.
    resource_type: 'auto',
    // Keep the original filename (without extension – Cloudinary handles it)
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
      return `file-${nameWithoutExt}-${uniqueSuffix}`;
    },
  },
});

// ------------------------------------------------------------------
// Cloudinary storage for user avatars
// ------------------------------------------------------------------
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studybudy/avatars',
    resource_type: 'image',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    public_id: (req) => `avatar-${req.user._id}-${Date.now()}`,
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  },
});

// ------------------------------------------------------------------
// File filter helpers
// ------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only documents and images are allowed!'));
  }
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// ------------------------------------------------------------------
// Multer instances
// ------------------------------------------------------------------
const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFilter,
});

module.exports = { upload, avatarUpload };
