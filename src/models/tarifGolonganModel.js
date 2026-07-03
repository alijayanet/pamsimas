const db = require('../config/database');

const listStmt = db.prepare('SELECT * FROM tarif_golongan ORDER BY id ASC');
const getByKodeStmt = db.prepare('SELECT * FROM tarif_golongan WHERE kode_golongan = ? LIMIT 1');
const updateStmt = db.prepare(`
  UPDATE tarif_golongan
  SET nama_golongan = ?,
      biaya_admin = ?,
      minimum_pemakaian = ?,
      is_progresif = ?,
      harga_blok_1 = ?,
      batas_blok_1 = ?,
      harga_blok_2 = ?,
      batas_blok_2 = ?,
      harga_blok_3 = ?,
      harga_flat = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE kode_golongan = ?
`);

function listAll() {
  return listStmt.all();
}

function getByKode(kode) {
  return getByKodeStmt.get(kode);
}

function update(kode, data) {
  return updateStmt.run(
    data.nama_golongan,
    Number(data.biaya_admin || 0),
    Number(data.minimum_pemakaian || 5),
    data.is_progresif ? 1 : 0,
    Number(data.harga_blok_1 || 0),
    Number(data.batas_blok_1 || 10),
    Number(data.harga_blok_2 || 0),
    Number(data.batas_blok_2 || 20),
    Number(data.harga_blok_3 || 0),
    Number(data.harga_flat || 0),
    kode
  );
}

module.exports = { listAll, getByKode, update };
