const db = require('../config/database');

const createStmt = db.prepare(`
  INSERT INTO keuangan (tipe, jumlah, keterangan, tanggal)
  VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
`);
const listLatestStmt = db.prepare(`
  SELECT *
  FROM keuangan
  ORDER BY tanggal DESC, id DESC
  LIMIT ?
`);

function createEntry({ tipe, jumlah, keterangan, tanggal }) {
  const result = createStmt.run(tipe, jumlah, keterangan, tanggal || null);
  return result.lastInsertRowid;
}

function getLatest(limit = 20) {
  return listLatestStmt.all(limit);
}

module.exports = {
  createEntry,
  getLatest
};
