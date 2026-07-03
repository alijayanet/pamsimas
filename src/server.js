const app = require('./app');
const env = require('./config/env');
const { startAutomaticGenerationScheduler } = require('./services/tagihanGenerationService');
const { ensureDefaultAdmin } = require('./controllers/setupController');

// Auto-create default admin jika belum ada
ensureDefaultAdmin();

app.listen(env.appPort, () => {
  console.log(`\n🚰 PAMSIMAS app running at http://localhost:${env.appPort}`);
  console.log(`📝 Login dengan: username=admin, password=admin123`);
  console.log(`⚠️  Ganti password admin setelah login pertama kali!\n`);
  startAutomaticGenerationScheduler();
});
