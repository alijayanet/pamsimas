const pino = require('pino');
const QRCode = require('qrcode');
const aplikasiModel = require('../models/aplikasiModel');
const env = require('../config/env');
const { calculateBillTotals } = require('./billingService');
const qrisService = require('./qrisService');

const state = {
  socket: null,
  status: 'idle',
  qrDataUrl: null,
  lastError: null,
  connectedNumber: null
};

async function loadBaileys() {
  return import('@whiskeysockets/baileys');
}

function normalizeWhatsappNumber(number) {
  if (!number) {
    return null;
  }

  const digits = String(number).replace(/\D/g, '');
  if (!digits) {
    return null;
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}@s.whatsapp.net`;
  }

  if (digits.startsWith('62')) {
    return `${digits}@s.whatsapp.net`;
  }

  return `${digits}@s.whatsapp.net`;
}

async function initWhatsapp() {
  try {
    state.status = 'connecting';
    state.lastError = null;

    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason,
      fetchLatestBaileysVersion
    } = await loadBaileys();

    const { state: authState, saveCreds } = await useMultiFileAuthState(env.waSessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      auth: authState,
      version,
      printQRInTerminal: false,
      browser: ['PAMSIMAS', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      logger: pino({ level: 'silent' })
    });

    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        state.qrDataUrl = await QRCode.toDataURL(qr);
        state.status = 'scan_required';
      }

      if (connection === 'open') {
        state.socket = socket;
        state.status = 'connected';
        state.qrDataUrl = null;
        state.connectedNumber = socket.user?.id || null;
      }

      if (connection === 'close') {
        state.socket = null;
        state.connectedNumber = null;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        state.status = statusCode === DisconnectReason.loggedOut ? 'logged_out' : 'disconnected';

        if (statusCode !== DisconnectReason.loggedOut) {
          setTimeout(() => {
            initWhatsapp();
          }, 3000);
        }
      }
    });

    state.socket = socket;
    return socket;
  } catch (error) {
    state.status = 'error';
    state.lastError = error.message;
    return null;
  }
}

function getWhatsappState() {
  return {
    status: state.status,
    qrDataUrl: state.qrDataUrl,
    lastError: state.lastError,
    connectedNumber: state.connectedNumber
  };
}

async function sendTextMessage(phoneNumber, message) {
  if (!state.socket || state.status !== 'connected') {
    return false;
  }

  const jid = normalizeWhatsappNumber(phoneNumber);
  if (!jid) {
    return false;
  }

  await state.socket.sendMessage(jid, { text: message });
  return true;
}

async function sendImageMessage(phoneNumber, imageBuffer, caption) {
  if (!state.socket || state.status !== 'connected') {
    return false;
  }

  const jid = normalizeWhatsappNumber(phoneNumber);
  if (!jid) {
    return false;
  }

  if (!imageBuffer) {
    return false;
  }

  await state.socket.sendMessage(jid, { image: imageBuffer, caption: String(caption || '') });
  return true;
}

function applyTemplate(template, variables) {
  const raw = String(template || '');
  return raw.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
    const value = variables && Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : '';
    return value === null || value === undefined ? '' : String(value);
  });
}

async function sendQrisPaymentRequest(tagihan) {
  if (!tagihan?.no_whatsapp) {
    return false;
  }

  const appConfig = aplikasiModel.getSettings();
  if (!qrisService.isStaticQrisReady(appConfig)) {
    return false;
  }

  const senderName = appConfig?.nama_instansi || appConfig?.nama_aplikasi || 'PAMSIMAS';
  const publicBaseUrl = appConfig?.resolved_base_url || env.baseUrl;

  const qris = qrisService.ensureUniqueAmount(tagihan);
  const qrisPageUrl = `${publicBaseUrl}/pelanggan/tagihan/${tagihan.id}/qris?access_key=${encodeURIComponent(tagihan.no_meteran)}`;
  const detailUrl = `${publicBaseUrl}/pelanggan/cek?keyword=${encodeURIComponent(tagihan.no_meteran)}`;

  const variables = {
    nama: tagihan.nama,
    no_meter: tagihan.no_meteran,
    periode: `${tagihan.bulan}/${tagihan.tahun}`,
    total: Number(tagihan.total_tagihan).toLocaleString('id-ID'),
    qris_nominal: Number(qris.amountUnique).toLocaleString('id-ID'),
    qris_kode: String(qris.uniqueCode).padStart(3, '0'),
    link: detailUrl,
    qris_link: qrisPageUrl
  };

  const tpl = String(appConfig?.wa_template_qris_tagihan || '').trim();
  let caption = applyTemplate(tpl, variables).trim();
  if (!caption) {
    caption = [
      senderName,
      '',
      `Yth. ${tagihan.nama},`,
      `Tagihan air periode ${tagihan.bulan}/${tagihan.tahun} sudah terbit.`,
      `No. Meter: ${tagihan.no_meteran}`,
      `Total: Rp${Number(tagihan.total_tagihan).toLocaleString('id-ID')}`,
      '',
      `Kode bayar QRIS: Rp${Number(qris.amountUnique).toLocaleString('id-ID')} (kode ${String(qris.uniqueCode).padStart(3, '0')})`,
      `Scan QR pada halaman: ${qrisPageUrl}`
    ].join('\n');
  }

  if (appConfig?.qris_send_wa_image) {
    const buf = await qrisService.getDynamicQrisQrBufferForAmount(appConfig, qris.amountUnique);
    if (buf) {
      const sent = await sendImageMessage(tagihan.no_whatsapp, buf, caption);
      if (sent) {
        return true;
      }
    }
  }

  return sendTextMessage(tagihan.no_whatsapp, `${caption}\n\n${qrisPageUrl}`);
}

async function sendBillNotification(tagihan, settings) {
  if (!tagihan?.no_whatsapp) {
    return false;
  }

  const appConfig = aplikasiModel.getSettings();
  const publicBaseUrl = appConfig?.resolved_base_url || env.baseUrl;
  const senderName = appConfig?.nama_instansi || appConfig?.nama_aplikasi || 'PAMSIMAS';
  const detailUrl = `${publicBaseUrl}/pelanggan/cek?keyword=${encodeURIComponent(tagihan.no_meteran)}`;
  let qrisLine = null;
  let qrisPayload = null;
  let qrisCaption = null;
  const breakdown = calculateBillTotals({
    totalKubik: tagihan.total_kubik,
    settings: {
      ...settings,
      denda_keterlambatan: Number(tagihan.denda || 0)
    },
    hasPreviousUnpaid: Number(tagihan.denda || 0) > 0
  });

  if (qrisService.isStaticQrisReady(appConfig) && tagihan?.status_bayar !== 'lunas') {
    try {
      const qris = qrisService.ensureUniqueAmount(tagihan);
      const qrisUrl = `${publicBaseUrl}/pelanggan/tagihan/${tagihan.id}/qris?access_key=${encodeURIComponent(tagihan.no_meteran)}`;
      qrisLine = `Bayar QRIS: Rp${Number(qris.amountUnique).toLocaleString('id-ID')} | ${qrisUrl}`;
      const variables = {
        nama: tagihan.nama,
        no_meter: tagihan.no_meteran,
        periode: `${tagihan.bulan}/${tagihan.tahun}`,
        total: Number(tagihan.total_tagihan).toLocaleString('id-ID'),
        qris_nominal: Number(qris.amountUnique).toLocaleString('id-ID'),
        qris_kode: String(qris.uniqueCode).padStart(3, '0'),
        link: detailUrl
      };

      const tpl = appConfig?.wa_template_qris_tagihan || '';
      qrisCaption = applyTemplate(tpl, variables).trim();
      if (!qrisCaption) {
        qrisCaption = [
          senderName,
          '',
          `Yth. ${tagihan.nama},`,
          `Tagihan air periode ${tagihan.bulan}/${tagihan.tahun} sudah terbit.`,
          `No. Meter: ${tagihan.no_meteran}`,
          `Total: Rp${Number(tagihan.total_tagihan).toLocaleString('id-ID')}`,
          '',
          `Kode bayar QRIS: Rp${Number(qris.amountUnique).toLocaleString('id-ID')} (kode ${String(qris.uniqueCode).padStart(3, '0')})`,
          `Cek detail: ${detailUrl}`
        ].join('\n');
      }

      if (appConfig?.qris_send_wa_image) {
        const buf = await qrisService.getDynamicQrisQrBufferForAmount(appConfig, qris.amountUnique);
        if (buf) {
          qrisPayload = buf;
        }
      }
    } catch (error) {
      qrisLine = null;
    }
  }

  const message = [
    senderName,
    '',
    `Yth. ${tagihan.nama},`,
    `Pemakaian air ${tagihan.bulan}/${tagihan.tahun} telah dicatat.`,
    `Meter awal: ${tagihan.meteran_awal}`,
    `Meter akhir: ${tagihan.meteran_akhir}`,
    `Total pakai: ${tagihan.total_kubik} m3`,
    breakdown.abonemenApplied ? `Minimum abonement: ${Number(breakdown.minimumPemakaianKubik).toLocaleString('id-ID')} m3` : null,
    breakdown.abonemenApplied ? `Kubik ditagih: ${Number(breakdown.kubikDitagihkan).toLocaleString('id-ID')} m3` : null,
    `Biaya air: Rp${Number(breakdown.biayaAir).toLocaleString('id-ID')}`,
    `Biaya admin: Rp${Number(settings.biaya_admin).toLocaleString('id-ID')}`,
    `Denda: Rp${Number(tagihan.denda || 0).toLocaleString('id-ID')}`,
    `Total tagihan: Rp${Number(tagihan.total_tagihan).toLocaleString('id-ID')}`,
    qrisLine,
    `Cek detail dan foto meteran: ${detailUrl}`
  ].filter(Boolean).join('\n');

  if (qrisPayload && qrisCaption) {
    const sent = await sendImageMessage(tagihan.no_whatsapp, qrisPayload, qrisCaption);
    if (sent) {
      return true;
    }
  }

  return sendTextMessage(tagihan.no_whatsapp, message);
}

async function sendBillUpdateNotification(tagihan, note) {
  if (!tagihan?.no_whatsapp) {
    return false;
  }

  const appConfig = aplikasiModel.getSettings();
  const publicBaseUrl = appConfig?.resolved_base_url || env.baseUrl;
  const senderName = appConfig?.nama_instansi || appConfig?.nama_aplikasi || 'PAMSIMAS';
  const detailUrl = `${publicBaseUrl}/pelanggan/cek?keyword=${encodeURIComponent(tagihan.no_meteran)}`;

  const message = [
    senderName,
    '',
    `Yth. ${tagihan.nama},`,
    `Tagihan air periode ${tagihan.bulan}/${tagihan.tahun} telah diperbarui.`,
    note ? String(note) : null,
    '',
    `Meter awal: ${tagihan.meteran_awal}`,
    `Meter akhir: ${tagihan.meteran_akhir}`,
    `Total pakai: ${tagihan.total_kubik} m3`,
    `Total tagihan terbaru: Rp${Number(tagihan.total_tagihan).toLocaleString('id-ID')}`,
    `Cek detail: ${detailUrl}`
  ].filter(Boolean).join('\n');

  return sendTextMessage(tagihan.no_whatsapp, message);
}

async function sendPaymentReceipt(tagihan) {
  if (!tagihan?.no_whatsapp) {
    return false;
  }

  const appConfig = aplikasiModel.getSettings();
  const senderName = appConfig?.nama_instansi || appConfig?.nama_aplikasi || 'PAMSIMAS';
  const message = [
    senderName,
    '',
    'Pembayaran PAMSIMAS berhasil diterima.',
    `Nama: ${tagihan.nama}`,
    `No. Meter: ${tagihan.no_meteran}`,
    `Periode: ${tagihan.bulan}/${tagihan.tahun}`,
    `Metode: ${tagihan.metode_bayar || 'manual'}`,
    `Total: Rp${Number(tagihan.total_tagihan).toLocaleString('id-ID')}`,
    'Terima kasih telah melakukan pembayaran tepat waktu.'
  ].join('\n');

  return sendTextMessage(tagihan.no_whatsapp, message);
}

async function broadcastAnnouncement(recipients, message) {
  const results = [];
  const appConfig = aplikasiModel.getSettings();
  const senderName = appConfig?.nama_instansi || appConfig?.nama_aplikasi || 'PAMSIMAS';

  for (const recipient of recipients) {
    const sent = await sendTextMessage(recipient.no_whatsapp, `${senderName}\n\nPengumuman\n\n${message}`);
    results.push({ recipient, sent });
  }

  return results;
}

module.exports = {
  initWhatsapp,
  getWhatsappState,
  sendTextMessage,
  sendImageMessage,
  sendQrisPaymentRequest,
  sendBillNotification,
  sendBillUpdateNotification,
  sendPaymentReceipt,
  broadcastAnnouncement,
  normalizeWhatsappNumber
};
