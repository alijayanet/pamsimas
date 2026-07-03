# 📚 Documentation Index - PAMSIMAS

Navigasi lengkap ke semua dokumentasi PAMSIMAS.

---

## 🎯 Mulai dari Sini

### 👶 Baru di PAMSIMAS?
**Baca ini terlebih dahulu:**
1. **[QUICK_START.md](QUICK_START.md)** ⭐ ← **START HERE!**
   - Setup dalam 5 menit
   - Login default credentials
   - Basic troubleshooting

2. **[README.md](README.md)**
   - Overview aplikasi
   - Fitur lengkap
   - Tech stack
   - Architecture

---

## 📖 Dokumentasi Instalasi

### Instalasi Berbagai Platform
- **[INSTALL_GUIDE.md](INSTALL_GUIDE.md)** 🔧
  - Local development setup
  - VPS production (Ubuntu)
  - Docker deployment
  - Windows Server setup
  - Complete troubleshooting

### Instalasi Ringkas
- **[QUICK_START.md](QUICK_START.md)** ⚡
  - 5 menit setup
  - Default credentials
  - Basic checklist
  - Restart & management

---

## 🔐 Security & Access

### Password Management
- **[CHANGE_PASSWORD.md](CHANGE_PASSWORD.md)** 🔑
  - Ubah password admin
  - Ubah password petugas
  - Ubah password pelanggan
  - Emergency password reset via database
  - Security best practices

### Default Credentials
**Admin:** 
```
Username: admin
Password: admin123
```

**Sample Pelanggan:**
```
Username: pelanggan1
Password: pelanggan123
No. Meter: 001001
```

---

## 🐛 Troubleshooting & Help

### Masalah Setup & Login
- **[TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md)** 🔧
  - 10 common problems & solutions
  - Database troubleshooting
  - Network issues
  - Emergency recovery
  - Debug mode

---

## 📋 Reference & Summary

### Project Summary
- **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** 📝
  - Perubahan dari versi lama
  - New features
  - Installation checklist
  - Security tips
  - Performance tips

### Features & Roles
- **[README.md](README.md)** 📖 (Section: Fitur Utama)
  - Admin Dashboard features
  - Catter Dashboard features
  - Kasir Dashboard features
  - Pelanggan Dashboard features
  - Public pages features

---

## 🗂️ Documentation Structure

```
PAMSIMAS/
│
├── 📖 Primary Documentation
│   ├── README.md                    ← Main documentation
│   ├── QUICK_START.md              ← 5 min setup ⭐
│   ├── DOCS.md                      ← This file
│   │
│
├── 🔧 Installation & Setup
│   ├── INSTALL_GUIDE.md            ← All platforms
│   ├── SETUP_SUMMARY.md            ← What's new
│   ├── QUICK_START.md              ← Quick setup
│   │
│
├── 🆘 Troubleshooting & Help
│   ├── TROUBLESHOOTING_SETUP.md    ← Debug guide
│   ├── CHANGE_PASSWORD.md          ← Password help
│   │
│
├── ⚙️ Configuration Files
│   ├── .env                         ← Configuration
│   ├── .env.example                ← Template
│   │
│
└── 💻 Source Code
    ├── src/
    ├── views/
    ├── public/
    └── ... (see README.md for structure)
```

---

## 🎯 Quick Navigation by Task

### "Saya ingin..."

#### **...install PAMSIMAS pertama kali**
→ Go to: [QUICK_START.md](QUICK_START.md)

#### **...install di VPS production**
→ Go to: [INSTALL_GUIDE.md](INSTALL_GUIDE.md#-vps-production-ubuntu-2204-lts)

#### **...install di Windows**
→ Go to: [INSTALL_GUIDE.md](INSTALL_GUIDE.md#-windows-server)

#### **...install dengan Docker**
→ Go to: [INSTALL_GUIDE.md](INSTALL_GUIDE.md#-docker-deployment)

#### **...login ke aplikasi**
→ Go to: [QUICK_START.md](QUICK_START.md#-login-default)

#### **...ubah password**
→ Go to: [CHANGE_PASSWORD.md](CHANGE_PASSWORD.md)

#### **...fix login problems**
→ Go to: [TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md#-masalah-tidak-bisa-login)

#### **...understand fitur aplikasi**
→ Go to: [README.md](README.md#-fitur-utama-aplikasi)

#### **...deploy to production**
→ Go to: [INSTALL_GUIDE.md](INSTALL_GUIDE.md#-vps-production-ubuntu-2204-lts)

#### **...setup WhatsApp integration**
→ Go to: [README.md](README.md#5-pengaturan-whatsapp-gateway-baileys)

#### **...setup QRIS payment**
→ Go to: [README.md](README.md#4-pengaturan-qris-quick-response-code-indonesian-standard)

#### **...understand database structure**
→ Go to: [README.md](README.md#-database-schema-11-tabel-utama)

#### **...debug database issues**
→ Go to: [TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md#1-database-tidak-terinialisasi)

#### **...know tech stack & architecture**
→ Go to: [README.md](README.md#-tech-stack)

---

## 📚 Documentation by Role

### 👨‍💼 System Administrator
**Start with:**
1. [INSTALL_GUIDE.md](INSTALL_GUIDE.md) - Instalasi
2. [SETUP_SUMMARY.md](SETUP_SUMMARY.md) - Apa yang berubah
3. [CHANGE_PASSWORD.md](CHANGE_PASSWORD.md) - Security

**Reference:**
- [README.md](README.md) - Full documentation
- [TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md) - Debug

### 👨‍💻 Developer
**Start with:**
1. [README.md](README.md) - Architecture & stack
2. [README.md](README.md#-database-schema-11-tabel-utama) - Database
3. [README.md](README.md#-api-documentation) - API docs

### 📱 End User (Admin/Pelanggan)
**Start with:**
1. [QUICK_START.md](QUICK_START.md) - Login & basics
2. [README.md](README.md) - Features guide
3. [CHANGE_PASSWORD.md](CHANGE_PASSWORD.md) - Security

---

## 🔗 External Resources

### Documentation Links
- **GitHub:** https://github.com/alijayanet/pamsimas
- **Node.js:** https://nodejs.org/
- **Express:** https://expressjs.com/
- **SQLite:** https://www.sqlite.org/
- **EJS:** https://ejs.co/

---

## 📞 Getting Help

### Documentation
1. Search relevant doc (QUICK_START, INSTALL_GUIDE, etc)
2. Check TROUBLESHOOTING_SETUP.md for your issue
3. Read full README.md for complete reference

### Issues & Bugs
- Create issue di GitHub: https://github.com/alijayanet/pamsimas/issues
- Include error message dan steps to reproduce

### Community
- GitHub Discussions (coming soon)

---

## 📈 Documentation Versions

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | Jan 2024 | ✅ Current | Auto-create defaults, better docs |
| 0.9.0 | Dec 2023 | ⚠️ Legacy | Manual setup required |

---

## 🎓 Learning Path

### Absolute Beginner
1. [QUICK_START.md](QUICK_START.md) - Pahami basic setup
2. [README.md](README.md#-fitur-utama-aplikasi) - Pahami fitur
3. [README.md](README.md#-alur-operasional-lengkap) - Pahami workflow

### Experienced User
1. [INSTALL_GUIDE.md](INSTALL_GUIDE.md) - Choose platform
2. [README.md](README.md#-database-schema-11-tabel-utama) - Understand DB
3. [README.md](README.md#-api-documentation) - Understand API

### System Administrator
1. [INSTALL_GUIDE.md](INSTALL_GUIDE.md) - Full installation
2. [SETUP_SUMMARY.md](SETUP_SUMMARY.md) - Configuration
3. [TROUBLESHOOTING_SETUP.md](TROUBLESHOOTING_SETUP.md) - Ops & maintenance

---

## ✅ Checklist: Which Doc to Read?

- [ ] **New installation?** → QUICK_START.md
- [ ] **Problems logging in?** → TROUBLESHOOTING_SETUP.md
- [ ] **Need to change password?** → CHANGE_PASSWORD.md
- [ ] **Deploying to production?** → INSTALL_GUIDE.md
- [ ] **Want to understand features?** → README.md
- [ ] **Understanding what's new?** → SETUP_SUMMARY.md
- [ ] **Need API documentation?** → README.md (API section)
- [ ] **Database questions?** → README.md (Database section)

---

## 🎯 TL;DR (Too Long, Didn't Read)

**Just want to start?**

```bash
git clone https://github.com/alijayanet/pamsimas.git
cd pamsimas
npm install && npm rebuild better-sqlite3 --verbose
cp .env.example .env
npm run init-db
npm start
```

Then login with: `admin / admin123`

See [QUICK_START.md](QUICK_START.md) for details.

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

**Happy setup! Enjoy PAMSIMAS! 🚀**
