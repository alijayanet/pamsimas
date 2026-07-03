# 📖 Complete Installation Guide - PAMSIMAS

Panduan instalasi lengkap PAMSIMAS untuk berbagai environment.

---

## 🖥️ Table of Contents

1. [Local Development](#local-development)
2. [VPS Production (Ubuntu)](#vps-production-ubuntu)
3. [Docker Deployment](#docker-deployment)
4. [Windows Server](#windows-server)
5. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Development

### Prerequisites

- Node.js 20.x (https://nodejs.org/)
- npm 10.x atau yarn
- Git (optional, untuk clone repository)
- 500 MB free disk space

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/alijayanet/pamsimas.git
cd pamsimas

# 2. Install dependencies
npm install --no-fund --no-audit

# 3. Rebuild native modules (important!)
npm rebuild better-sqlite3 --verbose

# 4. Setup environment variables
cp .env.example.txt .env
# Edit .env jika perlu, default sudah OK

# 5. Initialize database
npm run init-db

# 6. Run development server
npm run dev
```

**Output yang diharapkan:**
```
✅ PAMSIMAS app running at http://localhost:3005
✅ Default admin created: username=admin, password=admin123
📝 Login dengan: username=admin, password=admin123
```

**Access aplikasi:**
- Admin: http://localhost:3005/login
- Pelanggan: http://localhost:3005/pelanggan/login

---

## 🖧 VPS Production (Ubuntu 22.04 LTS)

### Prerequisites

- Ubuntu 22.04 LTS atau 24.04 LTS
- SSH access ke server
- Minimal 1 GB RAM, 10 GB disk space
- Root atau sudo access

### Step-by-Step Installation

#### 1. System Update

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential curl git nginx
```

#### 2. Install Node.js 20

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node -v    # Should be v20.x.x
npm -v     # Should be 10.x.x
```

#### 3. Install PM2 (Process Manager)

```bash
# Install globally
sudo npm install -g pm2

# Setup startup script
pm2 startup
pm2 save
```

#### 4. Clone & Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/pamsimas
cd /var/www/pamsimas

# Clone from GitHub
sudo git clone https://github.com/alijayanet/pamsimas.git .

# Change ownership
sudo chown -R $USER:$USER /var/www/pamsimas

# Install dependencies
npm ci --no-fund --no-audit --ignore-scripts
npm rebuild better-sqlite3 --verbose
```

#### 5. Create Production .env

```bash
nano .env
```

Isi dengan:

```env
APP_PORT=3005
NODE_ENV=production
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DB_PATH=./data/pamsimas.db
BASE_URL=https://air.yourdomain.com
UPLOAD_DIR=public/uploads/meter
WA_SESSION_DIR=./data/wa-session
```

#### 6. Initialize Database

```bash
npm run init-db
```

**Expected output:**
```
✅ Default admin created
✅ Sample pelanggan created
```

#### 7. Start dengan PM2

```bash
# Start application
pm2 start src/server.js --name "pamsimas" \
  --exp-backoff-restart-delay=100 \
  --max-memory-restart 512M

# Verify running
pm2 list
pm2 logs pamsimas

# Save PM2 config
pm2 save
```

#### 8. Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/pamsimas
```

Paste:

```nginx
upstream pamsimas_backend {
    server 127.0.0.1:3005;
}

server {
    listen 80;
    server_name air.yourdomain.com www.air.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://pamsimas_backend;
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
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 9. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d air.yourdomain.com -d www.air.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### 10. Setup Automatic Backup

Create backup script `/home/ubuntu/backup-pamsimas.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pamsimas"
mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/pamsimas/data/pamsimas.db $BACKUP_DIR/pamsimas-$(date +%Y%m%d-%H%M%S).db

# Keep last 30 days backup only
find $BACKUP_DIR -name "pamsimas-*.db" -mtime +30 -delete

# Log
echo "Backup completed at $(date)" >> /var/log/pamsimas-backup.log
```

Make executable and add to crontab:

```bash
chmod +x /home/ubuntu/backup-pamsimas.sh

# Add to crontab (backup setiap hari jam 2 pagi)
crontab -e

# Add line:
# 0 2 * * * /home/ubuntu/backup-pamsimas.sh
```

### Manage Application (PM2)

```bash
# Restart
pm2 restart pamsimas

# Stop
pm2 stop pamsimas

# Start
pm2 start pamsimas

# View logs
pm2 logs pamsimas

# Monitor
pm2 monit
```

---

## 🐳 Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose 2.0+
- 2 GB RAM minimum

### Dockerfile

File: `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-fund --no-audit --ignore-scripts && \
    npm rebuild better-sqlite3 --verbose

COPY . .

EXPOSE 3005

ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Docker Compose

File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  pamsimas:
    build: .
    container_name: pamsimas
    ports:
      - "3005:3005"
    environment:
      APP_PORT: 3005
      NODE_ENV: production
      SESSION_SECRET: ${SESSION_SECRET:-dev_secret_key_12345}
      BASE_URL: http://localhost:3005
      DB_PATH: /app/data/pamsimas.db
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3005"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Usage

```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f pamsimas

# Stop
docker-compose stop

# Restart
docker-compose restart
```

---

## 💻 Windows Server

### Prerequisites

- Windows Server 2019+ atau Windows 10/11
- Node.js 20.x
- npm or yarn
- 500 MB free disk space

### Installation

1. **Download Node.js** from https://nodejs.org/ (choose LTS 20.x)
2. **Install** Node.js (add to PATH)
3. **Open PowerShell** as Administrator
4. **Run commands:**

```powershell
# Navigate to desired directory
cd C:\var\www

# Clone repository
git clone https://github.com/alijayanet/pamsimas.git
cd pamsimas

# Install dependencies
npm install --no-fund --no-audit
npm rebuild better-sqlite3 --verbose

# Setup .env
Copy-Item .env.example .env
# Edit .env with Notepad

# Initialize database
npm run init-db

# Run application
npm start
```

### Using NSSM for Service (Windows)

```powershell
# Download NSSM from https://nssm.cc/download

# Navigate to nssm directory
cd C:\nssm\win64

# Create service
.\nssm.exe install PAMSIMAS "C:\Program Files\nodejs\node.exe" "C:\var\www\pamsimas\src\server.js"

# Start service
Start-Service PAMSIMAS

# View service status
Get-Service PAMSIMAS
```

---

## 🔧 Troubleshooting

### Issue: "Database is locked"

**Solution:**
```bash
# Stop application
# Delete WAL files
rm -f ./data/pamsimas.db-shm
rm -f ./data/pamsimas.db-wal

# Restart application
npm start
```

### Issue: "Port 3005 already in use"

**Linux/Mac:**
```bash
# Find process
lsof -i :3005

# Kill process
kill -9 <PID>
```

**Windows:**
```powershell
# Find process
netstat -ano | findstr :3005

# Kill process
taskkill /PID <PID> /F
```

### Issue: "better-sqlite3 build failed"

**Solution:**
```bash
npm rebuild better-sqlite3 --verbose

# Or if using different Node version
npm i node-pre-gyp@latest
npm rebuild better-sqlite3 --verbose
```

### Issue: "Cannot login"

**Solution:**
```bash
# Check database exists
ls -la ./data/pamsimas.db

# Reinit database
npm run init-db

# Check user exists
sqlite3 ./data/pamsimas.db "SELECT * FROM users;"
```

### Issue: "Session not working"

**Solution:**
```bash
# Check SESSION_SECRET in .env
grep SESSION_SECRET .env

# If empty, add value:
SESSION_SECRET=your_random_secret_here_min_20_chars
```

---

## 📋 Post-Installation Checklist

- [ ] Database initialized
- [ ] Default admin created
- [ ] Can login to admin dashboard
- [ ] Can login to pelanggan dashboard
- [ ] Upload folder writable
- [ ] Backup script working
- [ ] SSL certificate valid (production)
- [ ] PM2 set to auto-start (production)
- [ ] Password changed from default
- [ ] WhatsApp configured (optional)
- [ ] QRIS configured (optional)

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Change default pelanggan password
- [ ] Update SESSION_SECRET to random value
- [ ] Use strong HTTPS certificate
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Monitor access logs
- [ ] Keep Node.js updated
- [ ] Regular security patches

---

## 📞 Support

- **GitHub Issues:** https://github.com/alijayanet/pamsimas/issues
- **Documentation:** See README.md
- **Quick Start:** See QUICK_START.md
- **Troubleshooting:** See TROUBLESHOOTING_SETUP.md

---

**Version:** 1.0.0  
**Last Updated:** January 2024
