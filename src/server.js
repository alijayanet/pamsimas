const app = require('./app');
const env = require('./config/env');
const { startAutomaticGenerationScheduler } = require('./services/tagihanGenerationService');

app.listen(env.appPort, () => {
  console.log(`PAMSIMAS app berjalan di http://localhost:${env.appPort}`);
  startAutomaticGenerationScheduler();
});
