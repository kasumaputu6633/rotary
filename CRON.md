# Panduan Konfigurasi Cron Job (Rotary Lifecycle Management)

Rotary menggunakan Cron Job untuk mendeteksi listing yang berumur 30 hari guna mengirimkan WhatsApp konfirmasi perpanjangan, serta menonaktifkan listing secara otomatis jika tidak ada konfirmasi setelah 48 jam.

Dokumen ini menjelaskan opsi konfigurasi di localhost (`.env.local`) serta cara mengaturnya di production menggunakan berbagai penyedia layanan gratis.

---

## 1. Konfigurasi Environment (`.env`)

Tambahkan variabel berikut pada file `.env` (atau `.env.local` untuk localhost):

```env
# Tipe pemicu Cron untuk siklus listing 30 hari
# Pilihan: 
# - 'lazycron' : HANYA UNTUK DEVELOPMENT (localhost). Terpicu otomatis di background saat membuka dashboard.
#                PENTING: Jangan gunakan di production! Jika penjual tidak mengakses dashboard,
#                pemeriksaan listing tidak akan berjalan sehingga listing kedaluwarsa tetap aktif.
# - 'external' : WAJIB UNTUK PRODUCTION. Dipicu secara berkala oleh cron service eksternal
#                (Vercel Cron, cron-job.org, atau VPS crontab) yang memicu endpoint API route.
CRON_TYPE=lazycron

# Secret Token untuk mengamankan API Route Cron (wajib disamakan di layanan eksternal jika CRON_TYPE=external)
CRON_SECRET=rahasia-cron-token-anda-123
```

---

## 2. Pilihan Penyedia Layanan Cron Job di Production (Semua 100% Gratis)

Pilih salah satu dari 3 opsi pemicu eksternal terpopuler berikut untuk production (setelah website di-online-kan dan `CRON_TYPE=external` diaktifkan):

### OPSI 1: Vercel Cron Jobs (Sangat Direkomendasikan & Nais)
Jika Anda men-deploy proyek ini ke **Vercel**, penjadwalan berjalan otomatis secara gratis menggunakan file `vercel.json` yang sudah disediakan di root proyek.

1.  Buka dashboard proyek Anda di **Vercel**.
2.  Masuk ke menu **Settings** > **Environment Variables**.
3.  Tambahkan key berikut:
    *   `CRON_TYPE` = `external`
    *   `CRON_SECRET` = (Isi dengan token rahasia acak pilihan Anda)
4.  Deploy ulang proyek Anda. Vercel akan otomatis membaca file `vercel.json` dan memicu endpoint `/api/cron/deactivate-listings` sekali sehari secara gratis.

---

### OPSI 2: cron-job.org (Mudah & Gratis Selamanya)
Jika Anda menggunakan hosting/layanan cloud lain, **[cron-job.org](https://cron-job.org/)** adalah layanan pihak ketiga gratis paling populer yang tinggal pakai.

1.  Daftar/masuk ke akun Anda di [cron-job.org](https://cron-job.org/).
2.  Klik tombol **Create Cronjob**.
3.  Isi formulir pendaftaran cron:
    *   **Title**: `Rotary Listing Lifecycle`
    *   **Address (URL)**: `https://domain-anda.com/api/cron/deactivate-listings`
    *   **Schedule**: Pilih *Every day at 00:00* (atau interval lainnya).
4.  Pada bagian **Request Headers** (di bagian bawah form):
    *   Tambahkan Header Baru:
        *   **Key**: `Authorization`
        *   **Value**: `Bearer <CRON_SECRET_ANDA>` (Ganti dengan nilai `CRON_SECRET` di `.env` Anda).
5.  Klik **Create**. Selesai!

---

### OPSI 3: Linux Crontab (Bawaan VPS / Server Sendiri)
Jika Anda menggunakan VPS Linux sendiri (seperti Hostinger, DigitalOcean, dsb.), Anda bisa menggunakan penjadwal bawaan Linux.

1.  Masuk ke terminal server VPS Anda via SSH.
2.  Buka konfigurasi crontab:
    ```bash
    crontab -e
    ```
3.  Tambahkan baris berikut di bagian paling bawah file (menjalankan cron otomatis setiap jam 00:00 server):
    ```bash
    0 0 * * * curl -X GET https://domain-anda.com/api/cron/deactivate-listings -H "Authorization: Bearer <CRON_SECRET_ANDA>"
    ```
4.  Simpan dan keluar dari editor. Crontab akan memicu API Next.js Anda setiap hari secara otomatis.
