const dayjs = require('dayjs');

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function monthName(month) {
  return dayjs().month(Number(month || 1) - 1).format('MMMM');
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '-';
  }

  return dayjs(dateValue).format('DD MMMM YYYY');
}

function maskMeter(value) {
  const s = String(value || '').trim();
  if (!s) return '-';
  if (s.length <= 4) return `${'*'.repeat(s.length)}`;
  return `${s.slice(0, 2)}${'*'.repeat(Math.max(2, s.length - 4))}${s.slice(-2)}`;
}

function maskPhone(value) {
  const s = String(value || '').trim();
  if (!s) return '-';
  const digits = s.replace(/\D/g, '');
  if (!digits) return '-';
  if (digits.length <= 6) return `${digits.slice(0, 2)}${'*'.repeat(Math.max(2, digits.length - 2))}`;
  return `${digits.slice(0, 4)}${'*'.repeat(Math.max(2, digits.length - 7))}${digits.slice(-3)}`;
}

function truncate(text, maxLen = 60) {
  const s = String(text || '').trim();
  if (!s) return '-';
  const max = Math.max(10, Number(maxLen || 60));
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

module.exports = {
  formatCurrency,
  monthName,
  formatDate,
  maskMeter,
  maskPhone,
  truncate
};
