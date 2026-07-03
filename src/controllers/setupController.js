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

  if (password.length < 6) {
    req.flash('danger', 'Password minimal 6 karakter.');
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

    req.flash('success', 'Admin awal berhasil dibuat. Selamat datang!');
    return res.redirect('/admin');
  } catch (error) {
    req.flash('danger', `Error: ${error.message}`);
    return res.redirect('/setup');
  }
}

// Auto-create default admin jika belum ada
function ensureDefaultAdmin() {
  if (hasAdmin()) {
    return;
  }

  try {
    userModel.createUser({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Default admin created: username=admin, password=admin123');
    console.log('⚠️  PLEASE CHANGE PASSWORD IMMEDIATELY AFTER LOGIN!');
  } catch (error) {
    console.error('❌ Failed to create default admin:', error.message);
  }
}

module.exports = {
  hasAdmin,
  showSetup,
  storeSetup,
  ensureDefaultAdmin
};
