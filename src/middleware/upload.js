const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, env.uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeName = `meter-${Date.now()}${ext || '.jpg'}`;
    cb(null, safeName);
  }
});

function fileFilter(_, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('File harus berupa gambar.'));
  }

  return cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
