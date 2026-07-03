# PAMSIMAS 🚰

> **Sistem Manajemen Operasional Pengelola Air Minum Desa (PAMSIMAS)**  
> Solusi terintegrasi untuk manajemen pelanggan, pencatatan meter, pembayaran, dan notifikasi WhatsApp dalam satu aplikasi web modern.

[![Repository](https://img.shields.io/badge/GitHub-alijayanet%2Fpamsimas-181717?style=for-the-badge&logo=github)](https://github.com/alijayanet/pamsimas)
[![Node](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/index.html)
[![Express](https://img.shields.io/badge/Backend-Express-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## 🎯 Ringkasan

**PAMSIMAS** adalah aplikasi web full-stack yang dirancang khusus untuk pengelolaan operasional Pengelola Air Minum Desa (PAMSIMAS). Aplikasi ini mendukung manajemen end-to-end mulai dari registrasi pelanggan, pencatatan meteran bulanan, pembuatan tagihan otomatis, hingga proses pembayaran dengan dukungan metode pembayaran modern (QRIS dan manual loket).

Aplikasi ini didukung oleh sistem notifikasi WhatsApp terintegrasi, dashboard analytics, dan fitur keamanan yang komprehensif.

## 🎭 Role & Pengguna (4 Role Berbeda)

PAMSIMAS mendukung 4 role pengguna dengan akses dan permission yang berbeda:

### 1️⃣ **ADMIN** - Pengelola Sistem
- **Dashboard:** `/admin`
- **Akses:** Menu admin dashboard penuh
- **Tugas Utama:**
  - Mengelola data pelanggan (CRUD)
  - Mengelola petugas (catter dan kasir)
  - Konfigurasi tarif dan pengaturan sistem
  - Setup QRIS dan integrasi pembayaran
  - Setup WhatsApp gateway dan template pesan
  - Monitoring log transaksi dan notifikasi
  - Dashboard analytics dan laporan keuangan
  - Manajemen pengaturan aplikasi (logo, URL, template)

### 2️⃣ **CATTER** - Petugas Pencatat Meter
- **Dashboard:** `/catter`
- **Akses:** Menu catter terbatas
- **Tugas Utama:**
  - Mencari data pelanggan berdasarkan no meteran atau nama
  - Input meter bulanan (meter awal dan meter akhir)
  - Upload foto bukti meter dari kamera/HP
  - Verifikasi status input (pending/verified)
  - Otomatis generate tagihan saat input disimpan
  - Melihat riwayat pencatatan pelanggan

### 3️⃣ **KASIR** - Petugas Pembayaran
- **Dashboard:** `/kasir`
- **Akses:** Menu kasir terbatas
- **Tugas Utama:**
  - Mencari tagihan yang belum dibayar
  - Mencatat pembayaran manual (transfer, tunai, cek)
  - Akses QRIS per tagihan untuk pembayaran digital
  - Generate dan cetak receipt/kwitansi pembayaran
  - Melihat detail tagihan dan riwayat pembayaran
  - Update status pembayaran

### 4️⃣ **PELANGGAN** - End User
- **Dashboard:** `/pelanggan` (login pelanggan)
- **Akses:** Dashboard personal mobile-friendly
- **Tugas Utama:**
  - Login dengan akun personal
  - Melihat dashboard dengan ringkasan tagihan
  - Melihat daftar tagihan bulanan dan status pembayaran
  - Melihat riwayat pembayaran lengkap
  - Upload foto meter hasil pencatatan catter
  - Melihat detail pemakaian dan rincian biaya
  - Pembayaran langsung via QRIS dari dashboard
  - Upload bukti pembayaran manual
  - Ubah password akun personal

## 📚 Fitur Utama Aplikasi

### 🏢 **ADMIN Dashboard - Manajemen Sistem Lengkap**

#### 1. Manajemen Pelanggan
- **CRUD Lengkap (Create, Read, Update, Delete)**
  - Tambah pelanggan baru dengan form lengkap
  - Edit data pelanggan (no meteran, nama, alamat, WA)
  - Hapus pelanggan dari sistem
  - Pencarian dan filter pelanggan
  - Assign akun login pelanggan (optional)
  - Set golongan tarif per pelanggan (Rumah Tangga/Sosial/Niaga)
  - Lihat status tagihan terakhir

- **Informasi Per Pelanggan:**
  - No meteran (unik, tidak bisa duplikat)
  - Nama lengkap
  - Alamat lengkap
  - Nomor WhatsApp untuk notifikasi
  - Tanggal bergabung
  - Golongan tarif (untuk perhitungan biaya)
  - Riwayat pencatatan meter
  - Riwayat tagihan dan pembayaran

#### 2. Manajemen Petugas
- **CRUD Petugas Catter (Pencatat Meter)**
  - Tambah petugas catter baru
  - Edit data petugas (username, password)
  - Hapus petugas dari sistem
  - Tracking pencatatan per petugas
  - Monitor produktivitas catter

- **CRUD Petugas Kasir (Loket Pembayaran)**
  - Tambah petugas kasir baru
  - Edit data kasir
  - Hapus kasir dari sistem
  - Tracking pembayaran per kasir
  - Monitor transaksi kasir

#### 3. Pengaturan Tarif & Harga
- **Konfigurasi Tarif Air**
  - Set harga per kubik (Rp/m³)
  - Set minimum abonement (m³)
  - Set biaya admin per tagihan
  - Set denda keterlambatan pembayaran
  - Update effective date pengaturan

- **Sistem Tarif Bertingkat (Per Golongan)**
  - **Golongan Rumah Tangga** - Progresif dengan 3 blok harga
  - **Golongan Sosial/Umum** - Flat rate (masjid, fasilitas umum)
  - **Golongan Niaga/Usaha** - Progresif dengan biaya admin lebih tinggi
  
- **Formula Perhitungan Tagihan**
  ```
  kubik_ditagih = MAX(pemakaian_sebenarnya, minimum_abonement)
  biaya_air = kubik_ditagih × harga_per_kubik
  total = biaya_air + biaya_admin + denda (jika telat)
  ```

- **Contoh Perhitungan:**
  - Tarif: Rp 3.000/kubik
  - Minimum: 5 m³
  - Biaya admin: Rp 5.000
  - Contoh 1: Pakai 2 m³ → Ditagih 5 m³ × Rp 3.000 = Rp 15.000 + Rp 5.000 = **Rp 20.000**
  - Contoh 2: Pakai 8 m³ → Ditagih 8 m³ × Rp 3.000 = Rp 24.000 + Rp 5.000 = **Rp 29.000**

#### 4. Pengaturan QRIS (Quick Response Code Indonesian Standard)
- **Setup QRIS Static**
  - Upload QRIS payload dari bank/payment provider
  - Upload gambar QR code untuk display
  - Gunakan QRIS static untuk tautan pembayaran tetap
  
- **Setup QRIS Dynamic**
  - Generate nominal unik per tagihan
  - Sistem akan menambah offset unik (Rp 100-Rp 900)
  - Contoh: Tagihan Rp 50.000 → Nominal unik Rp 50.234
  - Pelanggan bayar dengan nominal unik → sistem auto-cocok
  
- **Webhook Token QRIS**
  - Setup token untuk webhook Macrodroid
  - Validasi payload dari Macrodroid
  - Keamanan untuk mencegah pembayaran palsu

- **Matching Window**
  - Set jendela waktu pencarian pembayaran (default 24 jam)
  - Sistem auto-match pembayaran dalam window tersebut

- **WhatsApp Image Send**
  - Pilihan kirim gambar QR via WhatsApp saat tagihan terbit
  - Toggle on/off fitur ini

#### 5. Pengaturan WhatsApp Gateway (Baileys)
- **Konfigurasi WhatsApp**
  - Setup gateway WhatsApp menggunakan Baileys
  - Input nomor WhatsApp untuk loket/admin
  - Set no WA receiver untuk notifikasi penting

- **Template Pesan Tagihan**
  - Custom template untuk notifikasi tagihan baru
  - Variable yang tersedia:
    - `{{nama}}` - Nama pelanggan
    - `{{periode}}` - Periode tagihan (Januari 2024)
    - `{{no_meter}}` - Nomor meteran
    - `{{total}}` - Total tagihan (Rp format)
    - `{{qris_nominal}}` - Nominal unik QRIS (jika ada)
    - `{{qris_kode}}` - Kode QRIS
    - `{{link}}` - Link detail tagihan
  
- **Contoh Template:**
  ```
  Yth. {{nama}},

  Tagihan air periode {{periode}} sudah terbit.
  No. Meter: {{no_meter}}
  Total: Rp{{total}}

  Silakan scan QRIS berikut atau visit: {{link}}
  
  Terima kasih.
  ```

- **Pengaturan Reminder Otomatis**
  - Set frekuensi reminder (harian, mingguan, bulanan)
  - Custom pesan reminder pembayaran
  - Otomatis kirim ke pelanggan yang belum bayar

- **Test Kirim WhatsApp**
  - Test koneksi WhatsApp gateway
  - Send sample message ke nomor admin
  - Verifikasi gateway berjalan dengan baik

#### 6. Monitoring Log Notifikasi QRIS
- **QRIS Notification Log**
  - Lihat semua notifikasi QRIS yang diterima
  - Filter by status (matched, ignored, failed)
  - Lihat timestamp, amount, dan matching result
  - Retry manual matching jika diperlukan
  - Download log untuk audit trail

#### 7. Dashboard Keuangan
- **Laporan Pemasukan**
  - Total pemasukan per bulan
  - Breakdown: air, admin fee, denda
  - Trend grafik pemasukan bulanan
  
- **Laporan Pengeluaran**
  - Log semua pengeluaran operasional
  - Input manual pengeluaran
  - Kategorisasi pengeluaran

- **Cash Flow Analysis**
  - Net pemasukan vs pengeluaran
  - Proyeksi keuangan bulan berikutnya

#### 8. Pengaturan Aplikasi
- **Branding & Appearance**
  - Upload logo custom
  - Set nama aplikasi
  - Set nama instansi/PAMSIMAS
  - Alamat loket pembayaran
  - Nomor WhatsApp loket

- **Pengaturan Public Pages**
  - Headline halaman home public
  - Tagline singkat
  - Profil instansi (text panjang)
  - Informasi pembayaran
  - Jam operasional layanan
  - Footer kwitansi

- **Base URL Configuration**
  - Set base URL untuk link publik (penting untuk deployment)
  - Digunakan di link notifikasi WA, email, dll

### 🚗 **CATTER Dashboard - Pencatatan Meter**

#### 1. Cari & Kelola Pelanggan
- **Search Pelanggan**
  - Cari by no meteran
  - Cari by nama pelanggan
  - Real-time search suggestion
  - Lihat daftar pelanggan dengan status terakhir

- **Lihat Detail Pelanggan**
  - No meteran dan nama
  - Alamat lengkap
  - Golongan tarif
  - Riwayat pencatatan bulan-bulan sebelumnya
  - Meter awal dan meter akhir bulan lalu

#### 2. Input Meteran Bulanan
- **Form Input Lengkap**
  - Pilih pelanggan (dropdown atau search)
  - Input meter awal (auto-fill dari bulan lalu)
  - Input meter akhir (manual input)
  - Upload foto bukti meter dari kamera/HP
  - Preview foto sebelum submit

- **Validasi Input**
  - Meter akhir harus > meter awal
  - No meteran tidak boleh duplikat untuk periode yang sama
  - Foto harus format image (JPG, PNG)
  - Foto maks ukuran 5MB

- **Status Input**
  - `pending` - Menunggu verifikasi admin/supervisor
  - `verified` - Sudah terverifikasi dan generate tagihan
  - Bisa edit input jika masih pending

#### 3. Upload Foto Meter
- **Multiple Format Support**
  - Upload dari file (browse)
  - Ambil langsung dari kamera HP
  - Ambil dari gallery HP
  - Crop/resize sebelum upload

- **Foto Processing**
  - Auto compress untuk menghemat storage
  - Auto watermark dengan tanggal/lokasi
  - Generate thumbnail untuk preview
  - Store di folder `public/uploads/meter`

#### 4. Otomatis Generate Tagihan
- **Workflow Otomatis**
  - Saat input disimpan dan verified
  - Sistem ambil meter awal dari bulan sebelumnya
  - Hitung pemakaian = meter_akhir - meter_awal
  - Hitung total tagihan sesuai tarif
  - Generate tagihan dengan status `belum_bayar`
  - Simpan snapshot tarif untuk record

- **Informasi Tagihan Generated**
  - Periode tagihan (bulan/tahun)
  - Kubik pemakaian sebenarnya
  - Kubik yang ditagih (setelah minimum)
  - Biaya per item (air, admin, denda)
  - Total tagihan
  - Link pembayaran

#### 5. Notifikasi WhatsApp Otomatis
- **Send Upon Verification**
  - Saat input meter verified
  - Kirim notifikasi ke WA pelanggan
  - Include detail tagihan dan link pembayaran
  - Include QRIS jika tersedia

### 💰 **KASIR Dashboard - Pembayaran**

#### 1. Cari Tagihan Belum Bayar
- **Search & Filter**
  - Cari by no meteran pelanggan
  - Cari by nama pelanggan
  - Filter by periode (bulan/tahun)
  - Filter by range (due date, amount)
  - Lihat daftar tagihan dengan status pembayaran

- **Sortir**
  - Sortir by amount (asc/desc)
  - Sortir by due date
  - Sortir by tanggal terbit

#### 2. Input Pembayaran Manual
- **Form Pembayaran**
  - Pilih tagihan dari list
  - Input jumlah pembayaran (bisa partial atau full)
  - Pilih metode pembayaran (Transfer, Tunai, Cek, dll)
  - Input keterangan/reference number
  - Kasir yang input terekam

- **Validasi Pembayaran**
  - Jumlah pembayaran harus > 0
  - Jumlah tidak boleh > total tagihan
  - Konfirmasi sebelum submit

- **Auto-Update Status**
  - Jika pembayaran = total → status berubah `lunas`
  - Jika pembayaran < total → status tetap `belum_bayar` (partial)
  - Simpan tanggal pembayaran dan metode

#### 3. Akses QRIS Per Tagihan
- **Display QRIS**
  - Lihat QRIS static (fix) atau dynamic (per tagihan)
  - Tampilkan nominal unik untuk QRIS
  - Tampilkan QR code untuk scan

- **QRIS Payment Flow**
  - Kasir tampilkan QR ke pelanggan
  - Pelanggan scan dari HP dan bayar
  - Sistem auto-detect pembayaran via webhook Macrodroid
  - Tagihan auto-lunas jika nominal cocok

#### 4. Generate & Cetak Receipt
- **Receipt/Kwitansi**
  - Auto-generate receipt saat pembayaran selesai
  - Info receipt:
    - Tanggal & waktu pembayaran
    - Data pelanggan
    - No meteran
    - Periode tagihan
    - Detail biaya (air, admin, denda)
    - Total tagihan
    - Jumlah dibayar
    - Metode pembayaran
    - Kasir yang input
    - Nomor kwitansi

- **Print Options**
  - Print langsung ke printer
  - Export PDF
  - Email ke pelanggan (jika ada email)

#### 5. Lihat Detail Tagihan & Riwayat
- **Detail Tagihan**
  - No meteran dan nama pelanggan
  - Periode tagihan
  - Kubik pemakaian detail
  - Rincian biaya per item
  - Total tagihan
  - Status pembayaran
  - Tanggal payment deadline

- **Riwayat Pembayaran**
  - Lihat semua pembayaran untuk tagihan tersebut
  - Timestamp setiap pembayaran
  - Metode pembayaran setiap transaksi
  - Kasir yang menginput

### 📱 **PELANGGAN Dashboard - Portal Pelanggan**

#### 1. Login Pelanggan Aman
- **Login System**
  - Username & password login terpisah dari admin
  - Session berakhir otomatis 8 jam
  - Secure cookie dengan httpOnly flag
  - Salah password = blocking sementara

- **Akun Management**
  - Ubah password akun
  - Update profil (alamat, WA, dll) - optional

#### 2. Dashboard Overview
- **Mobile-Friendly Design**
  - Responsive layout untuk HP/tablet/desktop
  - Bottom navigation bar untuk mobile
  - Sticky header dengan logout button

- **Dashboard Cards**
  - Total tagihan belum bayar (highlight merah jika ada)
  - Total pembayaran bulan ini
  - Pemakaian air bulan lalu
  - Notifikasi/reminder pembayaran

#### 3. Daftar Tagihan & Status
- **Tagihan List**
  - Lihat semua tagihan bulanan
  - Sortir by tanggal (terbaru/terlama)
  - Status setiap tagihan (belum bayar/lunas)
  - Highlight tagihan overdue (merah)
  - Highlight tagihan lunas (hijau)

- **Info Per Tagihan**
  - Periode tagihan
  - Tanggal terbit
  - Deadline pembayaran
  - Total tagihan
  - Status pembayaran

#### 4. Riwayat Pembayaran Lengkap
- **Payment History**
  - Lihat semua pembayaran yang sudah dilakukan
  - Tanggal pembayaran
  - Metode pembayaran (QRIS, tunai, transfer)
  - Jumlah pembayaran
  - Nomor kwitansi/reference
  - Status konfirmasi

#### 5. Upload Foto Meter
- **Gallery Meter**
  - Lihat foto meter yang diupload oleh catter
  - Foto per periode/bulan
  - Preview besar dengan modal
  - Download original photo

- **Validation**
  - Sistem check foto ketersediaan
  - Highlight bulan belum ada input meter

#### 6. Detail Pemakaian & Rincian Biaya
- **Pemakaian Detail**
  - Meter awal (awal bulan)
  - Meter akhir (akhir bulan)
  - Total pemakaian (kubik)
  - Pemakaian yg ditagih (setelah minimum)
  - Trend pemakaian 3-6 bulan (grafik)

- **Rincian Biaya**
  - Biaya air = kubik × harga/kubik
  - Biaya admin = flat fee
  - Denda keterlambatan (jika ada)
  - PPN/Pajak (jika ada)
  - Total = sum semua

- **Info Tambahan**
  - Golongan tarif pelanggan
  - Harga per kubik berlaku
  - Minimum abonement
  - Info denda per hari (jika telat)

#### 7. Pembayaran Langsung via QRIS
- **QRIS Payment Gateway**
  - Lihat QRIS per tagihan
  - Tampilkan nominal unik (jika QRIS dynamic)
  - Tamplikan QR code besar untuk di-scan HP
  - Copy nominal untuk manual transfer

- **Payment Instruction**
  - Panduan step-by-step pembayaran via QRIS
  - Instruksi scan dari HP/e-wallet
  - Waktu proses pembayaran

- **Auto Confirmation**
  - Sistem auto-detect pembayaran dari webhook
  - Status tagihan auto-update ke `lunas`
  - Notifikasi sukses ke pelanggan

#### 8. Upload Bukti Pembayaran Manual
- **Upload Proof**
  - Jika bayar via transfer (bukan QRIS lokal)
  - Upload screenshot bukti transfer
  - Upload bukti tanda terima kas
  - Upload foto struk ATM
  - Upload foto bukti receipt

- **Proof Management**
  - Lihat bukti yang sudah diupload
  - Lihat status approval bukti
  - Upload multiple bukti per transaksi

#### 9. Ubah Password
- **Password Change**
  - Form ubah password dengan validasi
  - Current password harus sesuai
  - New password min 8 karakter
  - Confirm password harus match
  - Secure hashing dengan bcryptjs

### 🌐 **PUBLIC Pages - Akses Tanpa Login**

#### 1. Homepage Public (`/`)
- **Welcome Page**
  - Display logo dan nama PAMSIMAS
  - Headline & tagline welcome
  - Quick stats (total pelanggan, total revenue, dll)
  - Navigasi ke subpage

#### 2. Cek Tarif (`/pelanggan/cek`)
- **Tarif Info**
  - Lihat semua golongan tarif
  - Harga per kubik per golongan
  - Minimum abonement
  - Biaya admin
  - Contoh perhitungan tagihan

#### 3. Cek Tagihan Publik (`/pelanggan/cek`)
- **Public Bill Checker**
  - Cek status tagihan tanpa login
  - Input no meteran
  - Lihat tagihan belum bayar
  - Lihat pemakaian dan rincian biaya
  - Lihat instruksi pembayaran
  - Lihat QRIS untuk pembayaran

#### 4. Login Pelanggan (`/pelanggan/login`)
- **Pelanggan Login Form**
  - Username & password input
  - Remember me option
  - Link "lupa password"
  - Link buat akun baru (jika fitur registrasi ada)

---

## 📊 Sistem Billing & Tarif

### Alur Pembuatan Tagihan Otomatis

```
1. Catter input meter → disimpan sebagai pencatatan_meteran
2. Status set ke 'pending' atau 'verified'
3. Saat verified:
   - Ambil meter_awal dari pencatatan bulan sebelumnya
   - Hitung pemakaian = meter_akhir - meter_awal
   - Ambil tarif golongan pelanggan
   - Hitung kubik_ditagih = MAX(pemakaian, minimum)
   - Hitung biaya_air = kubik_ditagih × harga_per_kubik
   - Hitung total = biaya_air + biaya_admin + denda
   - Generate tagihan dengan status 'belum_bayar'
   - Kirim notifikasi WA ke pelanggan
   - Siapkan QRIS jika enabled (assign nominal unik)
```

### Sistem Tarif Bertingkat

**Tiga Golongan Tarif Predefined:**

1. **Rumah Tangga** (kode: `rumah_tangga`)
   - Mode: **Progresif** (3 blok harga)
   - Blok 1: 0-10 m³ @ Rp 3.000/m³
   - Blok 2: 10-20 m³ @ Rp 4.000/m³
   - Blok 3: >20 m³ @ Rp 5.000/m³
   - Minimum: 5 m³ (abonement)
   - Biaya Admin: Rp 5.000
   - Contoh: pakai 8 m³ → (8 × Rp 3.000) + Rp 5.000 = Rp 29.000

2. **Sosial/Umum** (kode: `sosial`)
   - Mode: **Flat Rate** (satu harga untuk semua volume)
   - Harga: Rp 1.500/m³ (sama untuk semua volume)
   - Minimum: 5 m³
   - Biaya Admin: Rp 2.000
   - Contoh: pakai 10 m³ → (10 × Rp 1.500) + Rp 2.000 = Rp 17.000

3. **Niaga/Usaha** (kode: `niaga`)
   - Mode: **Progresif** (3 blok harga, lebih tinggi dari RT)
   - Blok 1: 0-10 m³ @ Rp 4.500/m³
   - Blok 2: 10-20 m³ @ Rp 6.000/m³
   - Blok 3: >20 m³ @ Rp 7.500/m³
   - Minimum: 5 m³
   - Biaya Admin: Rp 10.000
   - Contoh: pakai 15 m³ → (10×Rp 4.500 + 5×Rp 6.000) + Rp 10.000 = Rp 70.000

**Admin dapat:**
- Edit harga per blok per golongan
- Edit minimum abonement
- Toggle on/off mode progresif
- Set biaya admin per golongan

---

## 🔄 Alur Operasional Lengkap

### 1️⃣ Alur Input Meter (Catter)

```
Catter buka dashboard /catter
    ↓
Cari pelanggan (by no meteran atau nama)
    ↓
Lihat detail meter bulan lalu (meter awal untuk input baru)
    ↓
Input meter akhir bulan ini
    ↓
Upload foto meter (dari kamera atau galeri)
    ↓
Preview dan validasi input
    ↓
Simpan (status: pending)
    ↓
Admin verifikasi input
    ↓
Status berubah ke verified
    ↓
[AUTO] Generate tagihan
    ↓
[AUTO] Kirim notifikasi WA ke pelanggan
    ↓
[AUTO] Siapkan QRIS (jika enabled)
```

### 2️⃣ Alur Pembayaran QRIS (End-to-End)

```
Admin setup QRIS di pengaturan
    ↓
Upload QRIS payload + gambar QR
    ↓
Set webhook token untuk Macrodroid
    ↓
Pelanggan/Kasir akses tagihan
    ↓
Lihat QRIS (static atau dynamic per tagihan)
    ↓
Pelanggan scan QR dari HP e-wallet (GCash, GoPay, Dana, dll)
    ↓
Pelanggan input nominal → bayar dari HP
    ↓
[SYSTEM] Macrodroid detect pembayaran masuk
    ↓
[SYSTEM] Macrodroid send webhook ke /api/qris/macrodroid
    ↓
[SYSTEM] Sistem validate X-Webhook-Token
    ↓
[SYSTEM] Sistem extract amount dari payload
    ↓
[SYSTEM] Sistem cocokkan dengan tagihan
    ↓
Nominal cocok? → YES
    ↓ NO (log ke qris_notif_log, status: ignored/failed)
[AUTO] Update tagihan status → lunas
    ↓
[AUTO] Catat pembayaran ke pembayaran_log
    ↓
[AUTO] Kirim notifikasi sukses ke pelanggan
    ↓
[AUTO] Generate receipt digital
```

### 3️⃣ Alur Pembayaran Manual Loket (Kasir)

```
Kasir buka dashboard /kasir
    ↓
Cari tagihan belum bayar
    ↓
Lihat detail tagihan (meter, pemakaian, biaya)
    ↓
Pelanggan datang ke loket
    ↓
Kasir input jumlah pembayaran
    ↓
Pilih metode (Transfer, Tunai, Cek)
    ↓
Input keterangan/reference number
    ↓
Validasi (jumlah > 0, tidak > total)
    ↓
Simpan pembayaran
    ↓
[AUTO] Update tagihan status (lunas jika pembayaran = total)
    ↓
[AUTO] Catat pembayaran di pembayaran_log
    ↓
[AUTO] Generate receipt
    ↓
Kasir print/email receipt ke pelanggan
    ↓
Pelanggan dapat bukti pembayaran
```

### 4️⃣ Alur Cek Tagihan Pelanggan

```
Pelanggan akses /pelanggan/login
    ↓
Login dengan username & password
    ↓
Akses /pelanggan (dashboard)
    ↓
Lihat ringkasan tagihan (card overview)
    ↓
Buka menu "Daftar Tagihan"
    ↓
Lihat semua tagihan dengan status
    ↓
Klik tagihan untuk detail
    ↓
Lihat pemakaian (meter awal, akhir, kubik)
    ↓
Lihat rincian biaya detail
    ↓
Lihat foto meter (dari upload catter)
    ↓
[Opsi] Bayar via QRIS dari halaman
    ↓
[Opsi] Upload bukti pembayaran manual
    ↓
Simpan/submit pembayaran
```

---

## 💾 Tech Stack

- **Backend:** Node.js 20+, Express.js 4.x
- **Frontend:** EJS (templating), Bootstrap 4, AdminLTE 3, Chart.js
- **Database:** SQLite 3 (better-sqlite3, WAL mode)
- **Security:** bcryptjs (password hashing), express-session
- **File Upload:** Multer, Jimp (image processing)
- **QR Code:** qrcode, jsqr, @zxing/library
- **WhatsApp Gateway:** @whiskeysockets/baileys
- **Logging:** Pino
- **Utilities:** dayjs, dotenv

---

## 🗂️ Struktur Folder Proyek

```
pamsimas/
├── src/
│   ├── app.js                          ← Express app config & middleware
│   ├── server.js                       ← Entry point & scheduler
│   ├── config/
│   │   ├── database.js                 ← SQLite init & schema
│   │   └── env.js                      ← Environment variables
│   ├── controllers/                    ← Business logic (9 files)
│   │   ├── adminController.js
│   │   ├── authController.js           ← Login/logout
│   │   ├── catterController.js         ← Meter input
│   │   ├── kasirController.js          ← Payment input
│   │   ├── pelangganController.js      ← Customer dashboard
│   │   ├── publicController.js         ← Public pages
│   │   ├── qrisStaticController.js     ← QRIS static handler
│   │   ├── qrisWebhookController.js    ← Macrodroid webhook
│   │   └── setupController.js          ← First-time admin setup
│   ├── middleware/                     ← Middleware (5 files)
│   │   ├── auth.js                     ← Authentication check
│   │   └── upload*.js                  ← File upload handlers
│   ├── models/                         ← Database queries (10 models)
│   │   ├── userModel.js
│   │   ├── pelangganModel.js
│   │   ├── meterModel.js
│   │   ├── tagihanModel.js
│   │   ├── pembayaranLogModel.js
│   │   ├── pengaturanModel.js
│   │   ├── aplikasiModel.js
│   │   ├── tarifGolonganModel.js
│   │   ├── qrisNotifLogModel.js
│   │   └── keuanganModel.js
│   ├── routes/                         ← API routes (8 files)
│   │   ├── index.js                    ← Main router
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── catterRoutes.js
│   │   ├── kasirRoutes.js
│   │   ├── pelangganRoutes.js
│   │   ├── apiRoutes.js                ← REST API (QRIS webhook)
│   │   └── setupRoutes.js
│   ├── services/                       ← Complex operations (6 files)
│   │   ├── tagihanGenerationService.js ← Bill generation logic
│   │   ├── qrisService.js              ← QRIS operations
│   │   ├── qrisNotificationService.js  ← QRIS webhook handler
│   │   ├── whatsappService.js          ← WA notification
│   │   ├── billingService.js           ← Bill calculation
│   │   └── dashboardService.js         ← Analytics data
│   └── utils/
│       └── viewHelpers.js              ← EJS template helpers
├── views/                              ← EJS templates
│   ├── admin/                          ← Admin pages (11 files)
│   │   ├── dashboard.ejs
│   │   ├── pelanggan-*.ejs             ← Customer management
│   │   ├── petugas-*.ejs               ← Staff management
│   │   ├── tarif-golongan.ejs          ← Tariff config
│   │   ├── pengaturan.ejs              ← App settings
│   │   ├── whatsapp.ejs                ← WA config
│   │   └── tagihan-*.ejs               ← Bill management
│   ├── catter/                         ← Catter pages (2 files)
│   │   ├── index.ejs                   ← Dashboard
│   │   └── edit.ejs                    ← Meter input form
│   ├── kasir/                          ← Kasir pages (2 files)
│   │   ├── index.ejs                   ← Dashboard
│   │   └── receipt.ejs                 ← Receipt print
│   ├── pelanggan/                      ← Customer pages (7 files)
│   │   ├── dashboard.ejs               ← Main dashboard
│   │   ├── cek-tagihan.ejs             ← Bill checker
│   │   ├── tagihan-dashboard.ejs       ← Tagihan detail
│   │   ├── riwayat.ejs                 ← Payment history
│   │   ├── qris.ejs                    ← QRIS payment
│   │   ├── akun.ejs                    ← Account management
│   │   └── login.ejs                   ← Login form
│   ├── public/                         ← Public pages
│   │   └── home.ejs
│   ├── auth/                           ← Auth pages
│   │   ├── login.ejs
│   │   ├── setup.ejs
│   │   └── error.ejs
│   └── partials/                       ← Reusable components
│       ├── admin-header.ejs
│       ├── admin-footer.ejs
│       └── pelanggan-bottom-nav.ejs
├── public/
│   ├── css/
│   │   └── app.css                     ← Custom CSS
│   ├── uploads/
│   │   ├── meter/                      ← Meter photos
│   │   ├── logo/                       ← PAMSIMAS logo
│   │   ├── qris/                       ← QRIS images
│   │   └── payment-proofs/             ← Bukti pembayaran
│   └── service-worker.js               ← PWA support
├── data/
│   ├── pamsimas.db                     ← SQLite database
│   ├── pamsimas.db-shm                 ← WAL journal (auto)
│   ├── pamsimas.db-wal                 ← WAL journal (auto)
│   └── wa-session/                     ← Baileys session files
├── .env                                ← Environment variables (production)
├── .env.example                        ← Template
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔗 Link & Endpoint Aplikasi

| Page | URL | Role | Fungsi |
|------|-----|------|--------|
| **Public Home** | `/` | Public | Halaman home publik |
| **Setup Admin** | `/setup` | Public | Setup admin pertama kali |
| **Login Admin/Catter/Kasir** | `/login` | Public | Login staff |
| **Login Pelanggan** | `/pelanggan/login` | Public | Login pelanggan |
| **Cek Tarif** | `/pelanggan/cek` | Public | Lihat daftar tarif |
| **Admin Dashboard** | `/admin` | Admin | Menu utama admin |
| **Catter Dashboard** | `/catter` | Catter | Menu utama catter |
| **Kasir Dashboard** | `/kasir` | Kasir | Menu utama kasir |
| **Pelanggan Dashboard** | `/pelanggan` | Pelanggan | Menu utama pelanggan |
| **API QRIS Webhook** | `/api/qris/macrodroid` | Webhook | Terima notifikasi QRIS |

---

## 📋 Instalasi & Setup

### 🖥️ Instalasi Lokal (Development)

#### 1. Clone Repository

```bash
git clone https://github.com/alijayanet/pamsimas.git
cd pamsimas
```

#### 2. Verifikasi Node.js Version

```bash
node -v    # Pastikan >= v20.0.0
npm -v     # Pastikan >= 10.x
```

Jika belum, download dari https://nodejs.org/ (LTS versi 20.x)

#### 3. Install Dependencies

```bash
npm install --no-fund --no-audit
```

Jika `better-sqlite3` belum compiled dengan benar:

```bash
npm rebuild better-sqlite3 --verbose
```

#### 4. Setup Environment Variables

Buat file `.env` di root proyek:

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan config lokal Anda:

```env
APP_PORT=3000
NODE_ENV=development
SESSION_SECRET=isi_dengan_secret_panjang_dan_unik_12345678901234567890
DB_PATH=./data/pamsimas.db
BASE_URL=http://localhost:3000
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

**Important:** `SESSION_SECRET` harus random string panjang (min 20 karakter)

#### 5. Inisialisasi Database

```bash
npm run init-db
```

Ini akan membuat:
- `./data/pamsimas.db` (SQLite database)
- Schema lengkap (11 tabel)
- Default settings (tarif, golongan, dll)

#### 6. Jalankan Aplikasi

**Mode Development (dengan auto-reload):**
```bash
npm run dev
```

**Mode Production:**
```bash
npm start
```

Akses aplikasi: **http://localhost:3000**

#### 7. Setup Admin Pertama Kali

1. Buka http://localhost:3000 di browser
2. Aplikasi akan redirect ke `/setup`
3. Isi form setup:
   - Username admin
   - Password admin
   - Konfirmasi password
4. Submit → Admin account created
5. Redirect ke login, login dengan akun admin yang baru dibuat
6. Mulai setup tarif, pelanggan, dll

---

### 🖥️ Instalasi Production (Linux/VPS)

Panduan untuk **Ubuntu 22.04 LTS** atau **Ubuntu 24.04 LTS**

#### Step 1: Persiapan Server

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install build tools dan dependencies
sudo apt install -y build-essential git curl nginx
```

#### Step 2: Install Node.js 20

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node -v
npm -v
```

#### Step 3: Install PM2 (Process Manager)

```bash
# Install globally
sudo npm install -g pm2

# Enable startup on reboot
pm2 startup
pm2 save
```

#### Step 4: Clone & Setup Aplikasi

```bash
# Create app directory
cd /var/www
sudo git clone https://github.com/alijayanet/pamsimas.git
sudo chown -R $USER:$USER /var/www/pamsimas
cd pamsimas

# Install dependencies
npm ci --no-fund --no-audit --ignore-scripts
npm rebuild better-sqlite3 --verbose
```

#### Step 5: Create Production .env

```bash
nano .env
```

```env
APP_PORT=3000
NODE_ENV=production
SESSION_SECRET=ganti_dengan_secret_yang_sangat_panjang_dan_random_minimal_30_karakter_harus_unik_dan_aman_123456789012345
DB_PATH=./data/pamsimas.db
BASE_URL=https://air.contohanda.com
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

**⚠️ Penting:** Gunakan `https://` di production dan generate `SESSION_SECRET` yang random/aman

#### Step 6: Init Database

```bash
npm run init-db
```

#### Step 7: Start dengan PM2

```bash
pm2 start src/server.js --name "pamsimas" --exp-backoff-restart-delay=100

# Save PM2 config
pm2 save

# Show logs
pm2 logs pamsimas
```

Verify running:
```bash
pm2 list
```

#### Step 8: Setup Nginx Reverse Proxy

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/pamsimas
```

Paste config:

```nginx
server {
    listen 80;
    server_name air.contohanda.com www.air.contohanda.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pamsimas /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 9: Setup SSL with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d air.contohanda.com -d www.air.contohanda.com

# Auto-renewal is configured automatically
```

Verify SSL:
```bash
# Test renewal
sudo certbot renew --dry-run
```

#### Step 10: Setup Backup Otomatis

Create backup script `/home/ubuntu/backup-pamsimas.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pamsimas"
mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/pamsimas/data/pamsimas.db $BACKUP_DIR/pamsimas-$(date +%Y%m%d-%H%M%S).db

# Keep last 30 days backup only
find $BACKUP_DIR -name "pamsimas-*.db" -mtime +30 -delete

echo "Backup complete at $(date)" >> /var/log/pamsimas-backup.log
```

Add to crontab (backup setiap hari jam 2 pagi):

```bash
0 2 * * * /home/ubuntu/backup-pamsimas.sh
```

---

### 🔄 Update Aplikasi di Production

```bash
cd /var/www/pamsimas

# Fetch latest code
git fetch origin
git pull origin main

# Install/update dependencies
npm ci --no-fund --no-audit --ignore-scripts
npm rebuild better-sqlite3 --verbose

# Restart PM2
pm2 restart pamsimas

# Verify
pm2 logs pamsimas
```

---

### ⚙️ Environment Variables Reference

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `APP_PORT` | `3000` | Port yang digunakan aplikasi |
| `NODE_ENV` | `development` | Mode (`development` atau `production`) |
| `SESSION_SECRET` | ⚠️ *required* | Secret key untuk session encryption (min 20 char) |
| `DB_PATH` | `./data/pamsimas.db` | Path database SQLite |
| `BASE_URL` | `http://localhost:3000` | Base URL publik (untuk link di notifikasi) |
| `UPLOAD_DIR` | `public/uploads/meter` | Folder untuk upload foto meter |
| `WA_SESSION_DIR` | `./data/wa-session` | Folder session Baileys WhatsApp |

**Production Tips:**
- Generate `SESSION_SECRET` dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Set `NODE_ENV=production` untuk performance optimization
- Gunakan `https://` di `BASE_URL`
- Jangan commit `.env` file ke Git

---

## 🚀 Scripts NPM

```bash
npm start        # Run production mode (blocking)
npm run dev      # Run development mode (auto-reload)
npm run init-db  # Initialize SQLite schema & default data
```

---

## 🔐 Security Best Practices

### Production Deployment

1. **Environment Variables**
   - Generate random `SESSION_SECRET` yang panjang
   - Jangan share/commit `.env` ke Git
   - Use `.env.production` untuk secrets

2. **Database**
   - Regular backup (`pamsimas.db` dan `pamsimas.db-wal`)
   - Test restore dari backup
   - Keep backups off-server

3. **Access Control**
   - Use strong password untuk admin
   - Regular change password untuk petugas
   - Monitor user activity logs

4. **QRIS & Payment**
   - Validate webhook token di Macrodroid setup
   - Keep webhook token secret
   - Monitor qris_notif_log untuk suspicious activity

5. **File Upload**
   - Photos di-compress otomatis
   - Validate file type (JPG/PNG only)
   - Max file size: 5MB

6. **SSL Certificate**
   - Always use HTTPS di production
   - Auto-renew SSL dengan Certbot
   - Monitor certificate expiration

---

## 🐛 Troubleshooting

### Database Lock Issues

Jika dapat error `database is locked`:

```bash
# Ensure SQLite WAL is enabled
sqlite3 data/pamsimas.db "PRAGMA journal_mode = WAL;"

# Check database integrity
sqlite3 data/pamsimas.db "PRAGMA integrity_check;"
```

### better-sqlite3 Build Failed

```bash
# Full rebuild
npm rebuild better-sqlite3 --verbose

# Jika masih error, install build tools:
# Ubuntu/Debian:
sudo apt install -y build-essential python3

# macOS:
xcode-select --install
```

### WhatsApp Session Lost

Jika WA gateway disconnect:

1. Delete folder `data/wa-session/`
2. Restart aplikasi: `pm2 restart pamsimas`
3. Admin re-scan QR code untuk setup WhatsApp baru

### High Memory Usage

```bash
# Check memory:
pm2 show pamsimas

# Limit memory:
pm2 start src/server.js --max-memory-restart 512M
```

---
---

## 📖 API Documentation

### REST API Endpoints

#### QRIS Webhook Endpoint

**POST** `/api/qris/macrodroid`

Endpoint untuk menerima notifikasi pembayaran QRIS dari Macrodroid.

**Headers:**
```
X-Webhook-Token: <token_dari_pengaturan>
Content-Type: application/json
```

**Request Body (contoh):**
```json
{
  "type": "payment",
  "amount": 50234,
  "timestamp": "2024-01-15T10:30:45Z",
  "source": "macrodroid",
  "message": "Pembayaran masuk Rp 50.234"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Pembayaran berhasil dicocokkan",
  "matched": {
    "tagihan_id": 123,
    "pelanggan_nama": "Adi Wijaya",
    "amount": 50234
  }
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "message": "Nominal tidak cocok dengan tagihan apapun",
  "amount": 50234
}
```

---

## 📧 WhatsApp Integration

### Template Pesan Default

Admin dapat customize template di pengaturan WhatsApp. Template tersedia variable:

**Variabel Template:**
- `{{nama}}` - Nama pelanggan
- `{{periode}}` - Periode tagihan (format: "Januari 2024")
- `{{no_meter}}` - Nomor meteran pelanggan
- `{{total}}` - Total tagihan (format: "50.234")
- `{{qris_nominal}}` - Nominal unik QRIS (format: "50.234")
- `{{qris_kode}}` - Kode QRIS
- `{{link}}` - Link ke halaman pembayaran publik

**Contoh Template:**
```
Yth. {{nama}},

Tagihan air periode {{periode}} sudah terbit.

📍 No. Meter: {{no_meter}}
💰 Total Tagihan: Rp {{total}}

Silakan scan QRIS di bawah atau kunjungi:
{{link}}

Kode Pembayaran: {{qris_kode}}
Nominal: Rp {{qris_nominal}}

Pastikan nominal dibayar sama persis agar sistem dapat mendeteksi pembayaran otomatis.

Terima kasih,
Tim PAMSIMAS
```

### Notifikasi yang Dikirim

1. **Tagihan Terbit** - Saat catter verify input meter
2. **Pembayaran Sukses** - Saat QRIS/manual payment matched
3. **Reminder Pembayaran** - Jika dihidupkan, kirim reminder otomatis
4. **Test Message** - Admin dapat test kirim dari pengaturan

---

## 📊 Fitur Analytics & Reporting

### Admin Dashboard Analytics

- **Quick Stats Card:**
  - Total pelanggan aktif
  - Total tagihan belum bayar
  - Total pemasukan bulan ini
  - Persentase pembayaran tepat waktu

- **Grafik Pemasukan:**
  - Trend pemasukan 12 bulan terakhir
  - Breakdown: air, admin fee, denda
  - Monthly comparison

- **Grafik Pembayaran:**
  - % pembayaran on-time vs late
  - Top 10 pelanggan by tagihan
  - Payment method breakdown

### Customer Dashboard Analytics

- **Personal Stats:**
  - Total tagihan bulan ini
  - Pemakaian kubik trend (3-6 bulan)
  - Total bayar vs belum bayar

- **Personal Grafik:**
  - Trend pemakaian per bulan
  - Trend tagihan per bulan
  - Breakdown biaya detail

---

## 🎯 Fitur Admin Khusus

### Setup Wizard

Saat pertama kali akses, admin harus menyelesaikan setup:

1. **Create Admin Account**
   - Username
   - Password (min 8 char)
   - Confirm password

2. **Konfigurasi Tarif** (optional)
   - Harga per kubik
   - Minimum abonement
   - Biaya admin
   - Denda

3. **Info Instansi** (optional)
   - Nama PAMSIMAS
   - Nama instansi
   - Logo
   - Alamat loket

### Dashboard Features

**🧑‍💼 Manajemen Petugas:**
- Daftar semua catter & kasir
- Create/Edit/Delete petugas
- Reset password petugas
- Track produktivitas per petugas

**👥 Manajemen Pelanggan:**
- Import pelanggan (bulk)
- Create/Edit/Delete pelanggan
- Assign golongan tarif
- Assign user login ke pelanggan
- Export daftar pelanggan

**💰 Manajemen Tarif:**
- 3 golongan tarif predefined
- Edit harga blok per golongan
- Edit biaya admin per golongan
- Edit minimum abonement
- Toggle mode progresif/flat

**🔧 Pengaturan QRIS:**
- Enable/disable QRIS
- Upload QRIS payload
- Upload QRIS image
- Set webhook token
- Set matching window
- Test webhook

**💬 Pengaturan WhatsApp:**
- Setup WhatsApp gateway
- Custom template pesan
- Setup reminder otomatis
- Test send message
- View WA log

**📋 Monitoring:**
- QRIS notification log
- Payment log
- User activity log
- System health status

---

## 🔒 Authentication & Authorization

### Role-Based Access Control (RBAC)

Aplikasi implementasi RBAC sederhana dengan 4 role:

**Admin:** Akses penuh ke semua menu
**Catter:** Akses terbatas ke input meter dan dashboard
**Kasir:** Akses terbatas ke input pembayaran dan receipt
**Pelanggan:** Akses terbatas ke dashboard personal

### Session Management

- Session timeout: 8 jam inactive
- Secure cookies dengan httpOnly flag
- CSRF protection di forms
- Password hashed dengan bcryptjs

### Login Flow

1. Cek apakah admin sudah ada
2. Jika belum → redirect ke `/setup`
3. Jika sudah → tampilkan login form
4. Username/password validation
5. Password compare dengan bcrypt hash
6. Set session jika valid
7. Redirect ke dashboard sesuai role

---

## 🐳 Docker Support (Optional)

Untuk deployment dengan Docker:

**Dockerfile** (minimal example):

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-fund --no-audit --ignore-scripts && \
    npm rebuild better-sqlite3 --verbose

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  pamsimas:
    build: .
    ports:
      - "3000:3000"
    environment:
      APP_PORT: 3000
      NODE_ENV: production
      SESSION_SECRET: your-secret-here
      BASE_URL: http://localhost:3000
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    restart: unless-stopped
```

Build & run:
```bash
docker-compose up -d
```

---

## 📞 Support & Kontribusi

### Issues & Bug Reports

Found a bug? Please report di [GitHub Issues](https://github.com/alijayanet/pamsimas/issues)

Include:
- Step to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc)

### Feature Requests

Punya ide fitur baru? [Buat feature request](https://github.com/alijayanet/pamsimas/discussions)

### Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Development by

**Alijah Anet** - [GitHub](https://github.com/alijayanet)

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [EJS Template Docs](https://ejs.co/)
- [Bootstrap 4 Docs](https://getbootstrap.com/docs/4.6/)
- [AdminLTE 3](https://adminlte.io/)

---

## 🚀 Roadmap Fitur Mendatang

- [ ] Tarif bertingkat per blok kubik yang lebih fleksibel
- [ ] Simulasi/kalkulator tagihan di dashboard admin
- [ ] Badge tunggakan berapa bulan untuk pelanggan
- [ ] Export ke PDF/Excel untuk laporan
- [ ] SMS gateway alternative ke WhatsApp
- [ ] Mobile app native (React Native/Flutter)
- [ ] API GraphQL untuk integrasi eksternal
- [ ] Sistem approval workflow untuk pembayaran
- [ ] Data visualization/dashboard yang lebih interaktif
- [ ] Multi-language support (ID, EN)

---

## 📅 Changelog

### v1.0.0 (Current)
- Initial release
- Full PAMSIMAS operasional system
- QRIS integration
- WhatsApp notification
- Multi-role dashboard
- Complete billing system

---

**Last Updated:** 15 January 2024  
**Version:** 1.0.0  
**Status:** Stable
