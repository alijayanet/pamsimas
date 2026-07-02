const bcrypt = require('bcryptjs');
const pelangganModel = require('../models/pelangganModel');
const meterModel = require('../models/meterModel');
const tagihanModel = require('../models/tagihanModel');
const pengaturanModel = require('../models/pengaturanModel');
const aplikasiModel = require('../models/aplikasiModel');
const userModel = require('../models/userModel');
const { calculateBillTotals } = require('../services/billingService');
const qrisService = require('../services/qrisService');
const whatsappService = require('../services/whatsappService');

function buildLookupUrl(tagihan) {
  return `/pelanggan/cek?keyword=${encodeURIComponent(tagihan.no_meteran || tagihan.no_whatsapp || '')}`;
}

function getSessionPelanggan(req) {
  if (req.session.user?.role !== 'pelanggan') {
    return null;
  }

  return pelangganModel.findByUserId(req.session.user.id);
}

function canAccessTagihanRequest(req, tagihan, accessKey) {
  const pelanggan = getSessionPelanggan(req);
  return qrisService.canAccessTagihan(tagihan, accessKey, pelanggan?.id);
}

function enrichBillDetails(bill, settings) {
  if (!bill) {
    return null;
  }

  const hargaPerKubik = Number(settings?.harga_per_kubik || 0);
  const totals = calculateBillTotals({
    totalKubik: bill.total_kubik,
    settings: {
      ...settings,
      denda_keterlambatan: Number(bill.denda || 0)
    },
    hasPreviousUnpaid: Number(bill.denda || 0) > 0
  });

  return {
    ...bill,
    detail_tagihan: {
      hargaPerKubik,
      minimumPemakaianKubik: totals.minimumPemakaianKubik,
      kubikDitagihkan: totals.kubikDitagihkan,
      abonemenApplied: totals.abonemenApplied,
      biayaAdmin: totals.biayaAdmin,
      biayaAir: totals.biayaAir,
      denda: totals.denda,
      meterAwal: Number(bill.meteran_awal || 0),
      meterAkhir: Number(bill.meteran_akhir || 0),
      totalKubik: totals.totalKubik,
      totalTagihan: totals.totalTagihan,
      metodeBayar: bill.metode_bayar || '-',
      tanggalBayar: bill.tgl_bayar || null
    }
  };
}

function buildDashboardState(pelanggan, settings) {
  const bills = tagihanModel.getRecentHistoryByPelanggan(pelanggan.id, 36)
    .map((bill) => enrichBillDetails(bill, settings));
  const latestBill = bills[0] || null;
  const unpaidBills = bills.filter((item) => item.status_bayar !== 'lunas');
  const paidBills = bills.filter((item) => item.status_bayar === 'lunas');
  const chartBills = bills.slice(0, 6).reverse();

  return {
    latestBill,
    unpaidBills,
    paidBills,
    bills,
    chart: {
      labels: chartBills.map((item) => `${String(item.bulan).padStart(2, '0')}/${item.tahun}`),
      usage: chartBills.map((item) => Number(item.total_kubik || 0)),
      amount: chartBills.map((item) => Number(item.total_tagihan || 0))
    },
    latestUsageNote: latestBill ? {
      periode: `${latestBill.bulan}/${latestBill.tahun}`,
      meterAwal: latestBill.detail_tagihan.meterAwal,
      meterAkhir: latestBill.detail_tagihan.meterAkhir,
      totalKubik: latestBill.detail_tagihan.totalKubik,
      kubikDitagihkan: latestBill.detail_tagihan.kubikDitagihkan,
      minimumPemakaianKubik: latestBill.detail_tagihan.minimumPemakaianKubik,
      abonemenApplied: latestBill.detail_tagihan.abonemenApplied,
      biayaAir: latestBill.detail_tagihan.biayaAir,
      hargaPerKubik: latestBill.detail_tagihan.hargaPerKubik,
      biayaAdmin: latestBill.detail_tagihan.biayaAdmin,
      denda: latestBill.detail_tagihan.denda,
      totalTagihan: latestBill.detail_tagihan.totalTagihan,
      statusBayar: latestBill.status_bayar,
      tanggalBayar: latestBill.detail_tagihan.tanggalBayar,
      metodeBayar: latestBill.detail_tagihan.metodeBayar
    } : null,
    summary: {
      totalTagihan: bills.length,
      belumBayar: unpaidBills.length,
      sudahLunas: paidBills.length,
      totalTertunggak: unpaidBills.reduce((sum, item) => sum + Number(item.total_tagihan || 0), 0),
      totalTerbayar: paidBills.reduce((sum, item) => sum + Number(item.total_tagihan || 0), 0)
    }
  };
}

function showLookup(req, res) {
  const keyword = req.query.keyword || '';
  const settings = pengaturanModel.getSettings();
  const appConfig = aplikasiModel.getSettings();
  let pelanggan = null;
  let latestBill = null;
  let history = [];
  let breakdown = null;
  let latestReading = null;
  let estimateBreakdown = null;
  let searchResults = [];

  if (keyword) {
    pelanggan = pelangganModel.findByMeterOrPhone(keyword);
    if (!pelanggan) {
      const trimmed = String(keyword || '').trim();
      if (trimmed.length >= 3) {
        searchResults = pelangganModel.search(trimmed).slice(0, 10);
      }
    }
    if (pelanggan) {
      latestBill = enrichBillDetails(tagihanModel.getLatestByPelanggan(pelanggan.id), settings);
      history = tagihanModel.getRecentHistoryByPelanggan(pelanggan.id, 6)
        .map((item) => enrichBillDetails(item, settings));

      if (latestBill) {
        breakdown = latestBill.detail_tagihan;
      } else {
        latestReading = meterModel.getLastReadingByPelanggan(pelanggan.id);
        if (latestReading) {
          const totals = calculateBillTotals({
            totalKubik: latestReading.total_kubik,
            settings,
            hasPreviousUnpaid: false
          });
          estimateBreakdown = {
            periodeBaca: `${latestReading.bulan}/${latestReading.tahun}`,
            meterAwal: Number(latestReading.meteran_awal || 0),
            meterAkhir: Number(latestReading.meteran_akhir || 0),
            totalKubik: totals.totalKubik,
            kubikDitagihkan: totals.kubikDitagihkan,
            minimumPemakaianKubik: totals.minimumPemakaianKubik,
            abonemenApplied: totals.abonemenApplied,
            hargaPerKubik: Number(settings?.harga_per_kubik || 0),
            biayaAir: totals.biayaAir,
            biayaAdmin: totals.biayaAdmin,
            denda: 0,
            totalTagihan: totals.totalTagihan
          };
        }
      }
    }
  }

  return res.render('pelanggan/cek-tagihan', {
    title: 'Cek Tagihan Pelanggan',
    keyword,
    searchResults,
    pelanggan,
    latestBill,
    history,
    breakdown,
    latestReading,
    estimateBreakdown,
    accessKey: pelanggan ? (pelanggan.no_meteran || pelanggan.no_whatsapp || keyword) : keyword,
    qrisEnabled: qrisService.isStaticQrisReady(appConfig)
  });
}

function showDashboard(req, res) {
  const pelanggan = getSessionPelanggan(req);
  if (!pelanggan) {
    req.flash('danger', 'Data pelanggan tidak ditemukan.');
    return res.redirect('/pelanggan/login');
  }

  const appConfig = aplikasiModel.getSettings();
  const settings = pengaturanModel.getSettings();
  const state = buildDashboardState(pelanggan, settings);

  return res.render('pelanggan/dashboard', {
    title: 'Dashboard Pelanggan',
    pelanggan,
    latestBill: state.latestBill,
    latestUsageNote: state.latestUsageNote,
    unpaidBills: state.unpaidBills,
    summary: state.summary,
    paidBills: state.paidBills.slice(0, 5),
    usageChart: state.chart,
    pricing: settings,
    qrisEnabled: qrisService.isStaticQrisReady(appConfig),
    activeTab: 'home'
  });
}

function showHistoryDashboard(req, res) {
  const pelanggan = getSessionPelanggan(req);
  if (!pelanggan) {
    req.flash('danger', 'Data pelanggan tidak ditemukan.');
    return res.redirect('/pelanggan/login');
  }

  const settings = pengaturanModel.getSettings();
  const state = buildDashboardState(pelanggan, settings);

  return res.render('pelanggan/riwayat', {
    title: 'Riwayat Pembayaran',
    pelanggan,
    history: state.bills,
    pricing: settings,
    activeTab: 'history'
  });
}

function showBillsDashboard(req, res) {
  const pelanggan = getSessionPelanggan(req);
  if (!pelanggan) {
    req.flash('danger', 'Data pelanggan tidak ditemukan.');
    return res.redirect('/pelanggan/login');
  }

  const appConfig = aplikasiModel.getSettings();
  const settings = pengaturanModel.getSettings();
  const state = buildDashboardState(pelanggan, settings);

  return res.render('pelanggan/tagihan-dashboard', {
    title: 'Tagihan Saya',
    pelanggan,
    bills: state.bills,
    unpaidBills: state.unpaidBills,
    latestUsageNote: state.latestUsageNote,
    pricing: settings,
    qrisEnabled: qrisService.isStaticQrisReady(appConfig),
    activeTab: 'bill'
  });
}

function showAccountDashboard(req, res) {
  const pelanggan = getSessionPelanggan(req);
  if (!pelanggan) {
    req.flash('danger', 'Data pelanggan tidak ditemukan.');
    return res.redirect('/pelanggan/login');
  }

  const settings = pengaturanModel.getSettings();
  const state = buildDashboardState(pelanggan, settings);

  return res.render('pelanggan/akun', {
    title: 'Akun Pelanggan',
    pelanggan,
    summary: state.summary,
    activeTab: 'account'
  });
}

function updateAccountPassword(req, res) {
  const pelanggan = getSessionPelanggan(req);
  if (!pelanggan) {
    req.flash('danger', 'Data pelanggan tidak ditemukan.');
    return res.redirect('/pelanggan/login');
  }

  const { current_password, new_password, confirm_password } = req.body;
  const user = userModel.findByIdFull(req.session.user.id);

  if (!user || user.role !== 'pelanggan') {
    req.flash('danger', 'Akun pelanggan tidak valid.');
    return res.redirect('/pelanggan/akun');
  }

  if (!current_password || !new_password || !confirm_password) {
    req.flash('danger', 'Semua field password wajib diisi.');
    return res.redirect('/pelanggan/akun');
  }

  if (!bcrypt.compareSync(current_password, user.password)) {
    req.flash('danger', 'Password lama tidak sesuai.');
    return res.redirect('/pelanggan/akun');
  }

  if (String(new_password).length < 6) {
    req.flash('danger', 'Password baru minimal 6 karakter.');
    return res.redirect('/pelanggan/akun');
  }

  if (new_password !== confirm_password) {
    req.flash('danger', 'Konfirmasi password baru tidak sama.');
    return res.redirect('/pelanggan/akun');
  }

  if (current_password === new_password) {
    req.flash('danger', 'Password baru harus berbeda dari password lama.');
    return res.redirect('/pelanggan/akun');
  }

  userModel.updatePassword(user.id, new_password);
  req.flash('success', 'Password pelanggan berhasil diperbarui.');
  return res.redirect('/pelanggan/akun');
}

async function showQrisPage(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.params.id);
  const accessKey = req.query.access_key || '';
  const appConfig = aplikasiModel.getSettings();

  if (!tagihan || !canAccessTagihanRequest(req, tagihan, accessKey)) {
    return res.status(404).render('auth/error', {
      title: 'Akses Tidak Valid',
      message: 'Tagihan tidak ditemukan atau akses QRIS tidak valid.'
    });
  }

  if (!qrisService.isStaticQrisReady(appConfig)) {
    return res.status(400).render('auth/error', {
      title: 'QRIS Belum Aktif',
      message: 'Metode pembayaran QRIS statik belum diaktifkan oleh admin.'
    });
  }

  if (tagihan.status_bayar === 'lunas') {
    return res.redirect(buildLookupUrl(tagihan));
  }

  const qris = qrisService.ensureUniqueAmount(tagihan);
  const freshBill = tagihanModel.getByIdDetail(tagihan.id);
  const qrisQrUrl = await qrisService.getDynamicQrisQrDataUrlForAmount(appConfig, qris.amountUnique) || await qrisService.getQrisQrUrl(appConfig);
  const isDashboardAccess = req.session.user?.role === 'pelanggan';
  const backUrl = isDashboardAccess
    ? '/pelanggan/tagihan'
    : `/pelanggan/cek?keyword=${encodeURIComponent(accessKey)}`;
  const statusUrl = isDashboardAccess
    ? `/pelanggan/tagihan/${tagihan.id}/status`
    : `/pelanggan/tagihan/${tagihan.id}/status?access_key=${encodeURIComponent(accessKey)}`;
  const redirectUrl = isDashboardAccess
    ? '/pelanggan/tagihan'
    : `/pelanggan/cek?keyword=${encodeURIComponent(accessKey)}`;

  return res.render('pelanggan/qris', {
    title: 'Pembayaran QRIS Statik',
    tagihan: freshBill,
    qris,
    qrisQrUrl,
    accessKey,
    backUrl,
    statusUrl,
    redirectUrl,
    isDashboardAccess,
    helpText: appConfig.qris_help_text || 'Pastikan nominal dibayar sama persis.',
    adminWaDigits: qrisService.getAdminWaDigits(appConfig)
  });
}

function getPaymentStatus(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.params.id);
  const accessKey = req.query.access_key || '';

  if (!tagihan || !canAccessTagihanRequest(req, tagihan, accessKey)) {
    return res.status(404).json({ success: false, status: 'error' });
  }

  return res.json({
    success: true,
    status: tagihan.status_bayar
  });
}

async function uploadPaymentProof(req, res) {
  const tagihan = tagihanModel.getByIdDetail(req.params.id);
  const accessKey = req.body.access_key || '';
  const appConfig = aplikasiModel.getSettings();
  const isDashboardAccess = req.session.user?.role === 'pelanggan';
  const qrisRedirectUrl = isDashboardAccess
    ? `/pelanggan/tagihan/${tagihan?.id || req.params.id}/qris`
    : `/pelanggan/tagihan/${tagihan?.id || req.params.id}/qris?access_key=${encodeURIComponent(accessKey)}`;

  if (!tagihan || !canAccessTagihanRequest(req, tagihan, accessKey)) {
    return res.status(404).render('auth/error', {
      title: 'Akses Tidak Valid',
      message: 'Tagihan tidak ditemukan atau akses QRIS tidak valid.'
    });
  }

  if (!req.file) {
    req.flash('danger', 'Bukti pembayaran belum dipilih.');
    return res.redirect(qrisRedirectUrl);
  }

  const paymentProofUrl = `/uploads/payment-proofs/${req.file.filename}`;
  tagihanModel.savePaymentProof(tagihan.id, paymentProofUrl);

  const freshBill = tagihanModel.getByIdDetail(tagihan.id);
  const qris = qrisService.ensureUniqueAmount(freshBill);

  try {
    const adminWaDigits = qrisService.getAdminWaDigits(appConfig);
    if (adminWaDigits) {
      const text = [
        `${appConfig.nama_instansi || appConfig.nama_aplikasi || 'PAMSIMAS'}`,
        '',
        'Konfirmasi pembayaran QRIS statik',
        `Nama: ${freshBill.nama}`,
        `No. Meter: ${freshBill.no_meteran}`,
        `Periode: ${freshBill.bulan}/${freshBill.tahun}`,
        `Nominal: Rp ${Number(qris.amountUnique).toLocaleString('id-ID')} (kode ${String(qris.uniqueCode).padStart(3, '0')})`,
        `Bukti: ${appConfig.resolved_base_url}${paymentProofUrl}`
      ].join('\n');

      await whatsappService.sendTextMessage(adminWaDigits, text);
    }
  } catch (error) {
  }

  req.flash('success', 'Bukti pembayaran berhasil diupload.');
  return res.redirect(qrisRedirectUrl);
}

module.exports = {
  showLookup,
  showDashboard,
  showHistoryDashboard,
  showBillsDashboard,
  showAccountDashboard,
  updateAccountPassword,
  showQrisPage,
  getPaymentStatus,
  uploadPaymentProof
};
