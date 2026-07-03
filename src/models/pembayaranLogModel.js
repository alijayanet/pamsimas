const db = require('../config/database');

const createStmt = db.prepare(`
  INSERT INTO pembayaran_log (tagihan_id, user_id, jumlah_bayar, metode_bayar, keterangan)
  VALUES (?, ?, ?, ?, ?)
`);
const getByIdDetailStmt = db.prepare(`
  SELECT
    pl.*,
    u.username,
    t.total_tagihan,
    t.denda,
    t.harga_per_kubik_snapshot,
    t.minimum_pemakaian_kubik_snapshot,
    t.kubik_ditagihkan,
    pm.bulan,
    pm.tahun,
    pm.meteran_awal,
    pm.meteran_akhir,
    pm.total_kubik,
    p.nama,
    p.no_meteran,
    p.alamat
  FROM pembayaran_log pl
  JOIN users u ON u.id = pl.user_id
  JOIN tagihan t ON t.id = pl.tagihan_id
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE pl.id = ?
  LIMIT 1
`);
const recentStmt = db.prepare(`
  SELECT
    pl.*,
    u.username,
    p.nama,
    p.no_meteran,
    pm.bulan,
    pm.tahun
  FROM pembayaran_log pl
  JOIN users u ON u.id = pl.user_id
  JOIN tagihan t ON t.id = pl.tagihan_id
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  ORDER BY pl.created_at DESC, pl.id DESC
  LIMIT ?
`);
const recentByUserStmt = db.prepare(`
  SELECT
    pl.*,
    u.username,
    p.nama,
    p.no_meteran,
    pm.bulan,
    pm.tahun
  FROM pembayaran_log pl
  JOIN users u ON u.id = pl.user_id
  JOIN tagihan t ON t.id = pl.tagihan_id
  JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE pl.user_id = ?
  ORDER BY pl.created_at DESC, pl.id DESC
  LIMIT ?
`);

function create(data) {
  const result = createStmt.run(
    data.tagihan_id,
    data.user_id,
    data.jumlah_bayar,
    data.metode_bayar,
    data.keterangan || null
  );

  return result.lastInsertRowid;
}

function getByIdDetail(id) {
  return getByIdDetailStmt.get(id);
}

function getRecent(limit = 20) {
  return recentStmt.all(limit);
}

function getRecentByUser(userId, limit = 20) {
  return recentByUserStmt.all(userId, limit);
}

module.exports = {
  create,
  getByIdDetail,
  getRecent,
  getRecentByUser
};
