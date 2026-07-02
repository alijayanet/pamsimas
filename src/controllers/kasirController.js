const tagihanModel = require('../models/tagihanModel');
const keuanganModel = require('../models/keuanganModel');
const pembayaranLogModel = require('../models/pembayaranLogModel');
const qrisNotifLogModel = require('../models/qrisNotifLogModel');
const whatsappService = require('../services/whatsappService');
const qrisService = require('../services/qrisService');

function showDashboard(req, res) {
  const keyword = req.query.keyword || '';
  const tagihanId = req.query.tagihan_id || '';
  const results = keyword ? tagihanModel.searchPendingForPayment(keyword) : [];
  const selectedBill = tagihanId ? tagihanModel.getByIdDetail(tagihanId) : null;
  const recentPayments = req.session.user.role === 'admin'
    ? pembayaranLogModel.getRecent(20)
    : pembayaranLogModel.getRecentByUser(req.session.user.id, 20);

  return res.render('kasir/index', {
    title: 'Kasir / Loket Pembayaran',
    keyword,
    results,
    selectedBill,
    recentPayments,
    qrisNotifLogs: qrisNotifLogModel.getRecent(15)
  });
}

async function storePayment(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.body.tagihan_id);
  if (!tagihan) {
    req.flash('danger', 'Tagihan tidak ditemukan.');
    return res.redirect('/kasir');
  }

  if (tagihan.status_bayar === 'lunas') {
    req.flash('warning', 'Tagihan sudah lunas.');
    return res.redirect('/kasir');
  }

  const metodeBayar = req.body.metode_bayar || 'tunai';

  tagihanModel.markPaid(tagihan.id, metodeBayar);
  keuanganModel.createEntry({
    tipe: 'pemasukan',
    jumlah: tagihan.total_tagihan,
    keterangan: `Pembayaran loket ${tagihan.nama} periode ${tagihan.bulan}/${tagihan.tahun}`
  });

  const pembayaranId = pembayaranLogModel.create({
    tagihan_id: tagihan.id,
    user_id: req.session.user.id,
    jumlah_bayar: tagihan.total_tagihan,
    metode_bayar: metodeBayar,
    keterangan: req.body.keterangan || 'Pembayaran melalui loket'
  });

  const updatedBill = tagihanModel.getByIdDetail(tagihan.id);
  await whatsappService.sendPaymentReceipt(updatedBill);

  req.flash('success', 'Pembayaran berhasil diproses.');
  return res.redirect(`/kasir/kwitansi/${pembayaranId}`);
}

function showReceipt(req, res) {
  const receipt = pembayaranLogModel.getByIdDetail(req.params.id);
  if (!receipt) {
    req.flash('danger', 'Kwitansi tidak ditemukan.');
    return res.redirect('/kasir');
  }

  return res.render('kasir/receipt', {
    title: 'Kwitansi Pembayaran',
    receipt
  });
}

function assignQrisCode(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.params.id);
  if (!tagihan) {
    req.flash('danger', 'Tagihan tidak ditemukan.');
    return res.redirect('/kasir');
  }

  if (tagihan.status_bayar === 'lunas') {
    req.flash('warning', 'Tagihan sudah lunas.');
    return res.redirect(`/kasir?tagihan_id=${tagihan.id}`);
  }

  if (String(req.query.force || '') === '1') {
    tagihanModel.clearQrisUnique(tagihan.id);
  }

  try {
    qrisService.ensureUniqueAmount(tagihanModel.getByIdDetail(tagihan.id));
    req.flash('success', 'Kode unik QRIS berhasil disiapkan.');
  } catch (error) {
    req.flash('danger', error.message);
  }

  return res.redirect(`/kasir?tagihan_id=${tagihan.id}`);
}

function clearQrisCode(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.params.id);
  if (!tagihan) {
    req.flash('danger', 'Tagihan tidak ditemukan.');
    return res.redirect('/kasir');
  }

  tagihanModel.clearQrisUnique(tagihan.id);
  req.flash('success', 'Kode unik QRIS berhasil dihapus.');
  return res.redirect(`/kasir?tagihan_id=${tagihan.id}`);
}

async function sendQrisToCustomer(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.params.id);
  if (!tagihan) {
    req.flash('danger', 'Tagihan tidak ditemukan.');
    return res.redirect('/kasir');
  }

  const sent = await whatsappService.sendQrisPaymentRequest(tagihan);
  if (!sent) {
    req.flash('warning', 'Gagal mengirim QRIS via WhatsApp. Pastikan WA terhubung, QRIS aktif, dan nomor pelanggan terisi.');
    return res.redirect(`/kasir?tagihan_id=${tagihan.id}`);
  }

  req.flash('success', 'QRIS berhasil dikirim ke pelanggan via WhatsApp.');
  return res.redirect(`/kasir?tagihan_id=${tagihan.id}`);
}

module.exports = {
  showDashboard,
  storePayment,
  showReceipt,
  assignQrisCode,
  clearQrisCode,
  sendQrisToCustomer
};
