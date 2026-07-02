const path = require('path');
const aplikasiModel = require('../models/aplikasiModel');
const qrisService = require('../services/qrisService');

function parseAmount(value) {
  const amount = Math.max(0, Math.floor(Number(value || 0) || 0));
  return amount > 0 ? amount : 0;
}

async function sendStaticFallback(req, res, appConfig) {
  const url = String(appConfig?.qris_static_qr_url || '').trim();
  const match = url.match(/^\/uploads\/qris\/([^/?#]+)$/i);
  if (match && match[1]) {
    const safeName = path.basename(String(match[1]));
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'qris', safeName);
    return res.sendFile(filePath, { headers: { 'Cache-Control': 'no-store' } }, () => {
      res.status(404).send('QRIS statik belum diatur atau file tidak ditemukan.');
    });
  }

  if (/^https?:\/\//i.test(url)) {
    return res.redirect(url);
  }

  return res.status(404).send('QRIS statik belum diatur.');
}

async function getStaticQrisJpg(req, res) {
  const amount = parseAmount(req.query.amount);
  if (!amount) {
    return res.status(400).send('Nominal tidak valid. Contoh: /api/qris/static.jpg?amount=12345');
  }

  const appConfig = aplikasiModel.getSettings();
  if (!qrisService.isStaticQrisReady(appConfig)) {
    return res.status(404).send('QRIS statik belum diaktifkan.');
  }

  const png = await qrisService.getDynamicQrisQrBufferForAmount(appConfig, amount);
  if (!png) {
    return sendStaticFallback(req, res, appConfig);
  }

  let JimpModule = null;
  try {
    JimpModule = require('jimp');
  } catch {
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    return res.status(200).send(png);
  }

  const JimpReader = typeof JimpModule?.read === 'function' ? JimpModule : JimpModule?.Jimp;
  const MIME_JPEG = JimpModule?.MIME_JPEG || JimpReader?.MIME_JPEG || 'image/jpeg';

  try {
    const jpg = await JimpReader.read(png).then((img) => img.quality(90).background(0xffffffff).getBufferAsync(MIME_JPEG));
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-store');
    return res.status(200).send(jpg);
  } catch {
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    return res.status(200).send(png);
  }
}

module.exports = {
  getStaticQrisJpg
};

