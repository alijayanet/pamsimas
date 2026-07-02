const express = require('express');
const pelangganController = require('../controllers/pelangganController');
const authController = require('../controllers/authController');
const { ensurePelangganAuth } = require('../middleware/auth');
const uploadPaymentProof = require('../middleware/uploadPaymentProof');

const router = express.Router();

router.get('/login', authController.showPelangganLogin);
router.post('/login', authController.loginPelanggan);
router.post('/logout', authController.logoutPelanggan);
router.get('/cek', pelangganController.showLookup);
router.get('/tagihan/:id/qris', pelangganController.showQrisPage);
router.get('/tagihan/:id/status', pelangganController.getPaymentStatus);
router.post('/tagihan/:id/proof', uploadPaymentProof.single('proof'), pelangganController.uploadPaymentProof);
router.use(ensurePelangganAuth);
router.get('/', pelangganController.showDashboard);
router.get('/dashboard', pelangganController.showDashboard);
router.get('/riwayat', pelangganController.showHistoryDashboard);
router.get('/tagihan', pelangganController.showBillsDashboard);
router.get('/akun', pelangganController.showAccountDashboard);
router.post('/akun/password', pelangganController.updateAccountPassword);

module.exports = router;
