const db = require('../config/database');

const startStmt = db.prepare(`
  INSERT INTO qris_notif_log (
    payload_hash,
    source,
    amount_detected,
    message_text,
    sender,
    matched_tagihan_id,
    match_status,
    match_reason
  )
  VALUES (?, ?, ?, ?, ?, NULL, 'failed', 'processing')
`);
const finishStmt = db.prepare(`
  UPDATE qris_notif_log
  SET
    amount_detected = ?,
    message_text = ?,
    sender = ?,
    matched_tagihan_id = ?,
    match_status = ?,
    match_reason = ?
  WHERE payload_hash = ?
`);
const listRecentStmt = db.prepare(`
  SELECT
    qnl.*,
    t.total_tagihan,
    t.qris_amount_unique,
    pm.bulan,
    pm.tahun,
    p.nama,
    p.no_meteran
  FROM qris_notif_log qnl
  LEFT JOIN tagihan t ON t.id = qnl.matched_tagihan_id
  LEFT JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  LEFT JOIN pelanggan p ON p.id = pm.pelanggan_id
  ORDER BY datetime(qnl.received_at) DESC, qnl.id DESC
  LIMIT ?
`);
const listFilteredStmt = db.prepare(`
  SELECT
    qnl.*,
    t.total_tagihan,
    t.qris_amount_unique,
    pm.bulan,
    pm.tahun,
    p.nama,
    p.no_meteran
  FROM qris_notif_log qnl
  LEFT JOIN tagihan t ON t.id = qnl.matched_tagihan_id
  LEFT JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  LEFT JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE qnl.match_status = ?
  ORDER BY datetime(qnl.received_at) DESC, qnl.id DESC
  LIMIT ?
`);
const summaryStmt = db.prepare(`
  SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN match_status = 'matched' THEN 1 ELSE 0 END) AS matched_total,
    SUM(CASE WHEN match_status = 'ignored' THEN 1 ELSE 0 END) AS ignored_total,
    SUM(CASE WHEN match_status = 'failed' THEN 1 ELSE 0 END) AS failed_total,
    SUM(CASE WHEN match_status = 'matched' AND date(received_at) = date('now', 'localtime') THEN 1 ELSE 0 END) AS matched_today
  FROM qris_notif_log
`);
const getByIdStmt = db.prepare(`
  SELECT
    qnl.*,
    t.total_tagihan,
    t.qris_amount_unique,
    pm.bulan,
    pm.tahun,
    p.nama,
    p.no_meteran
  FROM qris_notif_log qnl
  LEFT JOIN tagihan t ON t.id = qnl.matched_tagihan_id
  LEFT JOIN pencatatan_meteran pm ON pm.id = t.pencatatan_id
  LEFT JOIN pelanggan p ON p.id = pm.pelanggan_id
  WHERE qnl.id = ?
  LIMIT 1
`);

function tryStart(data) {
  try {
    startStmt.run(
      data.payload_hash,
      data.source || 'macrodroid',
      data.amount_detected ?? null,
      data.message_text || '',
      data.sender || ''
    );
    return true;
  } catch (error) {
    if (String(error.message || '').includes('UNIQUE constraint failed: qris_notif_log.payload_hash')) {
      return false;
    }
    throw error;
  }
}

function finish(data) {
  return finishStmt.run(
    data.amount_detected ?? null,
    data.message_text || '',
    data.sender || '',
    data.matched_tagihan_id ?? null,
    data.match_status,
    data.match_reason || '',
    data.payload_hash
  );
}

function getRecent(limit = 20) {
  return listRecentStmt.all(limit);
}

function getFiltered(status, limit = 20) {
  if (!status || status === 'all') {
    return getRecent(limit);
  }

  return listFilteredStmt.all(status, limit);
}

function getSummary() {
  return summaryStmt.get();
}

function getById(id) {
  return getByIdStmt.get(id);
}

module.exports = {
  tryStart,
  finish,
  getRecent,
  getFiltered,
  getSummary,
  getById
};
