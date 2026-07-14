import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import SidebarNav from "@/app/_components/SidebarNav";
import HelpCTA from "@/app/_components/HelpCTA";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Rotary",
  description:
    "Baca syarat dan ketentuan penggunaan platform Rotary — marketplace barang bekas dan direktori lokasi penampung limbah.",
};

const lastUpdated = "14 Juli 2026";

const sections = [
  {
    id: "penerimaan",
    icon: "lucide:file-check",
    title: "Penerimaan Syarat",
    paras: [
      'Dengan mengakses dan menggunakan platform Rotary ("Layanan"), kamu menyatakan bahwa kamu telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini ("S&K"). Jika kamu tidak setuju, harap hentikan penggunaan Layanan.',
      "Rotary adalah platform marketplace barang bekas dan direktori lokasi penampung limbah yang dikembangkan sebagai proyek akademik di bawah naungan Politeknik Negeri Bali (PNB). Layanan ini ditujukan untuk mendukung sirkuler ekonomi di Bali.",
      "Kami dapat memperbarui S&K ini sewaktu-waktu. Perubahan signifikan akan dikomunikasikan melalui notifikasi dalam platform atau email. Penggunaan Layanan setelah pembaruan berlaku dianggap sebagai persetujuan terhadap S&K yang baru.",
    ],
  },
  {
    id: "kelayakan-akun",
    icon: "lucide:user-circle",
    title: "Kelayakan & Akun Pengguna",
    paras: [
      "Kamu harus berusia minimal 17 tahun atau memiliki izin dari orang tua/wali untuk menggunakan Rotary. Dengan mendaftar, kamu menyatakan bahwa informasi yang kamu berikan adalah benar dan sesuai.",
      "Untuk menjaga keadilan, setiap pengguna hanya boleh memiliki satu akun. Membuat banyak akun, akun palsu, atau menggunakan data orang lain tanpa izin tidak diperbolehkan.",
      "Tolong jaga kerahasiaan akunmu (seperti kata sandi dan kode OTP). Kamu bertanggung jawab atas semua aktivitas di akunmu. Beri tahu kami jika ada yang mengakses akunmu tanpa izin.",
      "Rotary berhak menutup sementara atau menghapus akun yang melanggar aturan, melakukan penipuan, atau merugikan pengguna lain.",
    ],
  },
  {
    id: "marketplace",
    icon: "lucide:store",
    title: "Aturan Marketplace",
    paras: [
      "Kamu dapat mempublikasikan listing barang bekas dalam dua mode: penjualan (dengan harga) atau donasi (gratis). Semua barang yang dipasang harus merupakan barang yang kamu miliki atau yang berhak kamu jual/donasikan.",
      "Barang yang dilarang untuk dipasarkan meliputi: narkotika dan obat-obatan terlarang, senjata api dan senjata tajam (tanpa izin yang sah), konten atau barang yang melanggar hukum Indonesia, barang palsu atau hasil curian, konten dewasa atau pornografi, dan hewan dilindungi.",
      "Kamu bertanggung jawab penuh atas keakuratan deskripsi, kondisi, dan foto barang yang kamu pasarkan. Menyesatkan pembeli secara sengaja merupakan pelanggaran serius yang dapat berakibat penghapusan akun.",
      "Rotary berhak menghapus listing yang dianggap tidak sesuai, menyesatkan, atau melanggar S&K ini kapan saja tanpa pemberitahuan. Tim moderasi kami meninjau listing yang dilaporkan dalam waktu 1×24 jam.",
    ],
  },
  {
    id: "deal-transaksi",
    icon: "lucide:handshake",
    title: "Deal & Transaksi",
    content_list: [
      {
        title: "Rotary Bukan Perantara Pembayaran",
        text: "Rotary adalah platform untuk mempertemukan penjual dan pembeli. Rotary tidak memfasilitasi, tidak menjamin, dan tidak bertanggung jawab atas transaksi keuangan yang terjadi antara pengguna. Semua pembayaran dan serah terima barang dilakukan di luar platform atas kesepakatan kedua belah pihak.",
      },
      {
        title: "Tanggung Jawab Penjual",
        text: "Penjual wajib memastikan barang dalam kondisi yang sesuai dengan deskripsi, jujur dalam proses negosiasi, dan memenuhi kesepakatan yang telah dibuat. Membatalkan deal berulang kali tanpa alasan yang valid dapat berakibat pembatasan akun.",
      },
      {
        title: "Tanggung Jawab Pembeli",
        text: "Pembeli wajib melakukan verifikasi kondisi barang secara langsung sebelum atau saat serah terima. Segala perselisihan pasca-transaksi yang tidak berkaitan dengan penipuan yang dilaporkan bukan merupakan tanggung jawab Rotary.",
      },
      {
        title: "Mekanisme Sengketa",
        text: "Jika terjadi perselisihan, pengguna dianjurkan menyelesaikannya secara musyawarah terlebih dahulu. Jika tidak berhasil, gunakan fitur Laporkan yang tersedia untuk diproses oleh tim moderasi Rotary.",
      },
    ],
  },
  {
    id: "konten-pengguna",
    icon: "lucide:image",
    title: "Konten yang Kamu Unggah",
    paras: [
      "Kamu mempertahankan hak kepemilikan atas semua konten yang kamu unggah ke Rotary (foto listing, pesan, deskripsi). Dengan mengunggah konten, kamu memberikan Rotary lisensi non-eksklusif, bebas royalti, untuk menampilkan dan menggunakan konten tersebut semata-mata untuk operasional dan promosi layanan.",
      "Kamu menjamin bahwa konten yang kamu unggah tidak melanggar hak cipta, merek dagang, atau hak kekayaan intelektual pihak lain. Kamu juga menjamin bahwa konten tidak mengandung materi ilegal, menyinggung, atau diskriminatif.",
      "Rotary berhak menghapus konten yang melanggar S&K ini. Kami juga dapat menyimpan salinan konten yang dihapus untuk keperluan investigasi dan kepatuhan hukum.",
    ],
  },
  {
    id: "lokasi-penampung",
    icon: "lucide:map",
    title: "Direktori Lokasi Penampung Limbah",
    paras: [
      "Data lokasi penampung limbah di Rotary bersumber dari informasi publik dan kontribusi komunitas. Rotary berusaha menjaga keakuratan data, namun tidak menjamin kelengkapan, ketepatan waktu, atau keakuratan informasi seperti jam operasional dan jenis sampah yang diterima.",
      "Pengguna dianjurkan untuk mengonfirmasi langsung ke lokasi penampung sebelum mengunjungi, terutama terkait jam operasional dan jenis sampah yang dapat diterima.",
      "Jika kamu menemukan informasi yang tidak akurat, silakan laporkan melalui fitur pelaporan yang tersedia atau hubungi tim kami.",
    ],
  },
  {
    id: "batasan-tanggung-jawab",
    icon: "lucide:alert-triangle",
    title: "Batasan Tanggung Jawab",
    paras: [
      "Kami selalu berusaha memberikan pengalaman terbaik, namun layanan Rotary disediakan apa adanya. Kami tidak bisa menjamin aplikasi selalu bebas dari gangguan, penundaan, atau kendala teknis lainnya.",
      "Rotary tidak dapat dimintai pertanggungjawaban atas kerugian dari transaksimu dengan pengguna lain, isi barang yang dijual, atau hal-hal tak terduga (seperti bencana alam) yang mengganggu layanan.",
      "Karena Rotary saat ini adalah layanan gratis yang dibuat untuk mendukung komunitas, kami tidak dapat memberikan kompensasi finansial untuk kendala atau kerugian yang mungkin terjadi selama penggunaan aplikasi.",
    ],
  },
  {
    id: "pemutusan",
    icon: "lucide:x-circle",
    title: "Pemutusan Layanan",
    paras: [
      "Kamu dapat berhenti menggunakan Rotary kapan saja dan mengajukan penghapusan akun melalui pengaturan atau dengan menghubungi support kami.",
      "Rotary berhak menangguhkan atau mengakhiri aksesmu ke layanan tanpa pemberitahuan jika terjadi pelanggaran S&K, aktivitas penipuan, atau tindakan yang merugikan pengguna atau platform lainnya.",
      "Setelah pemutusan, ketentuan mengenai konten pengguna, batasan tanggung jawab, dan penyelesaian sengketa tetap berlaku.",
    ],
  },
  {
    id: "hukum-berlaku",
    icon: "lucide:landmark",
    title: "Hukum yang Berlaku",
    paras: [
      "S&K ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di Negara Kesatuan Republik Indonesia, termasuk namun tidak terbatas pada Undang-Undang Informasi dan Transaksi Elektronik (UU ITE) dan peraturan perlindungan konsumen yang berlaku.",
      "Setiap sengketa yang timbul dari penggunaan Layanan ini akan diselesaikan melalui musyawarah mufakat. Jika musyawarah tidak berhasil, penyelesaian akan dilakukan melalui Pengadilan Negeri setempat sesuai dengan wilayah hukum yang berlaku.",
    ],
  },
];

export default function TermsPage() {
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
                  Syarat & Ketentuan Penggunaan
                </h1>
                <p className="mt-4 font-open-sauce text-[15.5px] leading-relaxed text-[#5f6370]">
                  Harap baca dokumen ini dengan seksama sebelum menggunakan layanan Rotary. Penggunaan layanan berarti kamu menyetujui seluruh ketentuan berikut.
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
            {/* Intro Banner */}
            <div className="mb-12 flex gap-4 rounded-2xl border border-[#f7a81b]/30 bg-[#fff8ed] p-5">
              <Icon icon="lucide:info" width={20} height={20} className="mt-0.5 shrink-0 text-[#f7a81b]" aria-hidden="true" />
              <p className="font-open-sauce text-[13.5px] leading-[1.75] text-[#6b4f1a]">
                Dokumen ini merupakan perjanjian hukum antara kamu ("Pengguna") dan platform Rotary. Dengan mendaftar atau menggunakan layanan, kamu dianggap telah membaca dan menyetujui seluruh ketentuan di bawah ini.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {sections.map((section, sIdx) => (
                <section key={section.id} id={section.id}>
                  {/* Header */}
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17458f]">
                      <Icon icon={section.icon} width={19} height={19} className="text-white" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="font-open-sauce text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                        Pasal {sIdx + 1}
                      </span>
                      <h2 className="font-open-sauce text-[18px] font-bold leading-tight text-[#171717]">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {/* Paragraphs */}
                  {"paras" in section && section.paras && (
                    <div className="flex flex-col gap-4 rounded-xl border border-[#e4e8ef] bg-[#f8fafc] p-6">
                      {section.paras.map((para, idx) => (
                        <p key={idx} className="font-open-sauce text-[13.5px] leading-[1.8] text-[#5f6370]">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Content List */}
                  {"content_list" in section && section.content_list && (
                    <div className="flex flex-col gap-4">
                      {section.content_list.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-[#e4e8ef] bg-[#f8fafc] p-5">
                          <h3 className="font-open-sauce text-[13px] font-bold text-[#17458f]">
                            {item.title}
                          </h3>
                          <p className="mt-2 font-open-sauce text-[13.5px] leading-[1.75] text-[#5f6370]">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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
