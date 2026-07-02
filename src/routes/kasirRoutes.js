const express = require('express');
const kasirController = require('../controllers/kasirController');
const { ensureRole } = require('../middleware/auth');

const router = express.Router();

router.use(ensureRole('kasir', 'admin'));

router.get('/', kasirController.showDashboard);
router.post('/bayar', kasirController.storePayment);
router.post('/tagihan/:id/qris-assign', kasirController.assignQrisCode);
router.post('/tagihan/:id/qris-clear', kasirController.clearQrisCode);
router.post('/tagihan/:id/wa-qris', kasirController.sendQrisToCustomer);
router.get('/kwitansi/:id', kasirController.showReceipt);

module.exports = router;
