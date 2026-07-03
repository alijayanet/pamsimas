const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const env = require('./env');

fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });
fs.mkdirSync(env.waSessionDir, { recursive: true });

const db = new Database(env.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function hasColumn(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'catter', 'kasir', 'pelanggan')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pengaturan_harga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      harga_per_kubik REAL NOT NULL DEFAULT 0,
      minimum_pemakaian_kubik REAL NOT NULL DEFAULT 5,
      tanggal_mulai_pencatatan INTEGER NOT NULL DEFAULT 1,
      tanggal_akhir_pencatatan INTEGER NOT NULL DEFAULT 25,
      tanggal_generate_otomatis INTEGER NOT NULL DEFAULT 1,
      biaya_admin REAL NOT NULL DEFAULT 0,
      denda_keterlambatan REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pengaturan_aplikasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_aplikasi TEXT NOT NULL DEFAULT 'PAMSIMAS',
      nama_instansi TEXT NOT NULL DEFAULT 'Unit Pengelola PAMSIMAS',
      logo_url TEXT NOT NULL DEFAULT '',
      alamat_loket TEXT NOT NULL DEFAULT '',
      no_whatsapp_loket TEXT NOT NULL DEFAULT '',
      footer_kwitansi TEXT NOT NULL DEFAULT 'Terima kasih telah melakukan pembayaran tepat waktu.',
      base_url_public TEXT NOT NULL DEFAULT '',
      public_home_headline TEXT NOT NULL DEFAULT 'Informasi PAMSIMAS',
      public_home_tagline TEXT NOT NULL DEFAULT 'Cek tarif, jadwal pencatatan, dan pembayaran tagihan.',
      public_profile_text TEXT NOT NULL DEFAULT '',
      public_payment_info_text TEXT NOT NULL DEFAULT '',
      public_service_hours_text TEXT NOT NULL DEFAULT '',
      qris_static_enabled INTEGER NOT NULL DEFAULT 0,
      qris_static_qr_url TEXT NOT NULL DEFAULT '',
      qris_static_payload TEXT NOT NULL DEFAULT '',
      qris_admin_wa TEXT NOT NULL DEFAULT '',
      qris_help_text TEXT NOT NULL DEFAULT 'Pastikan nominal dibayar sama persis agar sistem dapat mendeteksi pembayaran.',
      qris_webhook_token TEXT NOT NULL DEFAULT '',
      qris_match_window_minutes INTEGER NOT NULL DEFAULT 1440,
      qris_send_wa_image INTEGER NOT NULL DEFAULT 1,
      wa_template_qris_tagihan TEXT NOT NULL DEFAULT 'Yth. {{nama}},\n\nTagihan air periode {{periode}} sudah terbit.\nNo. Meter: {{no_meter}}\nTotal: Rp{{total}}\n\nKode bayar QRIS: {{qris_nominal}} (kode {{qris_kode}})\nSilakan scan QRIS berikut untuk pembayaran otomatis.\n\nCek detail: {{link}}',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tarif_golongan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_golongan TEXT NOT NULL UNIQUE CHECK (kode_golongan IN ('rumah_tangga', 'sosial', 'niaga')),
      nama_golongan TEXT NOT NULL,
      biaya_admin REAL NOT NULL DEFAULT 0,
      minimum_pemakaian REAL NOT NULL DEFAULT 5,
      is_progresif INTEGER NOT NULL DEFAULT 1 CHECK (is_progresif IN (0, 1)),
      harga_blok_1 REAL NOT NULL DEFAULT 0,
      batas_blok_1 REAL NOT NULL DEFAULT 10,
      harga_blok_2 REAL NOT NULL DEFAULT 0,
      batas_blok_2 REAL NOT NULL DEFAULT 20,
      harga_blok_3 REAL NOT NULL DEFAULT 0,
      harga_flat REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pelanggan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_meteran TEXT NOT NULL UNIQUE,
      nama TEXT NOT NULL,
      alamat TEXT NOT NULL,
      no_whatsapp TEXT,
      tgl_bergabung TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      golongan_id TEXT NOT NULL DEFAULT 'rumah_tangga',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (golongan_id) REFERENCES tarif_golongan(kode_golongan) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS pencatatan_meteran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pelanggan_id INTEGER NOT NULL,
      catter_id INTEGER NOT NULL,
      bulan INTEGER NOT NULL CHECK (bulan BETWEEN 1 AND 12),
      tahun INTEGER NOT NULL,
      meteran_awal REAL NOT NULL,
      meteran_akhir REAL NOT NULL,
      total_kubik REAL NOT NULL,
      foto_bukti TEXT,
      status_input TEXT NOT NULL DEFAULT 'pending' CHECK (status_input IN ('pending', 'verified')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (pelanggan_id, bulan, tahun),
      FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE CASCADE,
      FOREIGN KEY (catter_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS tagihan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pencatatan_id INTEGER NOT NULL UNIQUE,
      bulan_tagihan INTEGER,
      tahun_tagihan INTEGER,
      total_tagihan REAL NOT NULL,
      status_bayar TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (status_bayar IN ('belum_bayar', 'lunas')),
      tgl_bayar TEXT,
      metode_bayar TEXT,
      denda REAL NOT NULL DEFAULT 0,
      harga_per_kubik_snapshot REAL NOT NULL DEFAULT 0,
      minimum_pemakaian_kubik_snapshot REAL NOT NULL DEFAULT 0,
      kubik_ditagihkan REAL NOT NULL DEFAULT 0,
      biaya_air REAL NOT NULL DEFAULT 0,
      biaya_admin_snapshot REAL NOT NULL DEFAULT 0,
      generated_mode TEXT NOT NULL DEFAULT 'manual' CHECK (generated_mode IN ('manual', 'auto')),
      generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pencatatan_id) REFERENCES pencatatan_meteran(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS keuangan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipe TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
      jumlah REAL NOT NULL,
      keterangan TEXT NOT NULL,
      tanggal TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pembayaran_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tagihan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      jumlah_bayar REAL NOT NULL,
      metode_bayar TEXT NOT NULL,
      keterangan TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tagihan_id) REFERENCES tagihan(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS qris_notif_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payload_hash TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'macrodroid',
      amount_detected REAL,
      message_text TEXT NOT NULL DEFAULT '',
      sender TEXT NOT NULL DEFAULT '',
      received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      matched_tagihan_id INTEGER,
      match_status TEXT NOT NULL CHECK (match_status IN ('matched', 'ignored', 'failed')),
      match_reason TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (matched_tagihan_id) REFERENCES tagihan(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pelanggan_no_meteran ON pelanggan(no_meteran);
    CREATE INDEX IF NOT EXISTS idx_pencatatan_periode ON pencatatan_meteran(tahun, bulan);
    CREATE INDEX IF NOT EXISTS idx_tagihan_status ON tagihan(status_bayar);
    CREATE INDEX IF NOT EXISTS idx_keuangan_tanggal ON keuangan(tanggal);
    CREATE INDEX IF NOT EXISTS idx_pembayaran_log_tagihan ON pembayaran_log(tagihan_id);
    CREATE INDEX IF NOT EXISTS idx_pembayaran_log_user ON pembayaran_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_qris_notif_received_at ON qris_notif_log(received_at);
    CREATE INDEX IF NOT EXISTS idx_qris_notif_matched_tagihan ON qris_notif_log(matched_tagihan_id);
  `);

  try { db.exec("ALTER TABLE tagihan ADD COLUMN qris_unique_code INTEGER"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN qris_amount_unique REAL"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN qris_assigned_at TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN payment_proof_url TEXT DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN payment_proof_uploaded_at TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN bulan_tagihan INTEGER"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN tahun_tagihan INTEGER"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN harga_per_kubik_snapshot REAL NOT NULL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN minimum_pemakaian_kubik_snapshot REAL NOT NULL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN kubik_ditagihkan REAL NOT NULL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN biaya_air REAL NOT NULL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN biaya_admin_snapshot REAL NOT NULL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN generated_mode TEXT NOT NULL DEFAULT 'manual'"); } catch (e) {}
  try { db.exec("ALTER TABLE tagihan ADD COLUMN generated_at TEXT"); } catch (e) {}
  if (!hasColumn('tagihan', 'generated_at')) {
    db.exec("ALTER TABLE tagihan ADD COLUMN generated_at TEXT");
  }
  db.exec("UPDATE tagihan SET generated_at = COALESCE(generated_at, CURRENT_TIMESTAMP)");

  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_static_enabled INTEGER NOT NULL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_static_qr_url TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_static_payload TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_admin_wa TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_help_text TEXT NOT NULL DEFAULT 'Pastikan nominal dibayar sama persis agar sistem dapat mendeteksi pembayaran.'"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_webhook_token TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_match_window_minutes INTEGER NOT NULL DEFAULT 1440"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN qris_send_wa_image INTEGER NOT NULL DEFAULT 1"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN wa_template_qris_tagihan TEXT NOT NULL DEFAULT 'Yth. {{nama}},\\n\\nTagihan air periode {{periode}} sudah terbit.\\nNo. Meter: {{no_meter}}\\nTotal: Rp{{total}}\\n\\nKode bayar QRIS: {{qris_nominal}} (kode {{qris_kode}})\\nSilakan scan QRIS berikut untuk pembayaran otomatis.\\n\\nCek detail: {{link}}'"); } catch (e) {}

  try { db.exec("ALTER TABLE pengaturan_harga ADD COLUMN minimum_pemakaian_kubik REAL NOT NULL DEFAULT 5"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_harga ADD COLUMN tanggal_mulai_pencatatan INTEGER NOT NULL DEFAULT 1"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_harga ADD COLUMN tanggal_akhir_pencatatan INTEGER NOT NULL DEFAULT 25"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_harga ADD COLUMN tanggal_generate_otomatis INTEGER NOT NULL DEFAULT 1"); } catch (e) {}

  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN public_home_headline TEXT NOT NULL DEFAULT 'Informasi PAMSIMAS'"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN public_home_tagline TEXT NOT NULL DEFAULT 'Cek tarif, jadwal pencatatan, dan pembayaran tagihan.'"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN public_profile_text TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN public_payment_info_text TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN public_service_hours_text TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE pengaturan_aplikasi ADD COLUMN logo_url TEXT NOT NULL DEFAULT ''"); } catch (e) {}

  const settingsCount = db.prepare('SELECT COUNT(*) AS total FROM pengaturan_harga').get();
  if (!settingsCount.total) {
    db.prepare(`
      INSERT INTO pengaturan_harga (
        harga_per_kubik,
        minimum_pemakaian_kubik,
        tanggal_mulai_pencatatan,
        tanggal_akhir_pencatatan,
        tanggal_generate_otomatis,
        biaya_admin,
        denda_keterlambatan
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(3000, 5, 1, 25, 1, 5000, 10000);
  }

  const appSettingsCount = db.prepare('SELECT COUNT(*) AS total FROM pengaturan_aplikasi').get();
  if (!appSettingsCount.total) {
    db.prepare(`
      INSERT INTO pengaturan_aplikasi (
        nama_aplikasi,
        nama_instansi,
        logo_url,
        alamat_loket,
        no_whatsapp_loket,
        footer_kwitansi,
        base_url_public,
        public_home_headline,
        public_home_tagline,
        public_profile_text,
        public_payment_info_text,
        public_service_hours_text,
        qris_static_enabled,
        qris_static_qr_url,
        qris_static_payload,
        qris_admin_wa,
        qris_help_text,
        qris_webhook_token,
        qris_match_window_minutes,
        qris_send_wa_image,
        wa_template_qris_tagihan
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'PAMSIMAS',
      'Unit Pengelola PAMSIMAS',
      '',
      '',
      '',
      'Terima kasih telah melakukan pembayaran tepat waktu.',
      '',
      'Informasi PAMSIMAS',
      'Cek tarif, jadwal pencatatan, dan pembayaran tagihan.',
      '',
      '',
      '',
      0,
      '',
      '',
      '',
      'Pastikan nominal dibayar sama persis agar sistem dapat mendeteksi pembayaran.',
      '',
      1440,
      1,
      'Yth. {{nama}},\n\nTagihan air periode {{periode}} sudah terbit.\nNo. Meter: {{no_meter}}\nTotal: Rp{{total}}\n\nKode bayar QRIS: {{qris_nominal}} (kode {{qris_kode}})\nSilakan scan QRIS berikut untuk pembayaran otomatis.\n\nCek detail: {{link}}'
    );
  }

  // Migrasi: tambah kolom golongan_id pada pelanggan (pelanggan lama)
  try { db.exec("ALTER TABLE pelanggan ADD COLUMN golongan_id TEXT NOT NULL DEFAULT 'rumah_tangga'"); } catch (e) {}

  // Seed data tarif_golongan jika belum ada
  const golonganCount = db.prepare('SELECT COUNT(*) AS total FROM tarif_golongan').get();
  if (!golonganCount.total) {
    const insertGolongan = db.prepare(`
      INSERT INTO tarif_golongan (
        kode_golongan, nama_golongan, biaya_admin, minimum_pemakaian,
        is_progresif, harga_blok_1, batas_blok_1, harga_blok_2, batas_blok_2, harga_blok_3, harga_flat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Rumah Tangga: progresif
    insertGolongan.run('rumah_tangga', 'Rumah Tangga', 5000, 5, 1, 3000, 10, 4000, 20, 5000, 0);
    // Sosial (Masjid/Sosial): flat
    insertGolongan.run('sosial', 'Sosial / Umum', 2000, 5, 0, 0, 10, 0, 20, 0, 1500);
    // Niaga: progresif
    insertGolongan.run('niaga', 'Niaga / Usaha', 10000, 5, 1, 4500, 10, 6000, 20, 7500, 0);
  }

  // Seed sample pelanggan dan akun pelanggan jika belum ada
  const pelangganCount = db.prepare('SELECT COUNT(*) AS total FROM pelanggan').get();
  if (!pelangganCount.total) {
    const userModel = require('./env'); // Just import, actual model used below
    
    try {
      // Create sample customer account
      const pelangganUserId = db.prepare(`
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
      `).run('pelanggan1', '$2a$10$w8YKH/sKGxcPxwMH5vBZ2OJL5lPk5jcG5mZ.hPxE5g4CzLz5Y4Y4.', 'pelanggan').lastInsertRowid;
      
      // Create sample customer data
      db.prepare(`
        INSERT INTO pelanggan (no_meteran, nama, alamat, no_whatsapp, tgl_bergabung, user_id, golongan_id)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
      `).run('001001', 'Adi Wijaya', 'Jl. Merdeka No. 123, RT 01/RW 02', '+6281234567890', pelangganUserId, 'rumah_tangga');
      
      console.log('✅ Sample pelanggan created: username=pelanggan1, password=pelanggan123, no_meter=001001');
    } catch (error) {
      console.error('⚠️  Could not create sample pelanggan:', error.message);
    }
  }
}

initSchema();

module.exports = db;
