const db = require('../config/database');
const env = require('../config/env');

const getSettingsStmt = db.prepare(`
  SELECT *
  FROM pengaturan_aplikasi
  ORDER BY id DESC
  LIMIT 1
`);
const updateSettingsStmt = db.prepare(`
  UPDATE pengaturan_aplikasi
  SET
    nama_aplikasi = ?,
    nama_instansi = ?,
    logo_url = ?,
    alamat_loket = ?,
    no_whatsapp_loket = ?,
    footer_kwitansi = ?,
    base_url_public = ?,
    public_home_headline = ?,
    public_home_tagline = ?,
    public_profile_text = ?,
    public_payment_info_text = ?,
    public_service_hours_text = ?,
    qris_static_enabled = ?,
    qris_static_qr_url = ?,
    qris_static_payload = ?,
    qris_admin_wa = ?,
    qris_help_text = ?,
    qris_webhook_token = ?,
    qris_match_window_minutes = ?,
    qris_send_wa_image = ?,
    wa_template_qris_tagihan = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

function getSettings() {
  const row = getSettingsStmt.get();
  if (!row) {
    return null;
  }

  return {
    ...row,
    qris_static_enabled: Boolean(Number(row.qris_static_enabled || 0)),
    qris_match_window_minutes: Number(row.qris_match_window_minutes || 1440),
    qris_send_wa_image: Boolean(Number(row.qris_send_wa_image ?? 1)),
    resolved_base_url: row.base_url_public || env.baseUrl
  };
}

function updateSettings(data) {
  return updateSettingsStmt.run(
    data.nama_aplikasi,
    data.nama_instansi,
    data.logo_url || '',
    data.alamat_loket || '',
    data.no_whatsapp_loket || '',
    data.footer_kwitansi || '',
    data.base_url_public || '',
    data.public_home_headline || '',
    data.public_home_tagline || '',
    data.public_profile_text || '',
    data.public_payment_info_text || '',
    data.public_service_hours_text || '',
    data.qris_static_enabled ? 1 : 0,
    data.qris_static_qr_url || '',
    data.qris_static_payload || '',
    data.qris_admin_wa || '',
    data.qris_help_text || '',
    data.qris_webhook_token || '',
    Number(data.qris_match_window_minutes || 1440),
    data.qris_send_wa_image ? 1 : 0,
    data.wa_template_qris_tagihan || '',
    data.id
  );
}

module.exports = {
  getSettings,
  updateSettings
};
