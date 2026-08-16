const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `ocr-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const checkFileType = (file, cb) => {
  // Allow PNG, JPG, JPEG, WEBP
  const filetypes = /jpeg|jpg|png|webp/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images Only! Supported formats: PNG, JPG, JPEG, WEBP'));
  }
};

const uploadOcr = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = uploadOcr;
