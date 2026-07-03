import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <main
      data-not-found
      className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center"
    >
      <div className="w-full max-w-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shrug.svg"
          alt="Halaman tidak ditemukan (Source by Storyset)"
          className="mx-auto h-auto w-full"
        />
      </div>

      <h1 className="mt-2 font-open-sauce text-[26px] font-bold leading-tight text-[#17458f] md:text-[32px]">
        Sepertinya kamu tersesat
      </h1>
      <p className="mt-3 max-w-md font-open-sauce text-[14px] leading-relaxed text-[#5f6370]">
        Halaman yang kamu cari nggak ketemu, mungkin sudah dipindahkan atau
        tautannya keliru. Tenang, masih banyak barang bagus yang menunggu. Yuk,
        balik lewat sini.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#f7a81b] to-[#e89a14] px-5 font-open-sauce text-[13px] font-semibold text-white shadow-md shadow-[#f7a81b]/15 transition-transform hover:scale-[1.02]"
        >
          <Icon icon="lucide:house" width={17} height={17} aria-hidden="true" />
          Kembali ke Beranda
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] px-5 font-open-sauce text-[13px] font-semibold text-[#17458f] transition-colors hover:border-[#17458f] hover:bg-[#eef6ff]"
        >
          <Icon icon="lucide:layout-grid" width={17} height={17} aria-hidden="true" />
          Jelajahi Marketplace
        </Link>
      </div>
    </main>
  );
}
