# 🚀 WealthPulse — Panduan Setup Lengkap (Windows + Railway)

## Perkiraan waktu: 30–45 menit

---

## BAGIAN 1 — Install Tools (lakukan sekali saja)

### Step 1: Install Node.js
1. Buka https://nodejs.org
2. Download versi **LTS** (tombol hijau kiri)
3. Jalankan installer, klik Next terus sampai selesai
4. Buka **Command Prompt** (tekan `Win + R`, ketik `cmd`, Enter)
5. Ketik: `node --version` → harus muncul angka versi (misal `v20.x.x`)

### Step 2: Install Git
1. Buka https://git-scm.com/download/win
2. Download & install (Next terus, default semua)
3. Cek: `git --version`

### Step 3: Install VS Code (editor kode)
1. Buka https://code.visualstudio.com
2. Download & install
3. Ini yang kamu pakai untuk buka & edit kode

---

## BAGIAN 2 — Setup Project di Komputer

### Step 4: Download project ini
Buka Command Prompt, lalu ketik satu per satu:

```bash
cd Desktop
mkdir wealthpulse
cd wealthpulse
```

Sekarang copy semua file project yang sudah dibuatkan ke folder `wealthpulse` di Desktop.

Lalu jalankan:
```bash
npm install
```
Tunggu sampai selesai (1–3 menit).

### Step 5: Setup file environment
Di folder project, ada file bernama `.env.example`.
- Duplikat file itu
- Rename menjadi `.env`
- Isi nanti setelah Railway setup (Step 7)

---

## BAGIAN 3 — Setup Railway (Database + Hosting)

### Step 6: Buat akun Railway
1. Buka https://railway.app
2. Klik **Login with GitHub**
3. Authorize Railway

### Step 7: Buat project di Railway
1. Di dashboard Railway → klik **New Project**
2. Pilih **Deploy from GitHub repo**
3. Pilih repo `wealthpulse` kamu
4. Railway otomatis detect Next.js ✅

### Step 8: Tambah Database PostgreSQL
1. Di project Railway → klik **+ New**
2. Pilih **Database → PostgreSQL**
3. Tunggu hingga status **Running**
4. Klik database → tab **Connect**
5. Copy nilai **DATABASE_URL**

### Step 9: Isi file .env
Buka file `.env` di VS Code, isi:

```env
DATABASE_URL="postgresql://..." ← paste dari Railway

NEXTAUTH_SECRET="buat-random-string-panjang-bebas-misal-wealthpulse2024secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional untuk production)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## BAGIAN 4 — Setup Database

### Step 10: Push schema ke database
Di Command Prompt (pastikan masih di folder project):

```bash
npx prisma db push
npx prisma db seed
```

Ini membuat semua tabel dan mengisi data contoh.

---

## BAGIAN 5 — Jalankan di Komputer (Development)

### Step 11: Jalankan project
```bash
npm run dev
```

Buka browser → http://localhost:3000

🎉 **WealthPulse sudah jalan di komputer kamu!**

---

## BAGIAN 6 — Deploy ke Railway (Online)

### Step 12: Push ke GitHub
```bash
git add .
git commit -m "initial commit"
git push origin main
```

Railway otomatis deploy dalam 2–3 menit.

### Step 13: Set environment variables di Railway
1. Di Railway → klik service app kamu
2. Tab **Variables**
3. Tambahkan semua isi `.env` kamu satu per satu

### Step 14: Update NEXTAUTH_URL
Setelah Railway beri domain (misal `wealthpulse.up.railway.app`):
- Update `NEXTAUTH_URL` di Railway Variables dengan URL itu

---

## ✅ Checklist Final

- [ ] Node.js terinstall
- [ ] Git terinstall  
- [ ] `npm install` berhasil
- [ ] Database PostgreSQL jalan di Railway
- [ ] `.env` sudah diisi
- [ ] `npx prisma db push` berhasil
- [ ] `npm run dev` jalan di localhost:3000
- [ ] Push ke GitHub & Railway deploy sukses

---

## ❓ Troubleshooting Umum

**Error: `Cannot find module`**
→ Jalankan `npm install` lagi

**Error: `database connection failed`**
→ Cek DATABASE_URL di `.env`, pastikan tidak ada spasi

**Port 3000 sudah dipakai**
→ Jalankan `npm run dev -- -p 3001` (ganti port)

**Railway build gagal**
→ Cek tab **Logs** di Railway untuk pesan error spesifik

---

Ada pertanyaan? Tanyakan langsung ke Claude! 😊
