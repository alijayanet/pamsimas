const fs = require('fs');
const path = require('path');
const multer = require('multer');

const baseUploadDir = path.resolve(process.cwd(), 'public', 'uploads');
const qrisDir = path.join(baseUploadDir, 'qris');
const logoDir = path.join(baseUploadDir, 'logo');
fs.mkdirSync(qrisDir, { recursive: true });
fs.mkdirSync(logoDir, { recursive: true });

function getDestinationForField(fieldname) {
  if (fieldname === 'logo') {
    return logoDir;
  }
  return qrisDir;
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, getDestinationForField(file.fieldname)),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    const prefix = file.fieldname === 'logo' ? 'logo' : 'qris';
    cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
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

