const express = require('express');
const adminController = require('../controllers/adminController');
const { ensureRole } = require('../middleware/auth');
const uploadAppAssets = require('../middleware/uploadAppAssets');

const router = express.Router();

router.use(ensureRole('admin'));

router.get('/', adminController.dashboard);
router.get('/tagihan', adminController.listTagihan);
router.get('/tagihan/:id', adminController.showTagihanDetail);
router.get('/pelanggan', adminController.listPelanggan);
router.get('/petugas', adminController.listPetugas);
router.get('/petugas/new', adminController.showCreatePetugas);
router.post('/petugas', adminController.storePetugas);
router.get('/petugas/:id/edit', adminController.showEditPetugas);
router.post('/petugas/:id', adminController.updatePetugas);
router.post('/petugas/:id/delete', adminController.deletePetugas);
router.get('/pelanggan/new', adminController.showCreatePelanggan);
router.post('/pelanggan', adminController.storePelanggan);
router.get('/pelanggan/:id/edit', adminController.showEditPelanggan);
router.post('/pelanggan/:id', adminController.updatePelanggan);
router.post('/pelanggan/:id/delete', adminController.deletePelanggan);
router.get('/pelanggan/:id/qr', adminController.showPelangganQr);

router.get('/pengaturan', adminController.showSettings);
router.post('/pengaturan', adminController.updateSettings);
router.post('/tagihan/generate', adminController.generateBillsManual);
router.post(
  '/pengaturan/aplikasi',
  uploadAppAssets.fields([
    { name: 'qris_static_qr', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  adminController.updateAppConfig
);
router.post('/tagihan/:id/qris-assign', adminController.assignQrisCode);
router.post('/tagihan/:id/qris-clear', adminController.clearQrisCode);
router.post('/qris-log/:id/retry', adminController.retryQrisLog);
router.post('/pengeluaran', adminController.addExpense);
router.post('/tagihan/:id/lunas', adminController.markBillPaid);

router.get('/whatsapp', adminController.showWhatsapp);
router.post('/whatsapp/connect', adminController.reconnectWhatsapp);
router.post('/whatsapp/broadcast', adminController.broadcastWhatsapp);
router.post('/whatsapp/qris-test', adminController.testQrisWhatsapp);
router.post('/whatsapp/qris-reminder', adminController.sendQrisReminderBulk);
router.post('/tagihan/:id/wa-qris', adminController.sendQrisToCustomer);

// Golongan Tarif
router.get('/tarif-golongan', adminController.showTarifGolongan);
router.post('/tarif-golongan/:kode', adminController.updateTarifGolongan);

// Broadcast Reminder Tunggakan
router.post('/whatsapp/broadcast-reminder', adminController.broadcastReminderTunggakan);
router.post('/whatsapp/send-reminder-single/:id', adminController.sendReminderSingle);

// Ekspor Laporan CSV
router.get('/laporan/csv', adminController.exportLaporanCsv);
router.get('/laporan/export-csv', adminController.exportLaporanCsv);

module.exports = router;
