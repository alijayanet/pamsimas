const db = require('../config/database');

const createStmt = db.prepare(`
  INSERT INTO tagihan (
    pencatatan_id,
    bulan_tagihan,
    tahun_tagihan,
    total_tagihan,
    status_bayar,
    denda,
    harga_per_kubik_snapshot,
    minimum_pemakaian_kubik_snapshot,
    kubik_ditagihkan,
    biaya_air,
    biaya_admin_snapshot,
    generated_mode,
    generated_at
  )
  VALUES (?, ?, ?, ?, 'belum_bayar', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);
const latestByPelangganStmt = db.prepare(`
  SELECT
    t.*,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.alamat,
    p.no_whatsapp
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE p.id = ?
  ORDER BY pm.tahun DESC, pm.bulan DESC, t.id DESC
  LIMIT 1
`);
const recentHistoryStmt = db.prepare(`
  SELECT
    t.*,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  WHERE pm.pelanggan_id = ?
  ORDER BY pm.tahun DESC, pm.bulan DESC
  LIMIT ?
`);
const detailByIdStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.id = ?
  LIMIT 1
`);
const unpaidByPeriodStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'belum_bayar'
    AND COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
  ORDER BY p.nama ASC, t.id ASC
`);
const billsByPeriodAllStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
  ORDER BY p.nama ASC, t.id ASC
  LIMIT ?
`);
const billsByPeriodUnpaidStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'belum_bayar'
    AND COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
  ORDER BY p.nama ASC, t.id ASC
  LIMIT ?
`);
const billsByPeriodPaidStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'lunas'
    AND COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
  ORDER BY p.nama ASC, t.id ASC
  LIMIT ?
`);
const billsByPeriodAllWithKeywordStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
    AND (
      p.no_meteran LIKE ?
      OR p.nama LIKE ?
      OR COALESCE(p.no_whatsapp, '') LIKE ?
    )
  ORDER BY p.nama ASC, t.id ASC
  LIMIT ?
`);
const billsByPeriodUnpaidWithKeywordStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'belum_bayar'
    AND COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
    AND (
      p.no_meteran LIKE ?
      OR p.nama LIKE ?
      OR COALESCE(p.no_whatsapp, '') LIKE ?
    )
  ORDER BY p.nama ASC, t.id ASC
  LIMIT ?
`);
const billsByPeriodPaidWithKeywordStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'lunas'
    AND COALESCE(t.bulan_tagihan, pm.bulan) = ?
    AND COALESCE(t.tahun_tagihan, pm.tahun) = ?
    AND (
      p.no_meteran LIKE ?
      OR p.nama LIKE ?
      OR COALESCE(p.no_whatsapp, '') LIKE ?
    )
  ORDER BY p.nama ASC, t.id ASC
  LIMIT ?
`);
const markPaidStmt = db.prepare(`
  UPDATE tagihan
  SET status_bayar = 'lunas', tgl_bayar = CURRENT_TIMESTAMP, metode_bayar = ?
  WHERE id = ?
`);
const assignQrisUniqueStmt = db.prepare(`
  UPDATE tagihan
  SET qris_unique_code = ?, qris_amount_unique = ?, qris_assigned_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);
const clearQrisUniqueStmt = db.prepare(`
  UPDATE tagihan
  SET qris_unique_code = NULL, qris_amount_unique = NULL, qris_assigned_at = NULL
  WHERE id = ?
`);
const savePaymentProofStmt = db.prepare(`
  UPDATE tagihan
  SET payment_proof_url = ?, payment_proof_uploaded_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);
const findPendingByQrisAmountUniqueStmt = db.prepare(`
  SELECT id
  FROM tagihan
  WHERE status_bayar = 'belum_bayar'
    AND qris_amount_unique = ?
    AND id != ?
  LIMIT 1
`);
const findUnpaidByQrisAmountUniqueWithinWindowStmt = db.prepare(`
  SELECT
    t.*,
    pm.pelanggan_id,
    pm.bulan,
    pm.tahun,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    pm.foto_bukti,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'belum_bayar'
    AND t.qris_amount_unique = ?
    AND t.qris_assigned_at IS NOT NULL
    AND datetime(t.qris_assigned_at) >= datetime('now', ?)
  ORDER BY datetime(t.qris_assigned_at) DESC, t.id DESC
  LIMIT 1
`);
const hasPreviousUnpaidStmt = db.prepare(`
  SELECT COUNT(*) AS total
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  WHERE pm.pelanggan_id = ? AND t.status_bayar = 'belum_bayar'
`);
const hasPreviousUnpaidExcludingStmt = db.prepare(`
  SELECT COUNT(*) AS total
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  WHERE pm.pelanggan_id = ?
    AND t.status_bayar = 'belum_bayar'
    AND t.id != ?
`);
const findIdByPencatatanIdStmt = db.prepare(`
  SELECT id
  FROM tagihan
  WHERE pencatatan_id = ?
  LIMIT 1
`);
const updateRecalculatedStmt = db.prepare(`
  UPDATE tagihan
  SET total_tagihan = ?,
      denda = ?,
      harga_per_kubik_snapshot = ?,
      minimum_pemakaian_kubik_snapshot = ?,
      kubik_ditagihkan = ?,
      biaya_air = ?,
      biaya_admin_snapshot = ?
  WHERE id = ?
`);
const recentBillsStmt = db.prepare(`
  SELECT
    t.id,
    t.total_tagihan,
    t.status_bayar,
    t.qris_amount_unique,
    t.qris_unique_code,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    t.generated_mode,
    p.nama,
    p.no_meteran
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  ORDER BY t.id DESC
  LIMIT ?
`);
const searchPendingForPaymentStmt = db.prepare(`
  SELECT
    t.id,
    t.total_tagihan,
    t.denda,
    t.status_bayar,
    COALESCE(t.bulan_tagihan, pm.bulan) AS bulan,
    COALESCE(t.tahun_tagihan, pm.tahun) AS tahun,
    pm.bulan AS bulan_baca,
    pm.tahun AS tahun_baca,
    pm.total_kubik,
    p.nama,
    p.no_meteran,
    p.no_whatsapp
  FROM tagihan t
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE t.status_bayar = 'belum_bayar'
    AND (
      p.no_meteran LIKE ?
      OR p.nama LIKE ?
      OR COALESCE(p.no_whatsapp, '') LIKE ?
    )
  ORDER BY pm.tahun DESC, pm.bulan DESC, t.id DESC
  LIMIT 25
`);

function create(data) {
  const result = createStmt.run(
    data.pencatatan_id,
    data.bulan_tagihan ?? null,
    data.tahun_tagihan ?? null,
    data.total_tagihan,
    data.denda || 0,
    data.harga_per_kubik_snapshot || 0,
    data.minimum_pemakaian_kubik_snapshot || 0,
    data.kubik_ditagihkan || 0,
    data.biaya_air || 0,
    data.biaya_admin_snapshot || 0,
    data.generated_mode || 'manual'
  );
  return result.lastInsertRowid;
}

function getLatestByPelanggan(pelangganId) {
  return latestByPelangganStmt.get(pelangganId);
}

function getRecentHistoryByPelanggan(pelangganId, limit = 6) {
  return recentHistoryStmt.all(pelangganId, limit);
}

function getByIdDetail(id) {
  return detailByIdStmt.get(id);
}

function listUnpaidByPeriod(bulan, tahun) {
  return unpaidByPeriodStmt.all(Number(bulan), Number(tahun));
}

function listByPeriod({ bulan, tahun, status = 'all', keyword = '', limit = 200 }) {
  const monthValue = Number(bulan);
  const yearValue = Number(tahun);
  const safeLimit = Math.max(1, Math.min(1000, Number(limit || 200)));
  const trimmedKeyword = String(keyword || '').trim();

  const normalizedStatus = ['all', 'belum_bayar', 'lunas'].includes(status) ? status : 'all';
  if (trimmedKeyword) {
    const term = `%${trimmedKeyword}%`;
    if (normalizedStatus === 'belum_bayar') {
      return billsByPeriodUnpaidWithKeywordStmt.all(monthValue, yearValue, term, term, term, safeLimit);
    }
    if (normalizedStatus === 'lunas') {
      return billsByPeriodPaidWithKeywordStmt.all(monthValue, yearValue, term, term, term, safeLimit);
    }
    return billsByPeriodAllWithKeywordStmt.all(monthValue, yearValue, term, term, term, safeLimit);
  }

  if (normalizedStatus === 'belum_bayar') {
    return billsByPeriodUnpaidStmt.all(monthValue, yearValue, safeLimit);
  }
  if (normalizedStatus === 'lunas') {
    return billsByPeriodPaidStmt.all(monthValue, yearValue, safeLimit);
  }
  return billsByPeriodAllStmt.all(monthValue, yearValue, safeLimit);
}

function markPaid(id, metodeBayar) {
  return markPaidStmt.run(metodeBayar || 'manual', id);
}

function assignQrisUnique(id, uniqueCode, amountUnique) {
  return assignQrisUniqueStmt.run(uniqueCode, amountUnique, id);
}

function clearQrisUnique(id) {
  return clearQrisUniqueStmt.run(id);
}

function savePaymentProof(id, paymentProofUrl) {
  return savePaymentProofStmt.run(paymentProofUrl, id);
}

function findPendingByQrisAmountUnique(amountUnique, excludeId = 0) {
  return findPendingByQrisAmountUniqueStmt.get(amountUnique, excludeId);
}

function findUnpaidByQrisAmountUniqueWithinWindow(amountUnique, windowMinutes) {
  const minutes = Math.max(5, Math.min(10080, Number(windowMinutes || 1440)));
  const window = `-${minutes} minutes`;
  return findUnpaidByQrisAmountUniqueWithinWindowStmt.get(amountUnique, window);
}

function hasPreviousUnpaid(pelangganId) {
  const result = hasPreviousUnpaidStmt.get(pelangganId);
  return Boolean(result.total);
}

function hasPreviousUnpaidExcluding(pelangganId, excludeTagihanId) {
  const result = hasPreviousUnpaidExcludingStmt.get(pelangganId, Number(excludeTagihanId || 0));
  return Boolean(result.total);
}

function findIdByPencatatanId(pencatatanId) {
  const row = findIdByPencatatanIdStmt.get(Number(pencatatanId));
  return row ? row.id : null;
}

function updateRecalculated(id, totals) {
  return updateRecalculatedStmt.run(
    totals.totalTagihan,
    totals.denda || 0,
    totals.hargaPerKubik || 0,
    totals.minimumPemakaianKubik || 0,
    totals.kubikDitagihkan || 0,
    totals.biayaAir || 0,
    totals.biayaAdmin || 0,
    Number(id)
  );
}

function getRecentBills(limit = 10) {
  return recentBillsStmt.all(limit);
}

function searchPendingForPayment(keyword) {
  const term = `%${keyword || ''}%`;
  return searchPendingForPaymentStmt.all(term, term, term);
}

module.exports = {
  create,
  getLatestByPelanggan,
  getRecentHistoryByPelanggan,
  getByIdDetail,
  listUnpaidByPeriod,
  listByPeriod,
  markPaid,
  assignQrisUnique,
  clearQrisUnique,
  savePaymentProof,
  findPendingByQrisAmountUnique,
  findUnpaidByQrisAmountUniqueWithinWindow,
  hasPreviousUnpaid,
  hasPreviousUnpaidExcluding,
  findIdByPencatatanId,
  updateRecalculated,
  getRecentBills,
  searchPendingForPayment
};
