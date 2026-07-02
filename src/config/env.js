const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredKeys = ['SESSION_SECRET'];
for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} wajib diisi.`);
  }
}

module.exports = {
  appPort: Number(process.env.APP_PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET,
  dbPath: path.resolve(process.cwd(), process.env.DB_PATH || './data/pamsimas.db'),
  baseUrl: (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads/meter'),
  waSessionDir: path.resolve(process.cwd(), process.env.WA_SESSION_DIR || './data/wa-session')
};
