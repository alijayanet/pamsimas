const db = require('../config/database');

const listStmt = db.prepare(`
  SELECT
    p.*,
    u.username,
    (
      SELECT t.status_bayar
      FROM tagihan t
      JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
      WHERE pm.pelanggan_id = p.id
      ORDER BY pm.tahun DESC, pm.bulan DESC
      LIMIT 1
    ) AS status_tagihan_terakhir
  FROM pelanggan p
  LEFT JOIN users u ON u.id = p.user_id
  ORDER BY p.nama ASC
`);
const getByIdStmt = db.prepare(`
  SELECT
    p.*,
    u.username
  FROM pelanggan p
  LEFT JOIN users u ON u.id = p.user_id
  WHERE p.id = ?
  LIMIT 1
`);
const findByUserIdStmt = db.prepare(`
  SELECT
    p.*,
    u.username
  FROM pelanggan p
  JOIN users u ON u.id = p.user_id
  WHERE p.user_id = ?
  LIMIT 1
`);
const createStmt = db.prepare(`
  INSERT INTO pelanggan (no_meteran, nama, alamat, no_whatsapp, tgl_bergabung, user_id)
  VALUES (?, ?, ?, COALESCE(?, ''), COALESCE(?, CURRENT_TIMESTAMP), ?)
`);
const updateStmt = db.prepare(`
  UPDATE pelanggan
  SET no_meteran = ?, nama = ?, alamat = ?, no_whatsapp = ?, tgl_bergabung = ?, user_id = ?
  WHERE id = ?
`);
const deleteStmt = db.prepare('DELETE FROM pelanggan WHERE id = ?');
const searchStmt = db.prepare(`
  SELECT *
  FROM pelanggan
  WHERE no_meteran LIKE ? OR nama LIKE ?
  ORDER BY nama ASC
  LIMIT 20
`);
const findByMeterOrPhoneStmt = db.prepare(`
  SELECT *
  FROM pelanggan
  WHERE lower(trim(no_meteran)) = lower(trim(?))
     OR replace(replace(replace(COALESCE(no_whatsapp, ''), ' ', ''), '-', ''), '+', '') = ?
  LIMIT 1
`);
const recipientsStmt = db.prepare(`
  SELECT id, nama, no_meteran, no_whatsapp
  FROM pelanggan
  WHERE COALESCE(no_whatsapp, '') <> ''
  ORDER BY nama ASC
`);

function listAll() {
  return listStmt.all();
}

function getById(id) {
  return getByIdStmt.get(id);
}

function findByUserId(userId) {
  return findByUserIdStmt.get(userId);
}

function create(data) {
  const result = createStmt.run(
    data.no_meteran,
    data.nama,
    data.alamat,
    data.no_whatsapp,
    data.tgl_bergabung,
    data.user_id || null
  );

  return result.lastInsertRowid;
}

function update(id, data) {
  return updateStmt.run(
    data.no_meteran,
    data.nama,
    data.alamat,
    data.no_whatsapp || '',
    data.tgl_bergabung,
    data.user_id || null,
    id
  );
}

function remove(id) {
  return deleteStmt.run(id);
}

function search(keyword) {
  const term = `%${keyword || ''}%`;
  return searchStmt.all(term, term);
}

function findByMeterOrPhone(keyword) {
  const key = String(keyword || '').trim();
  const phoneKey = key.replace(/[ \-+]/g, '');
  return findByMeterOrPhoneStmt.get(key, phoneKey);
}

function listWhatsappRecipients() {
  return recipientsStmt.all();
}

module.exports = {
  listAll,
  getById,
  findByUserId,
  create,
  update,
  remove,
  search,
  findByMeterOrPhone,
  listWhatsappRecipients
};
