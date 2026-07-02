const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const pelangganModel = require('../models/pelangganModel');
const { hasAdmin } = require('./setupController');

function resolveHomeByRole(role) {
  if (role === 'admin') {
    return '/admin';
  }

  if (role === 'catter') {
    return '/catter';
  }

  if (role === 'kasir') {
    return '/kasir';
  }

  return '/pelanggan';
}

function showLogin(req, res) {
  if (!hasAdmin()) {
    return res.redirect('/setup');
  }

  if (req.session.user) {
    return res.redirect(resolveHomeByRole(req.session.user.role));
  }

  return res.render('auth/login', {
    title: 'Login PAMSIMAS'
  });
}

async function login(req, res) {
  if (!hasAdmin()) {
    return res.redirect('/setup');
  }

  const { username, password } = req.body;
  const user = userModel.findByUsername(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    req.flash('danger', 'Username atau password tidak valid.');
    return res.redirect('/login');
  }

  if (user.role === 'pelanggan') {
    const pelanggan = pelangganModel.findByUserId(user.id);
    if (!pelanggan) {
      req.flash('danger', 'Akun pelanggan belum terhubung dengan data pelanggan.');
      return res.redirect('/login');
    }
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  req.flash('success', 'Login berhasil.');
  return res.redirect(resolveHomeByRole(user.role));
}

function showPelangganLogin(req, res) {
  if (!hasAdmin()) {
    return res.redirect('/setup');
  }

  if (req.session.user?.role === 'pelanggan') {
    return res.redirect('/pelanggan');
  }

  return res.render('pelanggan/login', {
    title: 'Login Pelanggan'
  });
}

function loginPelanggan(req, res) {
  if (!hasAdmin()) {
    return res.redirect('/setup');
  }

  const { username, password } = req.body;
  const user = userModel.findByUsername(username);

  if (!user || user.role !== 'pelanggan' || !bcrypt.compareSync(password, user.password)) {
    req.flash('danger', 'Username atau password pelanggan tidak valid.');
    return res.redirect('/pelanggan/login');
  }

  const pelanggan = pelangganModel.findByUserId(user.id);
  if (!pelanggan) {
    req.flash('danger', 'Akun pelanggan belum terhubung dengan data pelanggan.');
    return res.redirect('/pelanggan/login');
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  req.flash('success', 'Login pelanggan berhasil.');
  return res.redirect('/pelanggan');
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

function logoutPelanggan(req, res) {
  req.session.destroy(() => {
    res.redirect('/pelanggan/login');
  });
}

module.exports = {
  showLogin,
  login,
  showPelangganLogin,
  loginPelanggan,
  logout,
  logoutPelanggan
};
