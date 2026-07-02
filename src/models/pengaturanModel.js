const db = require('../config/database');

const getSettingsStmt = db.prepare(`
  SELECT *
  FROM pengaturan_harga
  ORDER BY id DESC
  LIMIT 1
`);
const updateSettingsStmt = db.prepare(`
  UPDATE pengaturan_harga
  SET harga_per_kubik = ?,
      minimum_pemakaian_kubik = ?,
      tanggal_mulai_pencatatan = ?,
      tanggal_akhir_pencatatan = ?,
      tanggal_generate_otomatis = ?,
      biaya_admin = ?,
      denda_keterlambatan = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

function getSettings() {
  return getSettingsStmt.get();
}

function updateSettings({
  id,
  harga_per_kubik,
  minimum_pemakaian_kubik,
  tanggal_mulai_pencatatan,
  tanggal_akhir_pencatatan,
  tanggal_generate_otomatis,
  biaya_admin,
  denda_keterlambatan
}) {
  return updateSettingsStmt.run(
    harga_per_kubik,
    minimum_pemakaian_kubik,
    tanggal_mulai_pencatatan,
    tanggal_akhir_pencatatan,
    tanggal_generate_otomatis,
    biaya_admin,
    denda_keterlambatan,
    id
  );
}

module.exports = {
  getSettings,
  updateSettings
};
