const path = require('path');
const express = require('express');
const session = require('express-session');
const env = require('./config/env');
const routes = require('./routes');
const helpers = require('./utils/viewHelpers');
const aplikasiModel = require('./models/aplikasiModel');
const { initWhatsapp } = require('./services/whatsappService');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use((req, res, next) => {
  req.flash = (type, message) => {
    req.session.flash = { type, message };
  };
  next();
});

app.use((req, res, next) => {
  const appConfig = aplikasiModel.getSettings();
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.helpers = helpers;
  res.locals.appConfig = appConfig;
  delete req.session.flash;
  next();
});

app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/vendor/admin-lte', express.static(path.join(process.cwd(), 'node_modules', 'admin-lte')));
app.use('/vendor/bootstrap', express.static(path.join(process.cwd(), 'node_modules', 'bootstrap')));
app.use('/vendor/jquery', express.static(path.join(process.cwd(), 'node_modules', 'jquery')));
app.use('/vendor/fontawesome', express.static(path.join(process.cwd(), 'node_modules', '@fortawesome', 'fontawesome-free')));
app.use('/vendor/chart.js', express.static(path.join(process.cwd(), 'node_modules', 'chart.js')));

app.use(routes);

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const message = err?.message || 'Terjadi kesalahan pada server.';
  return res.status(500).render('auth/error', {
    title: 'Terjadi Kesalahan',
    message
  });
});

initWhatsapp().catch((error) => {
  console.error('Gagal inisialisasi WhatsApp:', error.message);
});

module.exports = app;
