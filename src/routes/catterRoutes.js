const express = require('express');
const catterController = require('../controllers/catterController');
const { ensureRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(ensureRole('catter', 'admin'));

router.get('/', catterController.showDashboard);
router.get('/api/pelanggan', catterController.apiListPelanggan);
router.post('/meteran', upload.single('foto_bukti'), catterController.storeReading);
router.get('/pencatatan/:id/edit', catterController.showEditReading);
router.post('/pencatatan/:id', upload.single('foto_bukti'), catterController.updateReading);
router.post('/pencatatan/:id/delete', catterController.deleteReading);

module.exports = router;
