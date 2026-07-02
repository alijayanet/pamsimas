const db = require('../config/database');

const lastReadingStmt = db.prepare(`
  SELECT *
  FROM pencatatan_meteran
  WHERE pelanggan_id = ?
  ORDER BY tahun DESC, bulan DESC, id DESC
  LIMIT 1
`);
const existingPeriodStmt = db.prepare(`
  SELECT *
  FROM pencatatan_meteran
  WHERE pelanggan_id = ? AND bulan = ? AND tahun = ?
  LIMIT 1
`);
const createStmt = db.prepare(`
  INSERT INTO pencatatan_meteran (
    pelanggan_id,
    catter_id,
    bulan,
    tahun,
    meteran_awal,
    meteran_akhir,
    total_kubik,
    foto_bukti,
    status_input
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const currentMonthHistoryStmt = db.prepare(`
  SELECT
    pm.*,
    p.nama,
    p.no_meteran,
    t.id AS tagihan_id,
    t.status_bayar AS tagihan_status_bayar
  FROM pencatatan_meteran pm
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  LEFT JOIN tagihan t ON t.pencatatan_id = pm.id
  WHERE pm.catter_id = ? AND pm.bulan = ? AND pm.tahun = ?
  ORDER BY pm.created_at DESC
`);
const readingByIdDetailStmt = db.prepare(`
  SELECT
    pm.*,
    p.nama,
    p.no_meteran,
    p.no_whatsapp,
    p.alamat,
    t.id AS tagihan_id,
    t.status_bayar AS tagihan_status_bayar
  FROM pencatatan_meteran pm
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  LEFT JOIN tagihan t ON t.pencatatan_id = pm.id
  WHERE pm.id = ?
  LIMIT 1
`);
const updateByIdStmt = db.prepare(`
  UPDATE pencatatan_meteran
  SET meteran_awal = ?,
      meteran_akhir = ?,
      total_kubik = ?,
      foto_bukti = ?,
      status_input = ?
  WHERE id = ?
`);
const deleteByIdStmt = db.prepare(`
  DELETE FROM pencatatan_meteran
  WHERE id = ?
`);
const unbilledByPeriodStmt = db.prepare(`
  SELECT
    pm.*,
    p.nama,
    p.no_meteran,
    p.no_whatsapp
  FROM pencatatan_meteran pm
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  LEFT JOIN tagihan t ON t.pencatatan_id = pm.id
  WHERE pm.bulan = ?
    AND pm.tahun = ?
    AND t.id IS NULL
  ORDER BY p.nama ASC, pm.id ASC
`);

function getLastReadingByPelanggan(pelangganId) {
  return lastReadingStmt.get(pelangganId);
}

function findByPeriod(pelangganId, bulan, tahun) {
  return existingPeriodStmt.get(pelangganId, bulan, tahun);
}

function create(data) {
  const result = createStmt.run(
    data.pelanggan_id,
    data.catter_id,
    data.bulan,
    data.tahun,
    data.meteran_awal,
    data.meteran_akhir,
    data.total_kubik,
    data.foto_bukti,
    data.status_input || 'pending'
  );

  return result.lastInsertRowid;
}

function getCurrentMonthHistory(catterId, bulan, tahun) {
  return currentMonthHistoryStmt.all(catterId, bulan, tahun);
}

function listUnbilledByPeriod(bulan, tahun) {
  return unbilledByPeriodStmt.all(Number(bulan), Number(tahun));
}

function getByIdDetail(id) {
  return readingByIdDetailStmt.get(Number(id));
}

function updateById(id, data) {
  return updateByIdStmt.run(
    data.meteran_awal,
    data.meteran_akhir,
    data.total_kubik,
    data.foto_bukti,
    data.status_input || 'pending',
    Number(id)
  );
}

function deleteById(id) {
  return deleteByIdStmt.run(Number(id));
}

module.exports = {
  getLastReadingByPelanggan,
  findByPeriod,
  create,
  getCurrentMonthHistory,
  listUnbilledByPeriod,
  getByIdDetail,
  updateById,
  deleteById
};
