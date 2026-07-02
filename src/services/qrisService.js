const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const tagihanModel = require('../models/tagihanModel');

function normalizeQrisPayloadRaw(raw) {
  let s = String(raw || '').replace(/[\r\n\t]+/g, '').trim();
  const idx = s.indexOf('000201');
  if (idx > 0) {
    s = s.slice(idx);
  }
  const lastCrc = s.lastIndexOf('6304');
  if (lastCrc >= 0 && s.length >= lastCrc + 8) {
    s = s.slice(0, lastCrc + 8);
  }
  return s;
}

function crc16CcittFalse(input) {
  const s = String(input || '');
  let crc = 0xffff;
  for (let i = 0; i < s.length; i += 1) {
    crc ^= (s.charCodeAt(i) & 0xff) << 8;
    for (let b = 0; b < 8; b += 1) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc & 0xffff;
}

function parseEmvTlvString(input) {
  const raw = String(input || '').replace(/[\r\n\t]+/g, '').trim();
  if (!raw) {
    throw new Error('QRIS payload kosong');
  }
  if (raw.length < 8) {
    throw new Error('QRIS payload terlalu pendek');
  }

  const items = [];
  let i = 0;
  while (i < raw.length) {
    if (i + 4 > raw.length) {
      throw new Error('QRIS payload TLV tidak valid');
    }
    const tag = raw.slice(i, i + 2);
    const lenStr = raw.slice(i + 2, i + 4);
    if (!/^\d{2}$/.test(lenStr)) {
      throw new Error('QRIS payload TLV length tidak valid');
    }
    const len = Number(lenStr);
    const start = i + 4;
    const end = start + len;
    if (end > raw.length) {
      throw new Error('QRIS payload TLV length melebihi data');
    }
    const value = raw.slice(start, end);
    items.push({ tag, value });
    i = end;
  }
  return items;
}

function buildEmvTlvString(items) {
  const list = Array.isArray(items) ? items : [];
  let out = '';
  for (const it of list) {
    const tag = String(it?.tag || '');
    const value = String(it?.value ?? '');
    const len = value.length;
    if (!/^\d{2}$/.test(tag)) {
      throw new Error('Tag TLV tidak valid');
    }
    if (len > 99) {
      throw new Error('TLV length > 99 tidak didukung');
    }
    out += tag + String(len).padStart(2, '0') + value;
  }
  return out;
}

function convertStaticQrisToDynamic(staticPayload, amount) {
  const amt = Math.max(0, Math.floor(Number(amount || 0) || 0));
  if (!amt) {
    throw new Error('Nominal QRIS dinamis tidak valid');
  }

  const source = parseEmvTlvString(staticPayload)
    .filter(x => x && x.tag)
    .map(x => ({ tag: String(x.tag), value: String(x.value ?? '') }));

  const managed = new Set(['54', '55', '56', '57', '63']);
  const result = [];
  let amountInserted = false;

  for (const el of source) {
    if (managed.has(el.tag)) {
      continue;
    }
    if (el.tag === '01') {
      result.push({ tag: '01', value: '12' });
      continue;
    }
    if (el.tag === '58' && !amountInserted) {
      result.push({ tag: '54', value: String(amt) });
      amountInserted = true;
    }
    result.push(el);
  }

  if (!amountInserted) {
    result.push({ tag: '54', value: String(amt) });
  }

  const body = buildEmvTlvString(result);
  const partial = body + '6304';
  const crc = crc16CcittFalse(partial).toString(16).toUpperCase().padStart(4, '0');
  return partial + crc;
}

function normalizeWaDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }

  if (!digits.startsWith('62')) {
    return `62${digits}`;
  }

  return digits;
}

function isStaticQrisReady(appConfig) {
  return Boolean(
    appConfig &&
    appConfig.qris_static_enabled &&
    (String(appConfig.qris_static_payload || '').trim() || String(appConfig.qris_static_qr_url || '').trim())
  );
}

let qrisDecodedCache = { file: '', mtimeMs: 0, payload: '' };

async function tryDecodeQrisPayloadFromUploadedQr(appConfig) {
  const url = String(appConfig?.qris_static_qr_url || '').trim();
  const match = url.match(/^\/uploads\/qris\/([^/?#]+)$/i);
  if (!match || !match[1]) {
    return '';
  }

  const safeName = path.basename(String(match[1]));
  const filePath = path.join(process.cwd(), 'public', 'uploads', 'qris', safeName);
  let st = null;
  try {
    st = await fs.promises.stat(filePath);
  } catch {
    return '';
  }

  if (qrisDecodedCache.file === safeName && qrisDecodedCache.mtimeMs === st.mtimeMs && qrisDecodedCache.payload) {
    return qrisDecodedCache.payload;
  }

  let JimpModule = null;
  let Zxing = null;
  let JsQR = null;
  try {
    JimpModule = require('jimp');
    Zxing = require('@zxing/library');
    JsQR = require('jsqr');
  } catch {
    return '';
  }

  try {
    const buf = await fs.promises.readFile(filePath);
    const JimpReader = typeof JimpModule?.read === 'function' ? JimpModule : JimpModule?.Jimp;
    if (!JimpReader || typeof JimpReader.read !== 'function') {
      return '';
    }
    const rawImage = await JimpReader.read(buf);
    const intToRGBA = typeof JimpModule?.intToRGBA === 'function' ? JimpModule.intToRGBA : (typeof JimpReader?.intToRGBA === 'function' ? JimpReader.intToRGBA : null);

    const attemptDecode = (img) => {
      const rgba = new Uint8ClampedArray(img.bitmap.data.buffer, img.bitmap.data.byteOffset, img.bitmap.data.byteLength);
      const source = new Zxing.RGBLuminanceSource(rgba, img.bitmap.width, img.bitmap.height);
      const bitmap = new Zxing.BinaryBitmap(new Zxing.HybridBinarizer(source));
      const reader = new Zxing.MultiFormatReader();
      const hints = new Map();
      hints.set(Zxing.DecodeHintType.POSSIBLE_FORMATS, [Zxing.BarcodeFormat.QR_CODE]);
      reader.setHints(hints);
      const decoded = reader.decode(bitmap);
      const text = typeof decoded?.getText === 'function' ? decoded.getText() : String(decoded?.text || '');
      return normalizeQrisPayloadRaw(text);
    };

    const attemptDecodeJsqr = (img) => {
      if (typeof JsQR !== 'function') {
        throw new Error('jsqr_not_ready');
      }
      const rgba = new Uint8ClampedArray(img.bitmap.data.buffer, img.bitmap.data.byteOffset, img.bitmap.data.byteLength);
      const code = JsQR(rgba, img.bitmap.width, img.bitmap.height);
      const text = String(code?.data || '');
      return normalizeQrisPayloadRaw(text);
    };

    let payload = '';
    try {
      payload = attemptDecode(rawImage);
    } catch {}
    if (!payload) {
      try {
        payload = attemptDecodeJsqr(rawImage);
      } catch {}
    }

    if (!payload && intToRGBA) {
      const processed = rawImage.clone().greyscale().contrast(0.25);
      const w = processed.bitmap.width;
      const h = processed.bitmap.height;
      const step = Math.max(2, Math.floor(Math.min(w, h) / 200));

      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;
      let found = false;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const px = processed.getPixelColor(x, y);
          const rgba = intToRGBA(px);
          if (rgba && rgba.r < 80) {
            found = true;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (found && maxX > minX && maxY > minY) {
        const pad = Math.max(10, Math.floor(Math.min(w, h) * 0.02));
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
        const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);
        const cropped = processed.clone().crop(cropX, cropY, cropW, cropH);
        const resized = cropped.clone().resize(720, 720);
        try {
          payload = attemptDecode(resized);
        } catch {}
        if (!payload) {
          try {
            payload = attemptDecodeJsqr(resized);
          } catch {}
        }
      }
    }

    if (!payload) {
      const base = rawImage.clone().greyscale().contrast(0.25);
      const w = base.bitmap.width;
      const h = base.bitmap.height;
      const side = Math.max(200, Math.floor(Math.min(w, h) * 0.7));
      const cropX = Math.max(0, Math.floor((w - side) / 2));
      const cropY = Math.max(0, Math.floor((h - side) / 2));
      const cropped = base.clone().crop(cropX, cropY, Math.min(side, w - cropX), Math.min(side, h - cropY));
      const resized = cropped.clone().resize(720, 720);
      try {
        payload = attemptDecode(resized);
      } catch {}
      if (!payload) {
        try {
          payload = attemptDecodeJsqr(resized);
        } catch {}
      }
    }

    if (!payload) {
      return '';
    }
    qrisDecodedCache = { file: safeName, mtimeMs: st.mtimeMs, payload };
    return payload;
  } catch {
    return '';
  }
}

async function resolveStaticQrisPayload(appConfig) {
  const rawPayload = String(appConfig?.qris_static_payload || '').trim();
  const payload = normalizeQrisPayloadRaw(rawPayload);
  if (payload) {
    return payload;
  }

  return tryDecodeQrisPayloadFromUploadedQr(appConfig);
}

async function getQrisQrUrl(appConfig) {
  const payload = String(appConfig?.qris_static_payload || '').trim();
  if (payload) {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320
    });
  }

  return String(appConfig?.qris_static_qr_url || '').trim();
}

async function getDynamicQrisQrDataUrlForAmount(appConfig, amount) {
  const payload = await resolveStaticQrisPayload(appConfig);
  if (!payload) {
    return '';
  }
  const dynamic = convertStaticQrisToDynamic(payload, amount);
  return QRCode.toDataURL(dynamic, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320
  });
}

async function getDynamicQrisQrBufferForAmount(appConfig, amount) {
  const payload = await resolveStaticQrisPayload(appConfig);
  if (!payload) {
    return null;
  }
  const dynamic = convertStaticQrisToDynamic(payload, amount);
  return QRCode.toBuffer(dynamic, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 420,
    type: 'png'
  });
}

function ensureUniqueAmount(tagihan) {
  const billId = Number(tagihan?.id || 0);
  if (!billId || tagihan?.status_bayar === 'lunas') {
    throw new Error('Tagihan tidak valid untuk QRIS.');
  }

  const currentAmount = Number(tagihan.qris_amount_unique || 0);
  const currentCode = Number(tagihan.qris_unique_code || 0);
  if (currentAmount > 0 && currentCode > 0) {
    return {
      uniqueCode: currentCode,
      amountUnique: currentAmount
    };
  }

  const baseAmount = Math.round(Number(tagihan.total_tagihan || 0));
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    throw new Error('Nominal tagihan tidak valid.');
  }

  let chosenCode = 0;
  let chosenAmount = 0;

  for (let i = 0; i < 50; i += 1) {
    const code = 1 + Math.floor(Math.random() * 999);
    const amount = baseAmount + code;
    if (!tagihanModel.findPendingByQrisAmountUnique(amount, billId)) {
      chosenCode = code;
      chosenAmount = amount;
      break;
    }
  }

  if (!chosenAmount) {
    for (let code = 1; code <= 999; code += 1) {
      const amount = baseAmount + code;
      if (!tagihanModel.findPendingByQrisAmountUnique(amount, billId)) {
        chosenCode = code;
        chosenAmount = amount;
        break;
      }
    }
  }

  if (!chosenAmount) {
    throw new Error('Slot nominal unik QRIS sedang penuh. Coba lagi sebentar.');
  }

  tagihanModel.assignQrisUnique(billId, chosenCode, chosenAmount);
  return {
    uniqueCode: chosenCode,
    amountUnique: chosenAmount
  };
}

function canAccessTagihan(tagihan, accessKey, pelangganId = null) {
  if (tagihan && pelangganId && Number(tagihan.pelanggan_id) === Number(pelangganId)) {
    return true;
  }

  const key = String(accessKey || '').trim();
  if (!tagihan || !key) {
    return false;
  }

  return key === String(tagihan.no_meteran || '') || key === String(tagihan.no_whatsapp || '');
}

function getAdminWaDigits(appConfig) {
  return normalizeWaDigits(appConfig?.qris_admin_wa || appConfig?.no_whatsapp_loket || '');
}

module.exports = {
  isStaticQrisReady,
  getQrisQrUrl,
  getDynamicQrisQrDataUrlForAmount,
  getDynamicQrisQrBufferForAmount,
  ensureUniqueAmount,
  canAccessTagihan,
  getAdminWaDigits,
  normalizeWaDigits,
  normalizeQrisPayloadRaw
};
