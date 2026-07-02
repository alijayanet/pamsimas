# PAMSIMAS

> Sistem manajemen pelanggan air desa, pencatatan meter, tagihan, pembayaran loket, QRIS, dan notifikasi WhatsApp dalam satu aplikasi.

[![Repository](https://img.shields.io/badge/GitHub-alijayanet%2Fpamsimas-181717?style=for-the-badge&logo=github)](https://github.com/alijayanet/pamsimas)
[![Node](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/index.html)
[![Express](https://img.shields.io/badge/Backend-Express-000000?style=for-the-badge&logo=express)](https://expressjs.com/)

## Overview

`PAMSIMAS` adalah aplikasi operasional pengelolaan air desa yang dirancang untuk kebutuhan:

- admin pengelola
- petugas catter pencatat meter
- kasir / loket pembayaran
- pelanggan akhir

Aplikasi ini mendukung:

- input meteran bulanan
- upload foto meter
- pembuatan tagihan otomatis
- tarif minimum / abonement
- pembayaran manual loket
- pembayaran QRIS
- auto-konfirmasi QRIS via webhook Macrodroid
- notifikasi dan reminder WhatsApp via Baileys

## Repository

- GitHub: [alijayanet/pamsimas](https://github.com/alijayanet/pamsimas)

## Fitur Utama

### Admin

- login admin / petugas di `/login`
- CRUD pelanggan
- CRUD petugas `catter` dan `kasir`
- pengaturan tarif, biaya admin, denda, dan abonement minimum
- pengaturan QRIS statik dan dinamis
- pengaturan WhatsApp, template pesan, reminder, dan test kirim
- monitoring log notifikasi QRIS
- keuangan pemasukan dan pengeluaran

### Catter

- cari pelanggan
- input meter awal dan meter akhir
- upload foto meter dari HP / kamera
- status input `pending` atau `verified`
- otomatis membuat tagihan saat input disimpan

### Kasir

- cari tagihan belum bayar
- catat pembayaran manual
- akses QRIS operasional per tagihan
- cetak / lihat receipt pembayaran

### Pelanggan

- login pelanggan di `/pelanggan/login`
- dashboard mobile-friendly dengan bottom navbar
- cek tagihan dan riwayat pembayaran
- lihat foto meter hasil input catter
- lihat rincian pemakaian dan detail biaya
- bayar langsung via QRIS
- ubah password akun pelanggan

## Stack

- `Node.js` `>=20 <22`
- `Express.js`
- `EJS`
- `better-sqlite3`
- `Bootstrap 4`
- `AdminLTE 3`
- `Multer`
- `Baileys`
- `QRCode`
- `Chart.js`

## Struktur Folder

```text
src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
views/
public/
  css/
  uploads/
```

## Link Aplikasi

- Root: `http://localhost:3000/`
- Setup awal admin: `http://localhost:3000/setup`
- Login admin / catter / kasir: `http://localhost:3000/login`
- Login pelanggan: `http://localhost:3000/pelanggan/login`
- Cek tagihan publik: `http://localhost:3000/pelanggan/cek`
- Dashboard admin: `http://localhost:3000/admin`
- Dashboard catter: `http://localhost:3000/catter`
- Dashboard kasir: `http://localhost:3000/kasir`
- Dashboard pelanggan: `http://localhost:3000/pelanggan`

## Instalasi Lokal

### 1. Clone repository

```bash
git clone https://github.com/alijayanet/pamsimas.git
cd pamsimas
```

### 2. Gunakan Node.js 20

```bash
node -v
```

Pastikan hasilnya `v20.x.x`.

### 3. Install dependency

```bash
npm install --no-fund --no-audit
```

Kalau `better-sqlite3` belum terbangun dengan benar:

```bash
npm rebuild better-sqlite3 --verbose
```

### 4. Buat file `.env`

Contoh:

```env
APP_PORT=3000
NODE_ENV=development
SESSION_SECRET=isi_dengan_secret_panjang_yang_aman
DB_PATH=./data/pamsimas.db
BASE_URL=http://localhost:3000
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

### 5. Inisialisasi database

```bash
npm run init-db
```

### 6. Jalankan aplikasi

```bash
npm start
```

## Instalasi Di Server Linux / VPS

Panduan berikut cocok untuk `Ubuntu 22.04` / `Ubuntu 24.04`.

### 1. Update server

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install paket dasar

```bash
sudo apt install -y git curl build-essential nginx
```

### 3. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 4. Install PM2

```bash
sudo npm install -g pm2
```

### 5. Clone project

```bash
cd /var/www
sudo git clone https://github.com/alijayanet/pamsimas.git
sudo chown -R $USER:$USER /var/www/pamsimas
cd /var/www/pamsimas
```

### 6. Install dependency

```bash
npm install --no-fund --no-audit
npm rebuild better-sqlite3 --verbose
```

### 7. Buat `.env` production

```bash
nano .env
```

Contoh:

```env
APP_PORT=3000
NODE_ENV=production
SESSION_SECRET=ganti_dengan_secret_yang_panjang_dan_aman
DB_PATH=./data/pamsimas.db
BASE_URL=https://domain-anda.com
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

### 8. Inisialisasi database

```bash
npm run init-db
```

### 9. Jalankan dengan PM2

```bash
pm2 start src/server.js --name pamsimas
pm2 save
pm2 startup
```

### 10. Konfigurasi Nginx reverse proxy

Buat file:

```bash
sudo nano /etc/nginx/sites-available/pamsimas
```

Isi contoh:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

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
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/pamsimas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 11. Pasang SSL dengan Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

## Update Aplikasi Di Server

```bash
cd /var/www/pamsimas
git pull origin main
npm install --no-fund --no-audit
npm rebuild better-sqlite3 --verbose
pm2 restart pamsimas
```

## Script NPM

- `npm start`
- `npm run dev`
- `npm run init-db`

## Konfigurasi Environment

| Key | Fungsi |
|-----|--------|
| `APP_PORT` | Port aplikasi |
| `NODE_ENV` | Mode aplikasi |
| `SESSION_SECRET` | Secret session Express |
| `DB_PATH` | Lokasi database SQLite |
| `BASE_URL` | Base URL utama |
| `UPLOAD_DIR` | Folder upload foto meter |
| `WA_SESSION_DIR` | Folder session Baileys |

## Sistem Tarif Abonement

Aplikasi mendukung sistem **minimum pemakaian ditagih**.

Contoh:

- harga per kubik: `Rp3.000`
- minimum abonement: `5 m3`

Perhitungan:

```text
kubik_ditagih = max(pemakaian_asli, minimum_pemakaian_kubik)
biaya_air = kubik_ditagih x harga_per_kubik
total_tagihan = biaya_air + biaya_admin + denda
```

Contoh hasil:

- pakai `2 m3` -> ditagih `5 m3`
- pakai `5 m3` -> ditagih `5 m3`
- pakai `6 m3` -> ditagih `6 m3`

Setting ini dapat diubah di dashboard admin pada menu:

- `Admin > Pengaturan > Parameter Tarif`

## Alur Operasional

### Input meter

1. Catter cari pelanggan
2. Input meter akhir
3. Upload foto meter
4. Sistem ambil meter awal dari bulan sebelumnya
5. Sistem hitung pemakaian dan tagihan
6. Sistem simpan pencatatan + tagihan
7. Sistem kirim notifikasi WA jika tersedia

### Pembayaran QRIS

1. Admin mengaktifkan QRIS
2. Tagihan diberi nominal unik
3. Pelanggan bayar via QRIS
4. Macrodroid kirim webhook ke aplikasi
5. Sistem cocokkan nominal
6. Tagihan otomatis lunas jika match

## QRIS

Fitur QRIS meliputi:

- QRIS statik
- QRIS nominal unik
- QRIS dinamis per nominal
- upload bukti bayar pelanggan
- retry match manual
- log notifikasi pembayaran

Endpoint webhook:

- `POST /api/qris/macrodroid`

Header wajib:

- `X-Webhook-Token`

## WhatsApp Gateway

Integrasi WhatsApp memakai `@whiskeysockets/baileys`.

Fitur yang tersedia:

- notifikasi tagihan
- kirim QRIS via WA
- receipt pembayaran
- broadcast pengumuman
- reminder tagihan
- test koneksi WA

## Dashboard Pelanggan

Sudah tersedia:

- login pelanggan
- bottom navbar mobile
- grafik pemakaian dan tagihan
- foto meter + modal preview
- rincian pemakaian dan detail tagihan
- info abonement minimum
- riwayat pembayaran
- ganti password

## Catatan Produksi

- Gunakan `Node.js 20`
- Jangan gunakan fallback `SESSION_SECRET` statis
- Asset frontend disajikan lokal, tanpa CDN
- Simpan backup database SQLite secara berkala
- Pastikan folder `data/` dan `public/uploads/` ikut dibackup
- Jika menggunakan WhatsApp Gateway, pastikan session `Baileys` tidak ikut terhapus saat deploy

## Backup Sederhana

Contoh backup database:

```bash
cp /var/www/pamsimas/data/pamsimas.db /var/backups/pamsimas-$(date +%F).db
```

## Pengembangan Lanjutan

- tarif bertingkat per blok kubik
- simulasi tagihan di dashboard admin
- badge tunggakan berapa bulan
- cetak bukti pembayaran pelanggan
- statistik pemakaian per pelanggan
