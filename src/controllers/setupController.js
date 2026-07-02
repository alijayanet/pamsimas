const userModel = require('../models/userModel');

function hasAdmin() {
  return userModel.countByRole('admin') > 0;
}

function showSetup(req, res) {
  if (hasAdmin()) {
    return res.redirect('/login');
  }

  return res.render('auth/setup', {
    title: 'Setup Admin Awal'
  });
}

function storeSetup(req, res) {
  if (hasAdmin()) {
    req.flash('warning', 'Setup awal sudah selesai.');
    return res.redirect('/login');
  }

  const { username, password, confirm_password } = req.body;

  if (!username || !password) {
    req.flash('danger', 'Username dan password wajib diisi.');
    return res.redirect('/setup');
  }

  if (password !== confirm_password) {
    req.flash('danger', 'Konfirmasi password tidak sama.');
    return res.redirect('/setup');
  }

  try {
    const userId = userModel.createUser({
      username,
      password,
      role: 'admin'
    });

    req.session.user = {
      id: userId,
      username,
      role: 'admin'
    };

    req.flash('success', 'Admin awal berhasil dibuat.');
    return res.redirect('/admin');
  } catch (error) {
    req.flash('danger', error.message);
    return res.redirect('/setup');
  }
}

module.exports = {
  hasAdmin,
  showSetup,
  storeSetup
};
