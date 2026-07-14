import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import SidebarNav from "@/app/_components/SidebarNav";
import HelpCTA from "@/app/_components/HelpCTA";

export const metadata: Metadata = {
  title: "Pusat Bantuan | Rotary",
  description:
    "Temukan jawaban atas pertanyaan umum seputar marketplace Rotary — cara jual beli barang bekas, proses donasi, lokasi penampung limbah, dan keamanan akun.",
};

const faqs: { category: string; icon: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Marketplace & Listing",
    icon: "lucide:shopping-bag",
    items: [
      {
        q: "Bagaimana cara membuat listing barang?",
        a: 'Login ke akun Rotary, lalu buka Lapak Saya melalui menu profil. Klik tombol "Buat Listing Baru", isi detail barang (judul, kategori, kondisi, harga, foto), dan pilih mode penjualan (Jual atau Donasi). Listing akan aktif setelah kamu klik Publikasikan.',
      },
      {
        q: "Apa perbedaan mode Jual dan Donasi?",
        a: 'Mode "Jual" (sale) berarti barang memiliki harga dan pembeli perlu membayar sesuai kesepakatan. Mode "Donasi" berarti barang diberikan secara cuma-cuma kepada yang membutuhkan. Keduanya tetap memerlukan proses deal antara penjual dan penerima untuk mengatur serah terima.',
      },
      {
        q: "Berapa lama listing aktif?",
        a: "Listing aktif selama 30 hari. Sebelum masa aktif habis, kamu akan mendapat notifikasi WhatsApp untuk konfirmasi perpanjangan. Jika tidak ada konfirmasi dalam 48 jam, listing akan dinonaktifkan secara otomatis.",
      },
      {
        q: "Bisakah saya mengedit listing yang sudah aktif?",
        a: "Ya, kamu dapat mengedit judul, deskripsi, harga, foto, dan detail lainnya kapan saja melalui halaman Lapak Saya. Perubahan harga akan memicu notifikasi favorit kepada pengguna yang menyimpan listing tersebut.",
      },
      {
        q: "Bagaimana cara mencari barang tertentu?",
        a: "Gunakan kolom pencarian di bagian atas halaman. Kamu juga bisa memfilter berdasarkan kategori, kondisi barang (baru/bekas), rentang harga, dan lokasi. Fitur autocomplete akan membantu menemukan kata kunci yang relevan.",
      },
    ],
  },
  {
    category: "Proses Deal & Transaksi",
    icon: "lucide:handshake",
    items: [
      {
        q: "Bagaimana alur deal di Rotary?",
        a: "Pembeli mengirim permintaan deal pada listing yang diminati. Penjual dapat menerima atau menolak permintaan tersebut. Setelah diterima, keduanya bernegosiasi lewat chat in-app untuk menyepakati harga dan jadwal serah terima.",
      },
      {
        q: "Apakah Rotary menyediakan layanan pengiriman?",
        a: "Saat ini Rotary berfokus pada transaksi lokal dengan serah terima langsung. Pengaturan pengiriman (termasuk biaya dan metode) sepenuhnya disepakati antara penjual dan pembeli melalui chat.",
      },
      {
        q: "Apa yang terjadi jika penjual atau pembeli tidak responsif?",
        a: "Jika salah satu pihak tidak responsif dalam waktu yang disepakati, deal dapat dibatalkan oleh pihak yang menginisiasi. Kamu juga dapat melaporkan pengguna yang tidak bertanggung jawab melalui tombol Laporkan di halaman listing.",
      },
    ],
  },
  {
    category: "Lokasi Penampung Limbah",
    icon: "lucide:map-pin",
    items: [
      {
        q: "Apa itu direktori Lokasi Penampung Limbah?",
        a: "Ini adalah peta interaktif yang menampilkan lokasi TPS, bank sampah, dropbox, dan komunitas daur ulang di sekitarmu. Setiap lokasi dilengkapi info jenis sampah yang diterima, jam operasional, dan kontak.",
      },
      {
        q: "Bagaimana cara menemukan penampung terdekat?",
        a: 'Buka menu "Lokasi Penampung" di navigasi. Izinkan akses lokasi agar peta otomatis berpusat ke posisimu. Gunakan filter jenis sampah (plastik, kertas, elektronik, dll.) untuk mempersempit pencarian.',
      },
      {
        q: "Bisakah saya mengusulkan lokasi penampung baru?",
        a: "Saat ini penambahan lokasi dikelola oleh tim admin Rotary. Jika kamu mengetahui lokasi penampung yang belum terdaftar, silakan hubungi kami melalui email di bawah halaman ini.",
      },
    ],
  },
  {
    category: "Akun & Keamanan",
    icon: "lucide:shield-check",
    items: [
      {
        q: "Bagaimana cara mendaftar akun Rotary?",
        a: 'Klik "Daftar" di pojok kanan atas, isi nama lengkap, email, nomor HP, dan kata sandi. Verifikasi email kamu menggunakan kode OTP yang dikirim ke inbox. Setelah terverifikasi, akun siap digunakan.',
      },
      {
        q: "Apa itu Verifikasi Dua Langkah (2FA)?",
        a: "Ini adalah fitur keamanan tambahan yang akan meminta kode rahasia setiap kali kamu masuk (login) dari HP atau komputer baru. Kamu bisa mengaktifkannya di pengaturan akun dan memilih untuk menerima kode via email atau WhatsApp.",
      },
      {
        q: "Saya lupa kata sandi, bagaimana cara membuat yang baru?",
        a: 'Klik "Lupa Kata Sandi" di halaman masuk (login). Masukkan emailmu, lalu ikuti langkah-langkah yang kami kirimkan ke emailmu untuk membuat kata sandi baru.',
      },
      {
        q: "Bagaimana cara menjaga akun saya tetap aman?",
        a: "Aktifkan Verifikasi Dua Langkah (2FA), buat kata sandi yang sulit ditebak, rutin periksa perangkat yang terhubung di halaman Keamanan Akun, dan jangan lupa keluar (logout) jika menggunakan komputer umum. Terakhir, jangan pernah memberikan kode OTP-mu kepada siapa pun!",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative border-b border-[#e4e8ef] bg-linear-to-b from-[#f0f4fa]/50 to-white px-6 pt-16 md:pt-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-end md:gap-12">
              {/* Teks Kiri */}
              <div className="relative z-10 w-full max-w-xl text-center md:pb-20 md:text-left">
                <h1 className="font-open-sauce text-[32px] font-bold leading-tight text-[#171717] md:text-[40px]">
                  Ada yang bisa kami bantu?
                </h1>
                <p className="mt-4 font-open-sauce text-[15.5px] leading-relaxed text-[#5f6370]">
                  Temukan jawaban cepat atas pertanyaan seputar marketplace, deal, lokasi penampung limbah, dan keamanan akun Rotary.
                </p>
              </div>

              {/* Ilustrasi Kanan (Duduk di border bawah) */}
              <div className="relative z-10 w-44 shrink-0 translate-y-4.5 md:w-56 md:translate-y-6">
                <Image
                  src="/illustrations/paw.svg"
                  alt="Rotary Paw"
                  width={224}
                  height={224}
                  className="h-auto w-full object-contain pointer-events-none select-none"
                  draggable={false}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Layout with Sidebar */}
        <div className="mx-auto max-w-5xl px-6 py-12 lg:flex lg:gap-12 lg:py-14">
          {/* Sidebar Nav */}
          <aside className="hidden lg:block lg:w-64 lg:shrink-0">
            <SidebarNav
              sections={faqs.map(f => ({
                id: f.category.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, ""),
                icon: f.icon,
                title: f.category
              }))}
              title="Kategori Bantuan"
            />
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <div className="flex flex-col gap-14">
              {faqs.map((section) => (
                <div
                  key={section.category}
                  id={section.category.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "")}
                >
                  {/* Section Header */}
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#17458f]">
                      <Icon icon={section.icon} width={18} height={18} className="text-white" aria-hidden="true" />
                    </span>
                    <h2 className="font-open-sauce text-[18px] font-bold text-[#171717]">
                      {section.category}
                    </h2>
                  </div>

                  {/* FAQ Items */}
                  <div className="flex flex-col divide-y divide-[#e4e8ef] rounded-2xl border border-[#e4e8ef] overflow-hidden">
                    {section.items.map((item, idx) => (
                      <details key={idx} className="group bg-white">
                        <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-6 py-5 font-open-sauce text-[14px] font-semibold text-[#171717] transition-colors hover:bg-[#f8fafc]">
                          <span>{item.q}</span>
                          <Icon
                            icon="lucide:chevron-down"
                            width={17}
                            height={17}
                            className="shrink-0 text-[#5f6370] transition-transform duration-300 group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </summary>
                        <div className="border-t border-[#e4e8ef] bg-[#f8fafc] px-6 py-5">
                          <p className="font-open-sauce text-[13.5px] leading-[1.7] text-[#5f6370]">
                            {item.a}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <HelpCTA />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
