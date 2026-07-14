import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import SidebarNav from "@/app/_components/SidebarNav";
import HelpCTA from "@/app/_components/HelpCTA";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Rotary",
  description:
    "Pelajari bagaimana Rotary mengumpulkan, menggunakan, dan melindungi data pribadi pengguna sesuai peraturan perlindungan data yang berlaku di Indonesia.",
};

const lastUpdated = "14 Juli 2026";

const sections = [
  {
    id: "pengumpulan-data",
    icon: "lucide:database",
    title: "Data yang Kami Kumpulkan",
    content: [
      {
        subtitle: "Data yang Kamu Berikan Secara Langsung",
        text: "Saat mendaftar dan menggunakan Rotary, kami mengumpulkan informasi yang kamu berikan secara aktif, meliputi: nama lengkap, alamat email, nomor telepon (WhatsApp), kata sandi yang telah dienkripsi, foto profil (opsional), nama toko/lapak, serta alamat atau koordinat lokasi yang kamu masukkan pada listing.",
      },
      {
        subtitle: "Data yang Dikumpulkan Otomatis",
        text: "Kami mengumpulkan data secara otomatis saat kamu menggunakan layanan, seperti: informasi perangkat yang kamu gunakan (jenis HP atau komputer), halaman yang kamu kunjungi, waktu akses, serta data masuk (login) yang disimpan dengan aman di perambanmu.",
      },
      {
        subtitle: "Data dari Interaksi Pengguna",
        text: "Data yang dihasilkan dari interaksimu di platform meliputi: pesan chat antar pengguna, listing yang dibuat atau difavoritkan, riwayat deal dan transaksi, lokasi penampung yang dikunjungi atau disimpan, serta laporan dan ulasan yang kamu kirimkan.",
      },
    ],
  },
  {
    id: "penggunaan-data",
    icon: "lucide:settings-2",
    title: "Cara Kami Menggunakan Data",
    content: [
      {
        subtitle: "Operasional Layanan",
        text: "Data digunakan untuk menjalankan fitur inti Rotary: autentikasi akun, menampilkan dan mencocokkan listing, memproses deal antara penjual dan pembeli, serta mengoperasikan sistem notifikasi (email dan WhatsApp).",
      },
      {
        subtitle: "Keamanan dan Pencegahan Penyalahgunaan",
        text: "Kami menganalisis pola penggunaan untuk mendeteksi aktivitas mencurigakan, mencegah penipuan, dan merespons laporan pelanggaran. Data perangkat digunakan untuk memvalidasi sesi dan mengirimkan peringatan keamanan saat ada login dari perangkat baru.",
      },
      {
        subtitle: "Peningkatan Layanan",
        text: "Data agregat yang telah dianonimkan digunakan untuk memahami perilaku pengguna, mengidentifikasi fitur yang kurang optimal, dan memperbaiki kualitas layanan secara keseluruhan. Kami tidak membuat profil individual berbasis preferensi untuk tujuan iklan.",
      },
      {
        subtitle: "Komunikasi",
        text: "Kami menggunakan email dan WhatsApp untuk mengirim kode OTP, notifikasi transaksi (deal baru, perubahan harga, konfirmasi serah terima), dan informasi kebijakan penting. Kamu dapat mengatur preferensi notifikasi melalui halaman Akun.",
      },
    ],
  },
  {
    id: "berbagi-data",
    icon: "lucide:share-2",
    title: "Berbagi Data dengan Pihak Ketiga",
    content: [
      {
        subtitle: "Layanan Pihak Ketiga",
        text: "Kami bekerja sama dengan penyedia layanan terpercaya untuk mendukung berjalannya aplikasi (seperti penyimpanan foto barang, layanan peta, dan pengiriman pesan WhatsApp/Email). Pihak ketiga ini hanya memproses datamu sesuai kebutuhan aplikasi dan terikat janji kerahasiaan.",
      },
      {
        subtitle: "Antar Pengguna",
        text: "Profil publik (nama, nama toko, foto) dan konten listing kamu terlihat oleh pengguna lain. Nomor WhatsApp hanya dapat dilihat oleh pihak yang sudah berada dalam proses deal aktif, dan hanya jika kamu mengaktifkan opsi kontak via WhatsApp.",
      },
      {
        subtitle: "Kewajiban Hukum",
        text: "Kami dapat mengungkapkan data kepada otoritas yang berwenang apabila diwajibkan oleh hukum yang berlaku di Indonesia, perintah pengadilan, atau dalam rangka melindungi hak, properti, dan keselamatan pengguna Rotary.",
      },
      {
        subtitle: "Tidak Dijual",
        text: "Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi penggunamu kepada pihak ketiga untuk tujuan komersial.",
      },
    ],
  },
  {
    id: "keamanan-data",
    icon: "lucide:lock",
    title: "Keamanan Data",
    content: [
      {
        subtitle: "Pengamanan dan Penyimpanan",
        text: "Kata sandi dan informasi pentingmu kami simpan menggunakan teknologi pengacakan (enkripsi) agar tidak bisa dibaca oleh siapa pun, bahkan oleh tim kami. Semua komunikasi datamu dengan aplikasi juga dilindungi oleh jalur yang aman.",
      },
      {
        subtitle: "Pembatasan Akses",
        text: "Hanya tim inti yang berwenang yang dapat mengakses data sistem kami. Kami juga menerapkan sistem peran pengguna untuk memastikan bahwa setiap orang hanya bisa melihat data yang sesuai dengan hak aksesnya.",
      },
      {
        subtitle: "Batas Tanggung Jawab",
        text: "Meskipun kami menerapkan praktik keamanan terbaik, tidak ada sistem yang sepenuhnya kebal dari ancaman. Kami menyarankan pengguna untuk mengaktifkan 2FA dan menggunakan kata sandi yang kuat sebagai lapisan perlindungan tambahan.",
      },
    ],
  },
  {
    id: "hak-pengguna",
    icon: "lucide:user-check",
    title: "Hak-Hak Pengguna",
    content: [
      {
        subtitle: "Akses dan Portabilitas",
        text: "Kamu berhak mengakses data pribadi yang kami simpan dan meminta salinan data tersebut dalam format yang dapat dibaca mesin.",
      },
      {
        subtitle: "Koreksi Data",
        text: "Jika data pribadimu tidak akurat atau tidak lengkap, kamu dapat memperbaruinya langsung melalui halaman Pengaturan Akun kapan saja.",
      },
      {
        subtitle: "Penghapusan Akun",
        text: "Kamu dapat mengajukan penghapusan akun dengan menghubungi tim support kami. Penghapusan akan memproses penghapusan data pribadi identifikasimu, kecuali data yang wajib dipertahankan untuk keperluan hukum atau keamanan.",
      },
      {
        subtitle: "Opt-Out Notifikasi",
        text: "Kamu dapat mengelola preferensi notifikasi per kategori (deal, favorit, keamanan, dll.) melalui halaman Notifikasi di pengaturan akun.",
      },
    ],
  },
  {
    id: "cookie",
    icon: "lucide:cookie",
    title: "Penggunaan Cookie",
    content: [
      {
        subtitle: "Cookie untuk Keperluan Login",
        text: 'Kami hanya menggunakan satu "cookie" utama. Cookie ini adalah file kecil yang bertugas mengingat bahwa kamu sudah masuk (login) ke aplikasi, sehingga kamu tidak perlu memasukkan kata sandi terus-menerus.',
      },
      {
        subtitle: "Tidak Ada Pelacakan",
        text: "Kami sama sekali tidak menggunakan cookie pelacak iklan atau alat analitik rumit yang merekam aktivitasmu untuk ditargetkan iklan. Kenyamanan dan privasimu terjaga.",
      },
    ],
  },
];

export default function PrivacyPage() {
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
                  Privasi kamu adalah prioritas kami
                </h1>
                <p className="mt-4 font-open-sauce text-[15.5px] leading-relaxed text-[#5f6370]">
                  Berikut tentang cara kami mengumpulkan, menggunakan, dan melindungi data pribadi kamu.
                </p>
                <p className="mt-6 font-open-sauce text-[12px] font-medium text-[#9ca3af] uppercase tracking-wider">
                  Terakhir diperbarui: {lastUpdated}
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
            <SidebarNav sections={sections} title="Daftar Isi" />
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* Intro */}
            <div className="mb-12 rounded-2xl border border-[#17458f]/15 bg-[#f0f4fa] p-6">
              <p className="font-open-sauce text-[14px] leading-[1.75] text-[#374151]">
                Kebijakan Privasi ini menjelaskan bagaimana <strong>Rotary</strong> ("kami", "platform") mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi kamu saat menggunakan layanan marketplace barang bekas dan direktori lokasi penampung limbah kami. Dengan menggunakan Rotary, kamu menyetujui praktik yang dijelaskan dalam kebijakan ini.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17458f]">
                      <Icon icon={section.icon} width={19} height={19} className="text-white" aria-hidden="true" />
                    </span>
                    <h2 className="font-open-sauce text-[19px] font-bold text-[#171717]">
                      {section.title}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-6">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="rounded-xl border border-[#e4e8ef] bg-[#f8fafc] p-5">
                        <h3 className="font-open-sauce text-[13px] font-bold text-[#17458f]">
                          {item.subtitle}
                        </h3>
                        <p className="mt-2 font-open-sauce text-[13.5px] leading-[1.75] text-[#5f6370]">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Contact */}
            <HelpCTA />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
