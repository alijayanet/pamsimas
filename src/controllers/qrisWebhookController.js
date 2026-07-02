const crypto = require('crypto');
const aplikasiModel = require('../models/aplikasiModel');
const qrisNotifLogModel = require('../models/qrisNotifLogModel');
const { processQrisAmount } = require('../services/qrisNotificationService');

function parseIdrAmount(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return rounded > 0 ? rounded : null;
  }

  const raw = String(value);
  const cleaned = raw.replace(/\u00A0/g, ' ');

  const regexes = [
    /rp\s*([0-9][0-9.\s]*)(?:,00)?/i,
    /idr\s*([0-9][0-9.\s]*)(?:,00)?/i,
    /(?:total|nominal)\s*[:\-]?\s*rp?\s*([0-9][0-9.\s]*)(?:,00)?/i
  ];

  for (const re of regexes) {
    const m = cleaned.match(re);
    if (m && m[1]) {
      const digits = String(m[1]).replace(/[^\d]/g, '');
      const num = Number(digits);
      if (Number.isFinite(num) && num > 0) {
        return num;
      }
    }
  }

  const anyNumber = cleaned.match(/([0-9][0-9.\s]{3,})/);
  if (anyNumber && anyNumber[1]) {
    const digits = String(anyNumber[1]).replace(/[^\d]/g, '');
    const num = Number(digits);
    if (Number.isFinite(num) && num > 0) {
      return num;
    }
  }

  return null;
}

function computeHash(payload) {
  const str = JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function handleMacrodroid(req, res) {
  const appConfig = aplikasiModel.getSettings();
  const token = String(req.headers['x-webhook-token'] || req.body?.token || req.query?.token || '').trim();

  if (!appConfig?.qris_webhook_token || token !== String(appConfig.qris_webhook_token).trim()) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const source = String(req.body?.source || 'macrodroid');
  const messageText = String(req.body?.text || req.body?.message || req.body?.body || '');
  const sender = String(req.body?.sender || req.body?.app || req.body?.package || '');

  const amount = parseIdrAmount(req.body?.amount ?? req.body?.nominal ?? messageText);
  const payloadHash = computeHash({
    source,
    sender,
    amount,
    messageText,
    ts: req.body?.timestamp || req.body?.time || null
  });

  const started = qrisNotifLogModel.tryStart({
    payload_hash: payloadHash,
    source,
    amount_detected: amount,
    message_text: messageText,
    sender
  });
  if (!started) {
    return res.json({ success: true, duplicate: true });
  }

  if (!amount) {
    qrisNotifLogModel.finish({
      payload_hash: payloadHash,
      amount_detected: null,
      message_text: messageText,
      sender,
      matched_tagihan_id: null,
      match_status: 'failed',
      match_reason: 'amount_not_detected'
    });
    return res.json({ success: true, matched: false, reason: 'amount_not_detected' });
  }

  const result = await processQrisAmount(amount, appConfig.qris_match_window_minutes);
  if (!result.matched) {
    qrisNotifLogModel.finish({
      payload_hash: payloadHash,
      amount_detected: amount,
      message_text: messageText,
      sender,
      matched_tagihan_id: null,
      match_status: result.match_status,
      match_reason: result.match_reason
    });
    return res.json({ success: true, matched: false, amount });
  }

  qrisNotifLogModel.finish({
    payload_hash: payloadHash,
    amount_detected: amount,
    message_text: messageText,
    sender,
    matched_tagihan_id: result.bill.id,
    match_status: result.match_status,
    match_reason: result.match_reason
  });

  return res.json({
    success: true,
    matched: true,
    tagihan_id: result.bill.id,
    no_meteran: result.bill.no_meteran,
    nama: result.bill.nama,
    periode: `${result.bill.bulan}/${result.bill.tahun}`
  });
}

module.exports = {
  handleMacrodroid
};
