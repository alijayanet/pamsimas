# 🔧 GitHub Setup Guide - PAMSIMAS

Panduan untuk setup PAMSIMAS di GitHub dan clone ke server baru.

---

## 📋 File Configuration untuk GitHub

### ✅ File yang Bisa di-Upload ke GitHub

```
✓ .env.example.txt      ← Template file (TEXT, bisa di-upload)
✓ .gitignore            ← Config Git
✓ README.md             ← Documentation
✓ Semua file source     ← Code files
```

### ❌ File yang TIDAK di-Upload (di-.gitignore)

```
✗ .env                  ← Local environment variables
✗ *.db                  ← Database files (SQLite)
✗ *.db-shm              ← Database journal files
✗ *.db-wal              ← Database WAL files
✗ node_modules/         ← Dependencies (install via npm)
✗ /public/uploads/*     ← User uploaded files (keep .gitkeep)
```

---

## 🚀 Push ke GitHub

### 1. Initialize Git Repository

```bash
cd pamsimas
git init
git add .
git commit -m "Initial commit: PAMSIMAS v1.0.0"
git branch -M main
git remote add origin https://github.com/yourusername/pamsimas.git
git push -u origin main
```

### 2. Verify Files di GitHub

Cek di GitHub apakah ada:
- ✅ `.env.example.txt` ← Template file (bisa dilihat)
- ✅ Source code files ← Semua file source
- ❌ `.env` ← Tidak ada (sudah di-.gitignore)
- ❌ `*.db` ← Tidak ada (sudah di-.gitignore)

---

## 💻 Clone ke Server Baru

### Step 1: Clone Repository

```bash
cd /var/www
git clone https://github.com/yourusername/pamsimas.git
cd pamsimas
```

### Step 2: Buat .env File dari Template

```bash
# Copy dari .env.example.txt
cp .env.example.txt .env

# Edit sesuai server
nano .env
```

Edit `.env` dengan nilai server:

```env
APP_PORT=3005
NODE_ENV=production
SESSION_SECRET=your_random_secret_here_minimum_30_chars
DB_PATH=./data/pamsimas.db
BASE_URL=https://your-domain.com
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

### Step 3: Install & Run

```bash
npm install --no-fund --no-audit
npm rebuild better-sqlite3 --verbose
npm run init-db
npm start
```

---

## 📁 .gitignore Configuration

File `.gitignore` sudah configured untuk exclude:

```gitignore
# Environment variables (local, never commit)
.env
!.env.example.txt    ← Important: keep template file

# Database files (auto-generated, never commit)
*.db
*.db-shm
*.db-wal

# Uploads (user files, never commit)
/public/uploads/meter/*
!/public/uploads/meter/.gitkeep

# Node modules (install via npm ci/npm install)
node_modules/
```

---

## 🔑 Why .env.example.txt (Not .env)?

### Problem dengan `.env`
- ❌ Mengandung credentials & secrets
- ❌ Tidak bisa di-upload ke GitHub
- ❌ Berbeda untuk setiap environment (dev vs prod)
- ❌ Security risk jika ter-commit

### Solution: `.env.example.txt`
- ✅ File teks yang bisa di-upload
- ✅ Template dengan placeholder values
- ✅ Tidak ada sensitive data
- ✅ Dokumentasi untuk developer baru
- ✅ Semua environment bisa gunakan sama

---

## 🔄 Workflow: Update Aplikasi di Server

```bash
# 1. Pull latest code
cd /var/www/pamsimas
git pull origin main

# 2. Install/update dependencies (jika ada perubahan)
npm ci --no-fund --no-audit --ignore-scripts
npm rebuild better-sqlite3 --verbose

# 3. Restart aplikasi
pm2 restart pamsimas

# 4. Check status
pm2 logs pamsimas
```

**Note:** `.env` tidak ter-update karena di-.gitignore, perlu manual edit jika ada config baru

---

## ✅ Git Setup Checklist

### Before Pushing to GitHub

- [ ] `.env.example.txt` ada (template file)
- [ ] `.env` tidak ada di git (check: `git status`)
- [ ] `.gitignore` configured dengan benar
- [ ] `node_modules/` tidak ada di git
- [ ] `*.db` files tidak ada di git
- [ ] Documentation (README.md) lengkap

### After Cloning dari GitHub

- [ ] Clone berhasil
- [ ] Copy `.env.example.txt` → `.env`
- [ ] Edit `.env` dengan config lokal
- [ ] Run `npm install`
- [ ] Run `npm run init-db`
- [ ] Run `npm start`
- [ ] Verify login dengan default credentials

---

## 📝 Contents of .env.example.txt

File ini disimpan di repository untuk referensi:

```env
# Server port
APP_PORT=3005

# Environment mode
NODE_ENV=development

# Session encryption key (ubah ke random string yang panjang)
SESSION_SECRET=isi_dengan_secret_panjang_yang_aman

# Database path
DB_PATH=./data/pamsimas.db

# Public base URL
BASE_URL=http://localhost:3005

# Upload directory for meter photos
UPLOAD_DIR=public/uploads/meter

# WhatsApp session directory (Baileys)
WA_SESSION_DIR=./data/wa-session
```

---

## 🔐 Security Rules

### ✅ DO:
- ✅ Commit `.env.example.txt` (template file)
- ✅ Add `.env` ke `.gitignore`
- ✅ Use strong SESSION_SECRET (min 30 chars, random)
- ✅ Keep `.env` file locally only
- ✅ Never share `.env` content
- ✅ Rotate SESSION_SECRET regularly

### ❌ DON'T:
- ❌ Commit `.env` file
- ❌ Push credentials to GitHub
- ❌ Use default credentials di production
- ❌ Share `.env` file antar server
- ❌ Hardcode secrets di source code
- ❌ Upload `.env` anywhere public

---

## 🎯 For Different Environments

### Development (.env)
```env
NODE_ENV=development
SESSION_SECRET=dev_secret_short_ok
BASE_URL=http://localhost:3005
```

### Staging (.env)
```env
NODE_ENV=production
SESSION_SECRET=random_long_secret_here_minimum_30_chars
BASE_URL=https://staging.yourdomain.com
```

### Production (.env)
```env
NODE_ENV=production
SESSION_SECRET=random_long_secret_here_minimum_30_chars
BASE_URL=https://yourdomain.com
```

**Each server punya `.env` sendiri, tidak di-sync via git**

---

## 📚 Related Files

- **README.md** - Main documentation
- **QUICK_START.md** - Quick setup guide
- **INSTALL_GUIDE.md** - Full installation guide
- **TROUBLESHOOTING_SETUP.md** - Debugging guide
- **.gitignore** - Git configuration (already setup)
- **.env.example.txt** - This file (template for .env)

---

## 💡 Tips

1. **First Clone:**
   ```bash
   git clone https://github.com/yourusername/pamsimas.git
   cp .env.example.txt .env
   # Edit .env dengan config lokal
   npm install && npm run init-db && npm start
   ```

2. **Update dari GitHub:**
   ```bash
   git pull origin main
   npm ci  # Install exact versions from package-lock.json
   npm start
   ```

3. **Add New Config:**
   - Update `.env.example.txt` dengan config baru
   - Commit `.env.example.txt`
   - Manually update `.env` di setiap server

---

## ✨ Summary

| File | Git | Purpose |
|------|-----|---------|
| `.env.example.txt` | ✅ Commit | Template & documentation |
| `.env` | ❌ Ignore | Local configuration (secrets) |
| `package.json` | ✅ Commit | Dependencies list |
| `package-lock.json` | ✅ Commit | Locked versions |
| `node_modules/` | ❌ Ignore | Install with npm ci |
| `.gitignore` | ✅ Commit | Git rules |

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** ✅ Production Ready
