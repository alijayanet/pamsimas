# 🔐 Cara Mengganti Password - PAMSIMAS

Panduan untuk mengganti password admin, petugas, dan pelanggan.

---

## 1️⃣ Mengganti Password Admin

### Via Dashboard (Recommended)

1. Login sebagai admin: http://localhost:3005/login
2. Buka menu **Pengaturan** (atau cari di sidebar)
3. Cari menu **Ubah Password Admin** atau **Account Settings**
4. Isi form:
   - **Password Lama:** masukkan password saat ini
   - **Password Baru:** password baru minimal 6 karakter
   - **Konfirmasi Password:** ulangi password baru
5. Klik **Simpan** atau **Update Password**

---

## 2️⃣ Mengganti Password Petugas (Catter/Kasir)

### Sebagai Admin

1. Login sebagai admin
2. Buka **Manajemen Petugas**
3. Cari petugas yang ingin direset passwordnya
4. Klik tombol **Edit** atau **Change Password**
5. Isi password baru
6. Klik **Simpan**

### Petugas Ubah Password Sendiri

Jika ada menu account settings di dashboard petugas:
1. Buka dashboard petugas
2. Cari menu **Profil** atau **Account**
3. Klik **Ubah Password**
4. Isi password lama dan password baru
5. Klik **Simpan**

---

## 3️⃣ Mengganti Password Pelanggan

### Sebagai Admin (Reset untuk pelanggan)

1. Login sebagai admin
2. Buka **Manajemen Pelanggan**
3. Cari pelanggan yang ingin di-reset
4. Klik **Edit** atau **Manage Account**
5. Cari field password dan update
6. Klik **Simpan**

### Pelanggan Ubah Password Sendiri

1. Login sebagai pelanggan: http://localhost:3005/pelanggan/login
2. Buka menu **Akun** atau **Profil**
3. Cari tombol **Ubah Password**
4. Isi form:
   - **Password Saat Ini:** password login sekarang
   - **Password Baru:** password baru
   - **Konfirmasi Password:** ulangi password baru
5. Klik **Simpan** atau **Update Password**

---

## 🗄️ Mengganti Password Via Database (Emergency)

Jika lupa password atau sistem tidak bisa ubah password, gunakan cara ini:

### Langkah 1: Buka SQLite

```bash
# Linux/macOS
sqlite3 ./data/pamsimas.db

# Windows (download sqlite3.exe terlebih dahulu)
sqlite3.exe ./data/pamsimas.db
```

### Langkah 2: Check User yang Ada

```sql
SELECT id, username, role FROM users;
```

Output contoh:
```
1|admin|admin
2|catter1|catter
3|kasir1|kasir
4|pelanggan1|pelanggan
```

### Langkah 3: Generate Password Hash Baru

Gunakan Node.js untuk generate bcrypt hash:

```bash
# Buka Node.js REPL
node

# Di dalam Node.js:
const bcrypt = require('bcryptjs');
const password = 'password_baru_saya';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Copy hash yang di-generate (format: `$2a$10$...`)

Contoh output:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Fm
```

### Langkah 4: Update Password di Database

Masih di SQLite prompt, jalankan:

```sql
UPDATE users SET password = '$2a$10$PASTE_HASH_DISINI' WHERE username = 'admin';
```

Contoh lengkap:
```sql
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Fm' WHERE username = 'admin';
```

### Langkah 5: Verify Update

```sql
SELECT id, username, password FROM users WHERE username = 'admin';
```

Pastikan password sudah ter-update (hash-nya berbeda dari sebelumnya)

### Langkah 6: Exit SQLite

```sql
.quit
```

---

## 📋 Tips Password Aman

Gunakan password yang aman:

✅ **Password Aman:**
- Min 8 karakter (lebih panjang lebih baik)
- Mix huruf besar dan kecil: `MyPassword123`
- Kombinasi angka: `Admin@2024`
- Hindari info personal (nama, tanggal lahir)
- Hindari password yang sama untuk semua akun

❌ **Password Tidak Aman:**
- Password pendek: `12345`, `qwerty`
- Password sederhana: `admin`, `password`, `12345678`
- Password dengan pola: `11111111`, `abcdefgh`
- Password yang sama untuk semua akun

---

## ✅ Cara Aman Mengelola Password

1. **Jangan share password** antar akun
2. **Ganti password** secara berkala (3-6 bulan sekali)
3. **Gunakan password manager** untuk store password panjang
4. **Backup database** sebelum ubah password (untuk safety)
5. **Test login** setelah ubah password untuk confirm
6. **Notify user** jika password di-reset oleh admin

---

## 🆘 Emergency Recovery

### Jika lupa semua password

1. **Reset admin via database** (lihat section atas)
2. **Delete akun yang lupa** dari database
3. **Buat akun baru** di admin dashboard
4. **Update semua pelanggan** password mereka

---

## 🔒 Security Best Practice

### Jangan Lakukan:
- ❌ Tulis password di sticky note
- ❌ Share password ke orang lain
- ❌ Gunakan password sama untuk semua sistem
- ❌ Tidak pernah ganti password
- ❌ Gunakan password yang sudah di-leak (check di haveibeenpwned.com)

### Lakukan:
- ✅ Ganti password default segera setelah setup
- ✅ Gunakan password panjang (12+ karakter) untuk admin
- ✅ Enable 2FA jika ada (future feature)
- ✅ Monitor aktivitas login di log
- ✅ Audit user access secara berkala

---

**Version:** 1.0.0  
**Last Updated:** January 2024
