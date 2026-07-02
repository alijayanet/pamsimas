function calculateBillTotals({ totalKubik, settings, hasPreviousUnpaid }) {
  const pemakaianAsli = Math.max(0, Number(totalKubik || 0));
  const minimumPemakaianKubik = Math.max(0, Number(settings?.minimum_pemakaian_kubik || 0));
  const kubikDitagihkan = Math.max(pemakaianAsli, minimumPemakaianKubik);
  const hargaPerKubik = Number(settings?.harga_per_kubik || 0);
  const biayaAir = kubikDitagihkan * hargaPerKubik;
  const biayaAdmin = Number(settings?.biaya_admin || 0);
  const denda = hasPreviousUnpaid ? Number(settings?.denda_keterlambatan || 0) : 0;
  const totalTagihan = biayaAir + biayaAdmin + denda;

  return {
    totalKubik: pemakaianAsli,
    minimumPemakaianKubik,
    kubikDitagihkan,
    hargaPerKubik,
    biayaAir,
    biayaAdmin,
    denda,
    totalTagihan,
    abonemenApplied: kubikDitagihkan > pemakaianAsli
  };
}

function calculateBill({ meteranAwal, meteranAkhir, settings, hasPreviousUnpaid }) {
  const awal = Number(meteranAwal || 0);
  const akhir = Number(meteranAkhir || 0);

  if (akhir < awal) {
    throw new Error('Meteran akhir tidak boleh lebih kecil dari meteran awal.');
  }

  const totalKubik = akhir - awal;
  const totals = calculateBillTotals({
    totalKubik,
    settings,
    hasPreviousUnpaid
  });

  return {
    meteranAwal: awal,
    meteranAkhir: akhir,
    totalKubik: totals.totalKubik,
    minimumPemakaianKubik: totals.minimumPemakaianKubik,
    kubikDitagihkan: totals.kubikDitagihkan,
    hargaPerKubik: totals.hargaPerKubik,
    biayaAir: totals.biayaAir,
    biayaAdmin: totals.biayaAdmin,
    denda: totals.denda,
    totalTagihan: totals.totalTagihan,
    abonemenApplied: totals.abonemenApplied
  };
}

module.exports = {
  calculateBill,
  calculateBillTotals
};
