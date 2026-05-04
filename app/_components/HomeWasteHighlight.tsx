import { Icon } from "@iconify/react";
import Link from "next/link";

export default function HomeWasteHighlight() {
  return (
    <section className="bg-white py-6" aria-labelledby="waste-highlight-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="rounded-lg border border-[#e1e5ec] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:map-pinned" width={25} height={25} className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
              <h2 id="waste-highlight-heading" className="font-poppins text-[24px] font-semibold leading-tight text-black md:text-[28px]">
                Lokasi Penampung Limbah
              </h2>
            </div>

            <p className="mt-2 max-w-3xl font-poppins text-[13px] leading-relaxed text-[#6b7280] md:text-[14px]">
              Cek tempat yang menerima material tertentu sebelum barang berakhir jadi sampah.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#edf0f5] pt-4 md:flex-row md:items-center md:justify-between">
            <p className="font-poppins text-[12px] leading-relaxed text-[#8a95a6]">
              Contoh material: plastik, kaca, kertas, organik, residu, dan lainnya.
            </p>
            <Link
              href="/waste"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f7a81b] px-5 font-poppins text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(247,168,27,0.22)] transition-colors hover:bg-[#e89a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-4"
            >
              Buka Direktori Lokasi
              <Icon icon="lucide:arrow-right" width={15} height={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
