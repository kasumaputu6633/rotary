"use client";

import { Icon } from "@iconify/react";
import type { ProductSummary } from "@/app/_data/products";

export default function ProductContactActions({ product }: { product: ProductSummary }) {
  const isSale = product.isSale;

  function openChat() {
    window.dispatchEvent(new CustomEvent("rotaryOpenChat"));
  }

  return (
    <div className="mt-5">
      <div className="grid gap-2">
        <button
          type="button"
          onClick={openChat}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f7a81b] font-poppins text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(247,168,27,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
        >
          <Icon icon="lucide:messages-square" width={16} height={16} aria-hidden="true" />
          {isSale ? "Chat Penjual" : "Chat Pemilik"}
        </button>

        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#f7a81b] font-poppins text-[13px] font-semibold text-[#17458f] transition-all hover:-translate-y-0.5 hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
        >
          <Icon icon={isSale ? "lucide:badge-dollar-sign" : "lucide:hand-heart"} width={16} height={16} aria-hidden="true" />
          {isSale ? "Tawar Barang" : "Ajukan Ambil"}
        </button>
      </div>

      {isSale ? (
        <>
          <p className="mt-6 text-center font-poppins text-[11px] font-semibold text-[#9ca3af]">
            Masuk untuk membuat penawaran
          </p>

          <div className="mt-5 flex h-10 overflow-hidden rounded-lg border border-[#bfc7d4] font-poppins text-[13px]">
            <span className="flex items-center border-r border-[#e5e7eb] px-3 font-semibold text-black">Rp</span>
            <input className="min-w-0 flex-1 px-3 outline-none focus:bg-[#fffdf8]" placeholder="0" />
            <button type="button" className="w-24 bg-[#f7a81b] font-semibold text-white transition-colors hover:bg-[#e89a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b]">
              Tawar
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-lg border border-[#f7a81b]/40 bg-[#fff7e8] p-3 font-poppins">
          <div className="flex gap-2">
            <Icon icon="lucide:info" width={16} height={16} className="mt-0.5 shrink-0 text-[#f7a81b]" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-[#5f6370]">
              Barang ini didonasikan. Chat pemilik untuk menyepakati jadwal ambil, titik temu, atau penjemputan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
