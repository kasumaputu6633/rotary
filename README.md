# Rotary

Marketplace barang bekas untuk jual, beli, dan donasi, sekaligus direktori lokasi penampung limbah. Rotary mempertemukan penjual dan pembeli barang bekas dalam satu platform, dilengkapi peta lokasi penampung sampah/limbah agar barang yang tak lagi bernilai jual tetap punya tujuan yang benar.

## Fitur Utama

**Marketplace**
- Listing barang dengan dua mode: penjualan (`sale`) dan donasi (`donation`)
- Pencarian, kategori & subkategori, kondisi barang, serta galeri foto per listing
- Favorit listing dengan notifikasi (direservasi, terjual, turun harga)
- Alur *deal* penjual–pembeli (negosiasi, kesepakatan, jadwal serah terima)
- Chat in-app antar pengguna, dengan opsi kontak via WhatsApp
- Peta & autocomplete alamat listing (Mapbox)

**Direktori Penampung Limbah**
- Data lokasi penampung (TPS, bank sampah, dropbox, komunitas, dll.)
- Jenis sampah yang diterima, jam operasional, kontak, dan titik peta
- Simpan lokasi favorit & riwayat lokasi yang dilihat

**Akun & Keamanan**
- Registrasi/login berbasis sesi cookie server-side (`rotary_session`)
- Verifikasi email & nomor HP via OTP (email lewat Resend, WhatsApp lewat WAHA)
- Two-factor authentication (email atau WhatsApp) + recovery codes
- Manajemen perangkat & riwayat aktivitas login
- Pusat notifikasi dengan preferensi opt-out per kategori

**Panel Admin (hierarki `super_admin` ⊇ `admin` ⊇ `user`)**
- Dashboard agregat (pengguna, penjual, listing, transaksi, tren)
- Manajemen pengguna, admin, kategori, dan lokasi limbah
- Moderasi listing serta komplain/laporan pengguna

**Lifecycle Otomatis**
- Cron job mendeteksi listing berumur 30 hari, mengirim konfirmasi perpanjangan via WhatsApp, dan menonaktifkan listing bila tak ada konfirmasi dalam 48 jam (lihat [`CRON.md`](./CRON.md))

## Teknologi

| Area | Teknologi |
|------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Bahasa | TypeScript |
| Database | PostgreSQL + Drizzle ORM (driver `postgres`) |
| Styling | Tailwind CSS v4 |
| Auth | Sesi cookie server-side + bcryptjs |
| OTP / WhatsApp | WAHA |
| Email | Resend |
| Object Storage | Cloudflare R2 |
| Peta & Geocoding | Mapbox GL + `@mapbox/search-js` |
| Grafik | Recharts |
| Notifikasi UI | Sonner |

## Prasyarat

- Node.js 20+
- PostgreSQL (lokal via Docker, atau Supabase untuk production)
- Akun/kredensial untuk Resend, WAHA, Cloudflare R2, dan Mapbox

## Menjalankan Secara Lokal

1. **Install dependency**

   ```bash
   npm install
   ```

2. **Siapkan database (opsional, via Docker)**

   ```bash
   docker compose up -d
   ```

   Ini menjalankan PostgreSQL di port `5432` dan pgAdmin di `http://localhost:5050`.

3. **Konfigurasi environment**

   Salin `env.example` menjadi `.env.local`, lalu isi nilainya:

   ```bash
   cp env.example .env.local
   ```

   Variabel yang perlu diisi antara lain `DATABASE_URL`, `RESEND_API_KEY`, `WAHA_*`, `OTP_HASH_SECRET`, `R2_*`, `NEXT_PUBLIC_MAPBOX_TOKEN`, dan `CRON_*`.

4. **Jalankan migrasi database**

   ```bash
   npm run db:migrate
   ```

5. **Jalankan development server**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Script yang Tersedia

| Script | Kegunaan |
|--------|----------|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | Menjalankan ESLint |
| `npm run db:generate` | Membuat file migrasi dari perubahan schema |
| `npm run db:migrate` | Menerapkan migrasi ke database |
| `npm run db:push` | Push schema langsung ke database |
| `npm run db:studio` | Membuka Drizzle Studio |

## Struktur Proyek

```
app/            Routes App Router (marketplace, waste, dashboard, admin, auth, api)
  api/          Route handler (chat, cron, categories, notifications)
  dashboard/    Area penjual (listing, deals, chat, favorit, profil)
  admin/        Panel admin & super admin
  (auth)/       Login, register, forgot-password
db/
  schema/       Definisi schema Drizzle (per domain)
  migrations/   File migrasi SQL
lib/            Logika domain & integrasi (auth, listings, deals, chat, waha, r2, mapbox, dll.)
proxy.ts        Guard route berbasis cookie sesi
```

## Deployment

Project ini dioptimalkan untuk deploy di **Vercel**. Cron job penjadwalan lifecycle listing sudah dikonfigurasi lewat [`vercel.json`](./vercel.json). Untuk penyedia lain (cron-job.org, crontab VPS), ikuti panduan di [`CRON.md`](./CRON.md) dan set `CRON_TYPE=external`.
