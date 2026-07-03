# ⚡ Quick Start Guide - PAMSIMAS

**Panduan singkat untuk membuat aplikasi PAMSIMAS langsung berjalan di server baru.**

---

## 🚀 5 Menit Setup

### Step 1: Clone Repository

```bash
cd /var/www
git clone https://github.com/alijayanet/pamsimas.git
cd pamsimas
```

### Step 2: Install Dependencies

```bash
npm install --no-fund --no-audit
npm rebuild better-sqlite3 --verbose
```

### Step 3: Setup Environment

```bash
cp .env.example.txt .env
nano .env  # Edit jika perlu
```

Default `.env` sudah siap pakai:
```env
APP_PORT=3005
NODE_ENV=development
SESSION_SECRET=dev_secret_key_12345
DB_PATH=./data/pamsimas.db
BASE_URL=http://localhost:3005
```

**Note:** `.env.example.txt` bisa di-upload ke GitHub

### Step 4: Init Database & Create Default Accounts

```bash
npm run init-db
```

**Output akan tampilkan:**
```
✅ Default admin created: username=admin, password=admin123
✅ Sample pelanggan created: username=pelanggan1, password=pelanggan123
```

### Step 5: Jalankan Aplikasi

```bash
npm start
```

**Aplikasi akan berjalan di:** http://localhost:3005

---

## 📋 Login Default

Gunakan akun ini untuk testing:

| Role | Username | Password | URL |
|------|----------|----------|-----|
| **Admin** | `admin` | `admin123` | `/login` |
| **Pelanggan** | `pelanggan1` | `pelanggan123` | `/pelanggan/login` |

---

## ✅ Checklist Pertama Kali

Setelah login admin, lakukan ini:

- [ ] **Ubah password admin** di menu Pengaturan
- [ ] **Setup tarif** di Pengaturan > Parameter Tarif
- [ ] **Setup info instansi** di Pengaturan > Info Aplikasi
- [ ] **Tambah petugas** di Manajemen Petugas
- [ ] **Tambah pelanggan** di Manajemen Pelanggan
- [ ] **Setup WhatsApp** di Pengaturan > WhatsApp (optional)
- [ ] **Setup QRIS** di Pengaturan > QRIS (optional)

---

## 📍 Akses Aplikasi

- **Public Home:** http://localhost:3005
- **Admin Login:** http://localhost:3005/login
- **Pelanggan Login:** http://localhost:3005/pelanggan/login
- **Admin Dashboard:** http://localhost:3005/admin
- **Pelanggan Dashboard:** http://localhost:3005/pelanggan

---

## 🔄 Restart Aplikasi

Jika perlu restart:

```bash
# Stop aplikasi (Ctrl+C)

# Jalankan kembali
npm start
```

Dengan PM2 (production):
```bash
pm2 restart pamsimas
pm2 logs pamsimas  # Lihat log
```

---

## 🐛 Troubleshooting Cepat

### "Tidak bisa login"
- ✅ Pastikan database sudah init: `npm run init-db`
- ✅ Check console log di terminal
- ✅ Buka browser DevTools (F12) check error

### "Port sudah terpakai"
```bash
# Ganti port di .env
APP_PORT=3006
```

### "Database error"
```bash
# Recreate database
rm -f ./data/pamsimas.db*
npm run init-db
```

### "Better-sqlite3 build error"
```bash
npm rebuild better-sqlite3 --verbose
```

Lihat [TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md) untuk masalah lebih detail.

---

## 🎯 Next Steps

1. **Backup database secara berkala** (./data/pamsimas.db)
2. **Ubah SESSION_SECRET** di `.env` dengan nilai random yang aman
3. **Setup SSL certificate** untuk production (HTTPS)
4. **Enable WhatsApp gateway** untuk notifikasi otomatis
5. **Setup QRIS** untuk pembayaran digital
6. **Buat schedule backup** dengan cron job

---

## 📚 Dokumentasi Lengkap

Lihat [README.md](README.md) untuk dokumentasi detail tentang:
- Instalasi production di VPS/Cloud
- Konfigurasi lengkap
- API endpoints
- Database schema
- Security best practices

---

**Need help?** Cek [TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md)

**Version:** 1.0.0  
**Last Updated:** January 2024
