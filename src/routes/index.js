const express = require('express');
const authRoutes = require('./authRoutes');
const setupRoutes = require('./setupRoutes');
const adminRoutes = require('./adminRoutes');
const catterRoutes = require('./catterRoutes');
const kasirRoutes = require('./kasirRoutes');
const pelangganRoutes = require('./pelangganRoutes');
const apiRoutes = require('./apiRoutes');
const { hasAdmin } = require('../controllers/setupController');
const publicController = require('../controllers/publicController');

const router = express.Router();

router.get('/', (req, res) => {
  if (!hasAdmin()) {
    return res.redirect('/setup');
  }
  return publicController.showHome(req, res);
});

router.use(setupRoutes);
router.use(authRoutes);
router.use('/api', apiRoutes);
router.use('/admin', adminRoutes);
router.use('/catter', catterRoutes);
router.use('/kasir', kasirRoutes);
router.use('/pelanggan', pelangganRoutes);

module.exports = router;
