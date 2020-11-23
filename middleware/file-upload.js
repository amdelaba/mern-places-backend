const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

// generates a group of middlewares
const fileUpload = multer({
  limits: 500000, // 500KB
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];  // file.mimetype will look like 'image/png', etc
      cb(null, uuidv4() + '.' + ext );
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];  // !!: double bacng operator
    let error = isValid ? null : new Error('Invalid mime type');
    cb(error, isValid);
  }
});

module.exports = fileUpload;