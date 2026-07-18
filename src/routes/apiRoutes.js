const express = require('express');
const qrisWebhookController = require('../controllers/qrisWebhookController');
const qrisStaticController = require('../controllers/qrisStaticController');
const db = require('../config/database');

// Inject token dari query param ke header agar Macrodroid bisa kirim lewat URL (?token=xxx)
function injectTokenFromQuery(req, res, next) {
  if (!req.headers['x-webhook-token']) {
    const t = String(req.query?.token || req.query?.secret_key || req.body?.token || '').trim();
    if (t) req.headers['x-webhook-token'] = t;
  }
  next();
}

const router = express.Router();

router.post('/qris/macrodroid', injectTokenFromQuery, qrisWebhookController.handleMacrodroid);
router.get('/qris/static.jpg', qrisStaticController.getStaticQrisJpg);

router.post('/webhook/v1/payment-notif', (req, res) => {
  if (!req.headers['x-webhook-token']) {
    const secretKey = String(req.body?.secret_key || req.body?.token || req.query?.secret_key || '').trim();
    if (secretKey) {
      req.headers['x-webhook-token'] = secretKey;
    }
  }

  const service = String(req.body?.service || 'payment-notif');
  const sender = String(req.body?.sender || req.body?.app || req.body?.package || '');
  const messageText = String(req.body?.content || req.body?.text || req.body?.message || req.body?.body || '');
  const amount = req.body?.amount ?? req.body?.nominal ?? null;

  req.body = {
    source: service,
    sender,
    text: messageText,
    amount
  };

  return qrisWebhookController.handleMacrodroid(req, res);
});

// API: Rata-rata pemakaian 3 bulan terakhir untuk deteksi anomali
router.get('/pelanggan/:id/avg-usage', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT AVG(total_kubik) AS avg_kubik, COUNT(*) AS jumlah_data
      FROM (
        SELECT total_kubik
        FROM pencatatan_meteran
        WHERE pelanggan_id = ?
        ORDER BY tahun DESC, bulan DESC, id DESC
        LIMIT 3
      )
    `).get(Number(req.params.id));
    return res.json({
      avg_kubik: row?.avg_kubik ? parseFloat(row.avg_kubik.toFixed(2)) : null,
      jumlah_data: row?.jumlah_data || 0
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

