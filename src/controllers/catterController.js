const dayjs = require('dayjs');
const pelangganModel = require('../models/pelangganModel');
const meterModel = require('../models/meterModel');
const pengaturanModel = require('../models/pengaturanModel');
const tagihanModel = require('../models/tagihanModel');
const { calculateBillTotals } = require('../services/billingService');
const whatsappService = require('../services/whatsappService');
const { isCollectionWindowOpen, getCollectionWindow } = require('../services/tagihanGenerationService');

function showDashboard(req, res) {
  const keyword = req.query.keyword || '';
  const pelangganId = req.query.pelanggan_id || '';
  const now = dayjs();
  const results = keyword ? pelangganModel.search(keyword) : [];
  const selectedPelanggan = pelangganId ? pelangganModel.getById(pelangganId) : null;
  const lastReading = selectedPelanggan ? meterModel.getLastReadingByPelanggan(selectedPelanggan.id) : null;
  const settings = pengaturanModel.getSettings();

  return res.render('catter/index', {
    title: 'Input Meteran Catter',
    keyword,
    results,
    selectedPelanggan,
    month: now.month() + 1,
    year: now.year(),
    meteranAwal: lastReading ? lastReading.meteran_akhir : 0,
    history: meterModel.getCurrentMonthHistory(req.session.user.id, now.month() + 1, now.year()),
    collectionWindow: getCollectionWindow(settings),
    isCollectionWindowOpen: isCollectionWindowOpen(settings, now),
    canBypassWindow: req.session.user.role === 'admin'
  });
}

async function storeReading(req, res) {
  const pelanggan = pelangganModel.getById(req.body.pelanggan_id);
  if (!pelanggan) {
    req.flash('danger', 'Pelanggan tidak ditemukan.');
    return res.redirect('/catter');
  }

  const bulan = Number(req.body.bulan);
  const tahun = Number(req.body.tahun);
  if (meterModel.findByPeriod(pelanggan.id, bulan, tahun)) {
    req.flash('danger', 'Pencatatan periode ini sudah ada.');
    return res.redirect(`/catter?pelanggan_id=${pelanggan.id}`);
  }

  const settings = pengaturanModel.getSettings();
  const now = dayjs();
  if (req.session.user.role === 'catter' && !isCollectionWindowOpen(settings, now)) {
    const collectionWindow = getCollectionWindow(settings);
    req.flash('danger', `Input meter hanya dibuka tanggal ${collectionWindow.startDay}-${collectionWindow.endDay}.`);
    return res.redirect(`/catter?pelanggan_id=${pelanggan.id}`);
  }

  const lastReading = meterModel.getLastReadingByPelanggan(pelanggan.id);
  const meteranAwal = lastReading ? Number(lastReading.meteran_akhir || 0) : Number(req.body.meteran_awal || 0);
  const meteranAkhir = Number(req.body.meteran_akhir || 0);
  if (meteranAkhir < meteranAwal) {
    req.flash('danger', 'Meteran akhir tidak boleh lebih kecil dari meteran awal.');
    return res.redirect(`/catter?pelanggan_id=${pelanggan.id}`);
  }

  const totalKubik = meteranAkhir - meteranAwal;

  const fotoPath = req.file ? `/uploads/meter/${req.file.filename}` : null;
  meterModel.create({
    pelanggan_id: pelanggan.id,
    catter_id: req.session.user.id,
    bulan,
    tahun,
    meteran_awal: meteranAwal,
    meteran_akhir: meteranAkhir,
    total_kubik: totalKubik,
    foto_bukti: fotoPath,
    status_input: req.body.status_input || 'pending'
  });

  req.flash('success', 'Input meteran berhasil disimpan. Tagihan akan dibuat otomatis pada periode generate berikutnya atau melalui menu generate manual admin.');
  return res.redirect(`/catter?pelanggan_id=${pelanggan.id}`);
}

function canAccessReading(req, reading) {
  if (!req.session?.user || !reading) {
    return false;
  }

  if (req.session.user.role === 'admin') {
    return true;
  }

  return Number(reading.catter_id) === Number(req.session.user.id);
}

function showEditReading(req, res) {
  const reading = meterModel.getByIdDetail(req.params.id);
  if (!reading || !canAccessReading(req, reading)) {
    req.flash('danger', 'Data pencatatan tidak ditemukan.');
    return res.redirect('/catter');
  }

  const settings = pengaturanModel.getSettings();
  const now = dayjs();
  if (req.session.user.role === 'catter' && !isCollectionWindowOpen(settings, now)) {
    const collectionWindow = getCollectionWindow(settings);
    req.flash('danger', `Edit meter hanya dibuka tanggal ${collectionWindow.startDay}-${collectionWindow.endDay}.`);
    return res.redirect('/catter');
  }

  if (reading.tagihan_status_bayar === 'lunas') {
    req.flash('warning', 'Tagihan sudah lunas, pencatatan tidak bisa diedit.');
    return res.redirect('/catter');
  }

  return res.render('catter/edit', {
    title: 'Edit Pencatatan Meteran',
    reading
  });
}

async function updateReading(req, res) {
  const reading = meterModel.getByIdDetail(req.params.id);
  if (!reading || !canAccessReading(req, reading)) {
    req.flash('danger', 'Data pencatatan tidak ditemukan.');
    return res.redirect('/catter');
  }

  const settings = pengaturanModel.getSettings();
  const now = dayjs();
  if (req.session.user.role === 'catter' && !isCollectionWindowOpen(settings, now)) {
    const collectionWindow = getCollectionWindow(settings);
    req.flash('danger', `Edit meter hanya dibuka tanggal ${collectionWindow.startDay}-${collectionWindow.endDay}.`);
    return res.redirect('/catter');
  }

  if (reading.tagihan_status_bayar === 'lunas') {
    req.flash('warning', 'Tagihan sudah lunas, pencatatan tidak bisa diedit.');
    return res.redirect('/catter');
  }

  const meteranAwal = Number(req.body.meteran_awal || 0);
  const meteranAkhir = Number(req.body.meteran_akhir || 0);
  if (meteranAkhir < meteranAwal) {
    req.flash('danger', 'Meteran akhir tidak boleh lebih kecil dari meteran awal.');
    return res.redirect(`/catter/pencatatan/${reading.id}/edit`);
  }

  const totalKubik = meteranAkhir - meteranAwal;
  const fotoPath = req.file ? `/uploads/meter/${req.file.filename}` : (req.body.current_foto_bukti || reading.foto_bukti || null);

  meterModel.updateById(reading.id, {
    meteran_awal: meteranAwal,
    meteran_akhir: meteranAkhir,
    total_kubik: totalKubik,
    foto_bukti: fotoPath,
    status_input: req.body.status_input || 'pending'
  });

  const tagihanId = tagihanModel.findIdByPencatatanId(reading.id);
  if (tagihanId) {
    const bill = tagihanModel.getByIdDetail(tagihanId);
    if (bill && bill.status_bayar !== 'lunas') {
      const totals = calculateBillTotals({
        totalKubik,
        settings,
        hasPreviousUnpaid: tagihanModel.hasPreviousUnpaidExcluding(bill.pelanggan_id, bill.id)
      });

      tagihanModel.updateRecalculated(bill.id, totals);
      const shouldSendWa = String(req.body.send_wa || '') === '1';
      const updatedBill = tagihanModel.getByIdDetail(bill.id);

      if (bill.qris_amount_unique) {
        tagihanModel.clearQrisUnique(bill.id);
        const refreshedBill = tagihanModel.getByIdDetail(bill.id);

        if (shouldSendWa && refreshedBill) {
          try {
            await whatsappService.sendBillUpdateNotification(refreshedBill, 'Catatan: data pemakaian diperbarui oleh petugas.');
          } catch (error) {}
        }

        req.flash('warning', 'Pencatatan diperbarui. Tagihan ikut diperbarui dan kode unik QRIS direset (silakan generate QRIS lagi).');
        return res.redirect('/catter');
      }

      if (shouldSendWa && updatedBill) {
        try {
          const ok = await whatsappService.sendBillUpdateNotification(updatedBill, 'Catatan: data pemakaian diperbarui oleh petugas.');
          if (!ok) {
            req.flash('warning', 'Pencatatan diperbarui, namun WhatsApp tidak terkirim (pastikan WA terhubung dan nomor pelanggan terisi).');
            return res.redirect('/catter');
          }
        } catch (error) {
          req.flash('warning', 'Pencatatan diperbarui, namun terjadi error saat mengirim WhatsApp.');
          return res.redirect('/catter');
        }
      }

      req.flash('success', shouldSendWa ? 'Pencatatan diperbarui. Tagihan ikut dihitung ulang dan notifikasi WhatsApp dikirim.' : 'Pencatatan diperbarui. Tagihan ikut dihitung ulang sesuai data terbaru.');
      return res.redirect('/catter');
    }
  }

  req.flash('success', 'Pencatatan berhasil diperbarui.');
  return res.redirect('/catter');
}

function deleteReading(req, res) {
  const reading = meterModel.getByIdDetail(req.params.id);
  if (!reading || !canAccessReading(req, reading)) {
    req.flash('danger', 'Data pencatatan tidak ditemukan.');
    return res.redirect('/catter');
  }

  const tagihanId = tagihanModel.findIdByPencatatanId(reading.id);
  if (tagihanId) {
    req.flash('danger', 'Pencatatan tidak bisa dihapus karena tagihan sudah dibuat. Gunakan fitur edit untuk koreksi data.');
    return res.redirect('/catter');
  }

  meterModel.deleteById(reading.id);
  req.flash('success', 'Pencatatan berhasil dihapus.');
  return res.redirect('/catter');
}

module.exports = {
  showDashboard,
  storeReading,
  showEditReading,
  updateReading,
  deleteReading
};
