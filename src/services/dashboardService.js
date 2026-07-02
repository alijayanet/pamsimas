const db = require('../config/database');

const monthlyFinanceStmt = db.prepare(`
  SELECT
    substr(tanggal, 1, 7) AS periode,
    SUM(CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE 0 END) AS pemasukan,
    SUM(CASE WHEN tipe = 'pengeluaran' THEN jumlah ELSE 0 END) AS pengeluaran
  FROM keuangan
  GROUP BY substr(tanggal, 1, 7)
  ORDER BY periode DESC
  LIMIT 6
`);
const cubicSalesStmt = db.prepare(`
  SELECT
    tahun,
    bulan,
    SUM(total_kubik) AS total_kubik
  FROM pencatatan_meteran
  GROUP BY tahun, bulan
  ORDER BY tahun DESC, bulan DESC
  LIMIT 6
`);
const paymentStatusStmt = db.prepare(`
  SELECT status_bayar, COUNT(*) AS total
  FROM tagihan
  GROUP BY status_bayar
`);
const summaryStmt = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM pelanggan) AS total_pelanggan,
    (SELECT COUNT(*) FROM tagihan WHERE status_bayar = 'belum_bayar') AS tagihan_belum_lunas,
    (SELECT COALESCE(SUM(jumlah), 0) FROM keuangan WHERE tipe = 'pemasukan') AS total_pemasukan,
    (SELECT COALESCE(SUM(jumlah), 0) FROM keuangan WHERE tipe = 'pengeluaran') AS total_pengeluaran
`);

function getDashboardData() {
  return {
    summary: summaryStmt.get(),
    monthlyFinance: monthlyFinanceStmt.all().reverse(),
    cubicSales: cubicSalesStmt.all().reverse(),
    paymentStatus: paymentStatusStmt.all()
  };
}

module.exports = {
  getDashboardData
};
