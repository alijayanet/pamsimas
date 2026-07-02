const tagihanModel = require('../models/tagihanModel');
const keuanganModel = require('../models/keuanganModel');
const whatsappService = require('./whatsappService');

async function processQrisAmount(amount, windowMinutes) {
  const matched = tagihanModel.findUnpaidByQrisAmountUniqueWithinWindow(amount, windowMinutes);
  if (!matched) {
    return {
      matched: false,
      match_status: 'ignored',
      match_reason: 'no_match'
    };
  }

  tagihanModel.markPaid(matched.id, 'qris_auto');
  keuanganModel.createEntry({
    tipe: 'pemasukan',
    jumlah: matched.total_tagihan,
    keterangan: `Pembayaran QRIS otomatis ${matched.nama} periode ${matched.bulan}/${matched.tahun}`
  });

  const updatedBill = tagihanModel.getByIdDetail(matched.id);
  await whatsappService.sendPaymentReceipt(updatedBill);

  return {
    matched: true,
    match_status: 'matched',
    match_reason: 'qris_amount_unique_match',
    bill: updatedBill
  };
}

module.exports = {
  processQrisAmount
};
