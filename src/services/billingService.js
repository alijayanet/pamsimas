/**
 * Menghitung biaya air berdasarkan skema tarif golongan.
 * Mendukung skema progresif (3 blok) dan flat.
 * @param {number} kubikDitagihkan - Jumlah m³ yang ditagihkan (sudah mempertimbangkan minimum abonemen)
 * @param {object} golongan - Data golongan dari tarif_golongan
 * @returns {number} Total biaya air
 */
function hitungBiayaAirGolongan(kubikDitagihkan, golongan) {
  if (!golongan) return 0;
  const kubik = Math.max(0, Number(kubikDitagihkan || 0));

  if (!golongan.is_progresif) {
    // Tarif flat
    return kubik * Number(golongan.harga_flat || 0);
  }

  // Tarif progresif 3 blok
  const batas1 = Number(golongan.batas_blok_1 || 10);
  const batas2 = Number(golongan.batas_blok_2 || 20);
  const h1 = Number(golongan.harga_blok_1 || 0);
  const h2 = Number(golongan.harga_blok_2 || 0);
  const h3 = Number(golongan.harga_blok_3 || 0);

  let biaya = 0;
  if (kubik <= batas1) {
    biaya = kubik * h1;
  } else if (kubik <= batas2) {
    biaya = batas1 * h1 + (kubik - batas1) * h2;
  } else {
    biaya = batas1 * h1 + (batas2 - batas1) * h2 + (kubik - batas2) * h3;
  }
  return biaya;
}

/**
 * Menghitung total tagihan berdasarkan pemakaian, settings global, dan golongan pelanggan.
 * Jika golongan tidak diberikan, fallback ke tarif flat dari settings global (backward-compat).
 */
function calculateBillTotals({ totalKubik, settings, hasPreviousUnpaid, golongan = null }) {
  const pemakaianAsli = Math.max(0, Number(totalKubik || 0));

  // Gunakan minimum pemakaian dari golongan jika ada, else dari settings global
  const minimumPemakaianKubik = golongan
    ? Math.max(0, Number(golongan.minimum_pemakaian || 0))
    : Math.max(0, Number(settings?.minimum_pemakaian_kubik || 0));

  const kubikDitagihkan = Math.max(pemakaianAsli, minimumPemakaianKubik);

  let biayaAir;
  let hargaPerKubik; // untuk backward compat snapshot

  if (golongan) {
    biayaAir = hitungBiayaAirGolongan(kubikDitagihkan, golongan);
    // Untuk snapshot: simpan harga efektif rata-rata
    hargaPerKubik = kubikDitagihkan > 0 ? biayaAir / kubikDitagihkan : 0;
  } else {
    // Fallback ke tarif flat global
    hargaPerKubik = Number(settings?.harga_per_kubik || 0);
    biayaAir = kubikDitagihkan * hargaPerKubik;
  }

  const biayaAdmin = golongan
    ? Number(golongan.biaya_admin || 0)
    : Number(settings?.biaya_admin || 0);

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

function calculateBill({ meteranAwal, meteranAkhir, settings, hasPreviousUnpaid, golongan = null }) {
  const awal = Number(meteranAwal || 0);
  const akhir = Number(meteranAkhir || 0);

  if (akhir < awal) {
    throw new Error('Meteran akhir tidak boleh lebih kecil dari meteran awal.');
  }

  const totalKubik = akhir - awal;
  const totals = calculateBillTotals({ totalKubik, settings, hasPreviousUnpaid, golongan });

  return {
    meteranAwal: awal,
    meteranAkhir: akhir,
    ...totals
  };
}

module.exports = { calculateBill, calculateBillTotals, hitungBiayaAirGolongan };

