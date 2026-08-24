const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const sanitizeBaseName = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 60);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const baseName = sanitizeBaseName(path.basename(file.originalname || 'image', ext));
    const safeName = baseName || 'image';
    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error('Only JPG and PNG images are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadSingleImage = (req, res, next) => {
  const handler = upload.single('image');

  handler(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image size must be 5MB or less.'
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid image upload.'
    });
  });
};

const uploadSingleImageIfPresent = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return uploadSingleImage(req, res, next);
  }

  return next();
};

module.exports = {
  uploadSingleImage,
  uploadSingleImageIfPresent
};
