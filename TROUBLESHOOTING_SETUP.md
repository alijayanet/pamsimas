# 🔧 Troubleshooting Setup Admin Awal

## ❌ Masalah: Tidak Bisa Membuat Admin Saat Setup

Jika saat di halaman `/setup` Anda tidak bisa submit data admin, berikut adalah kemungkinan kendala dan solusinya:

---

## 🔍 Diagnosis Masalah

### **1. Database Tidak Terinialisasi**

**Gejala:**
- Form setup ada, tapi saat klik "Buat Admin" error atau tidak ada respons
- Error: `SQLITE_CANTOPEN` atau `database is locked`

**Penyebab:**
- Database belum di-init dengan schema
- Folder `./data/` tidak bisa di-create
- File `.db` terkunci oleh process lain

**Solusi:**

```bash
# Stop aplikasi terlebih dahulu
Ctrl+C

# Hapus database yang lama (jika ada)
rm -f ./data/pamsimas.db
rm -f ./data/pamsimas.db-shm
rm -f ./data/pamsimas.db-wal

# Reinit database
npm run init-db

# Jalankan kembali
npm start
```

**Windows (PowerShell):**
```powershell
# Stop aplikasi
# Ctrl+C

# Hapus database
Remove-Item -Path ".\data\pamsimas.db*" -Force -ErrorAction SilentlyContinue

# Reinit database
npm run init-db

# Jalankan kembali
npm start
```

---

### **2. Tidak Ada Error, Tapi Data Tidak Masuk**

**Gejala:**
- Form submit berhasil (tidak ada error)
- Tapi saat login, username/password tidak diterima
- Masih redirect ke setup

**Penyebab:**
- Database write permission issue
- Transaction tidak commit
- Foreign key constraint error

**Solusi:**

Periksa file database integritas:

```bash
# Install sqlite3 CLI (jika belum punya)
# Ubuntu/Debian:
sudo apt install sqlite3

# macOS:
brew install sqlite

# Windows: Download dari https://sqlite.org/download.html
```

Check database:

```bash
# Buka database
sqlite3 ./data/pamsimas.db

# Di dalam sqlite3 prompt, jalankan:
SELECT * FROM users;
PRAGMA integrity_check;
```

Jika ada error, recreate database:

```bash
# Exit sqlite3
.quit

# Hapus dan recreate
rm ./data/pamsimas.db*
npm run init-db
```

---

### **3. SESSION_SECRET Tidak Diset**

**Gejala:**
- Aplikasi tidak bisa start
- Error: `Environment variable SESSION_SECRET wajib diisi`

**Penyebab:**
- File `.env` tidak ada atau tidak terbaca
- SESSION_SECRET kosong di `.env`

**Solusi:**

```bash
# Cek apakah .env ada
ls -la .env

# Jika tidak ada, buat dari template
cp .env.example .env

# Edit .env dan isi SESSION_SECRET
nano .env
# Atau dengan editor pilihan Anda
```

Pastikan `.env` berisi:

```env
APP_PORT=3005
NODE_ENV=development
SESSION_SECRET=dev_secret_yang_panjang_min_20_karakter_harus_ada_nilai
DB_PATH=./data/pamsimas.db
BASE_URL=http://localhost:3005
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

---

### **4. Error: "username sudah ada"**

**Gejala:**
- Form setup tampil
- Submit form, muncul error: `username sudah ada` atau `UNIQUE constraint failed`

**Penyebab:**
- Username sudah terdaftar di database
- Setup pernah dijalankan sebelumnya

**Solusi:**

Gunakan username yang berbeda (contoh: `admin2`, `root`, `superadmin`)

Atau, reset database:

```bash
# Hapus semua data users
rm ./data/pamsimas.db*
npm run init-db
```

---

### **5. Password Tidak Valid / Terlalu Pendek**

**Gejala:**
- Submit form, muncul error tapi tidak jelas
- Atau setup berhasil tapi login tidak bisa dengan password yang sama

**Penyebab:**
- Password kurang dari 8 karakter
- Special character issue
- Form tidak validate dengan benar

**Solusi:**

Gunakan password yang lebih aman:
- Min 8 karakter
- Gunakan kombinasi huruf + angka
- Hindari karakter khusus (tanda kutip, backslash, dll) jika tidak yakin

**Contoh password yang aman:**
```
Admin12345
MyPassword2024
SecurePass@123
```

---

### **6. Node.js Version Tidak Kompatibel**

**Gejala:**
- Error saat `npm install`
- Error: `better-sqlite3` build failed
- Error saat startup aplikasi

**Penyebab:**
- Node.js versi < 20 atau > 22
- Native modules tidak bisa compile

**Solusi:**

```bash
# Check versi Node
node -v

# Harus v20.x.x
# Jika tidak, update ke Node 20

# Ubuntu/Debian dengan nvm:
nvm install 20
nvm use 20

# Rebuild native modules
npm rebuild better-sqlite3 --verbose

# Jalankan kembali
npm start
```

---

### **7. Port 3005 Sudah Terpakai**

**Gejala:**
- Aplikasi tidak bisa start
- Error: `EADDRINUSE` atau `Port already in use`

**Penyebab:**
- Port 3005 sudah dipakai process lain
- Setup sebelumnya tidak properly shutdown

**Solusi:**

**Option 1: Kill process yang pakai port 3005**

Linux/macOS:
```bash
# Find process on port 3005
lsof -i :3005

# Kill process
kill -9 <PID>
```

Windows (PowerShell):
```powershell
# Find process on port 3005
netstat -ano | findstr :3005

# Kill process
taskkill /PID <PID> /F
```

**Option 2: Ganti port**

Edit `.env`:
```env
APP_PORT=3006  # Gunakan port lain
```

---

### **8. Form Submit Tapi Tidak Ada Respons**

**Gejala:**
- Klik "Buat Admin", form loading terus
- Atau form redirect tapi tidak clear apa hasilnya
- Tidak ada error message

**Penyebab:**
- JavaScript issue di browser
- Network issue
- Server tidak respond

**Solusi:**

Buka Developer Tools browser (F12) dan check:

**Console Tab:**
```
Cek apakah ada error JavaScript
```

**Network Tab:**
```
- Klik "Buat Admin"
- Lihat request ke `/setup`
- Check response status (200, 400, 500?)
- Lihat response body untuk error message
```

**Server Log:**
```
Lihat terminal tempat aplikasi running
Cari error message atau warning
```

---

### **9. Setup Berhasil Tapi Tidak Bisa Login**

**Gejala:**
- Setup berhasil, redirect ke login
- Tapi login dengan username/password setup gagal
- Error: `Username atau password tidak valid`

**Penyebab:**
- Password tidak di-hash dengan benar
- Username/password tidak match
- Session tidak working

**Solusi:**

Pastikan format yang digunakan saat setup:

1. **Username:** gunakan karakter standar (a-z, 0-9, underscore)
   - ✅ Benar: `admin`, `admin_user`, `user123`
   - ❌ Salah: `admin@user`, `user$admin`

2. **Password:** case-sensitive
   - Username `Admin` ≠ `admin`
   - Password `Pass123` ≠ `pass123`

3. **Coba reset password via database:**

```bash
# Buka SQLite
sqlite3 ./data/pamsimas.db

# Lihat users yang ada
SELECT * FROM users;

# Jika admin ada, hapus dan recreate
DELETE FROM users WHERE role = 'admin';
```

Lalu jalankan setup ulang.

---

### **10. Aplikasi Crash saat Setup**

**Gejala:**
- Submit form → aplikasi crash
- Terminal show error stack trace
- Perlu restart aplikasi

**Penyebab:**
- Unhandled exception di controller
- Database connection issue
- Memory/resource issue

**Solusi:**

1. Lihat error message di terminal
2. Cek file `setupController.js` untuk source code
3. Coba langkah ini:

```bash
# Clear semua
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Reinit database
npm run init-db

# Jalankan dengan verbose logging
npm start 2>&1 | tee app.log
```

4. Share error message ke developer/support

---

## ✅ Checklist Setup Yang Benar

Sebelum setup, pastikan:

- [ ] Node.js versi 20.x (`node -v`)
- [ ] Dependencies terinstall (`npm install` selesai tanpa error)
- [ ] File `.env` ada dan terisi dengan benar
- [ ] Database terinit (`npm run init-db` selesai)
- [ ] Folder `./data/` writable (permission OK)
- [ ] Port 3005 tidak terpakai
- [ ] Aplikasi running (`npm start` tanpa error)
- [ ] Browser bisa akses `http://localhost:3005`
- [ ] Redirect ke `/setup` terjadi otomatis

---

## 🐛 Debug Mode

Jika semua solusi di atas tidak berhasil, jalankan dengan debug:

```bash
# Set debug mode
DEBUG=* npm start

# Atau untuk Linux/macOS:
NODE_DEBUG=http npm start
```

Ini akan menampilkan detail request/response yang membantu diagnosis.

---

## 📞 Jika Masih Error

Jika sudah mencoba semua langkah di atas tapi masih error, kumpulkan info ini:

1. **Error message yang tepat** (copy dari terminal)
2. **Node.js version** (`node -v`)
3. **NPM version** (`npm -m`)
4. **OS** (Windows/macOS/Linux)
5. **Content `.env` file** (hapus SESSION_SECRET value)
6. **Output dari:** `npm run init-db`
7. **Network tab di browser** (screenshot request/response)
8. **Isi database:** `sqlite3 ./data/pamsimas.db "SELECT * FROM users;"`

Share ke GitHub Issues atau support channel dengan informasi di atas.

---

**Last Updated:** 15 January 2024  
**Version:** PAMSIMAS 1.0.0
