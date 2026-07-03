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

function listAll(filter = {}) {
  let query = 'SELECT * FROM keuangan';
  const params = [];
  const clauses = [];

  if (filter.dari) {
    clauses.push('date(tanggal) >= date(?)');
    params.push(filter.dari);
  }
  if (filter.sampai) {
    clauses.push('date(tanggal) <= date(?)');
    params.push(filter.sampai);
  }

  if (clauses.length > 0) {
    query += ' WHERE ' + clauses.join(' AND ');
  }

  query += ' ORDER BY tanggal DESC, id DESC';

  return db.prepare(query).all(...params);
}

module.exports = {
  createEntry,
  getLatest,
  listAll
};

