function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    req.flash('danger', 'Silakan login terlebih dahulu.');
    return res.redirect('/login');
  }

  return next();
}

function ensureRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('danger', 'Silakan login terlebih dahulu.');
      return res.redirect('/login');
    }

    if (!roles.includes(req.session.user.role)) {
      req.flash('danger', 'Anda tidak memiliki akses ke halaman tersebut.');
      return res.redirect('/');
    }

    return next();
  };
}

function ensurePelangganAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('danger', 'Silakan login pelanggan terlebih dahulu.');
    return res.redirect('/pelanggan/login');
  }

  if (req.session.user.role !== 'pelanggan') {
    req.flash('danger', 'Akses dashboard pelanggan hanya untuk akun pelanggan.');
    return res.redirect('/');
  }

  return next();
}

module.exports = {
  ensureAuthenticated,
  ensureRole,
  ensurePelangganAuth
};
