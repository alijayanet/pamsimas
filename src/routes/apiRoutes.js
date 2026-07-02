const express = require('express');
const qrisWebhookController = require('../controllers/qrisWebhookController');
const qrisStaticController = require('../controllers/qrisStaticController');

const router = express.Router();

router.post('/qris/macrodroid', qrisWebhookController.handleMacrodroid);
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

module.exports = router;
