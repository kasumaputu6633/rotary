"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { formatListingMode, type ListingCardData } from "@/lib/listing-format";

type ActiveTab = "detail" | "important";

export default function ProductInfoTabs({ product }: { product: ListingCardData }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("detail");

  return (
    <div className="mt-7 border-t border-[#bfc7d4]">
      <div className="grid grid-cols-2 border-b border-[#e5e7eb] font-poppins text-[13px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("detail")}
          className={`py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] ${
            activeTab === "detail"
              ? "border-b-2 border-[#f7a81b] text-[#f7a81b]"
              : "text-black hover:bg-[#f4f6f8] hover:text-[#17458f]"
          }`}
          aria-pressed={activeTab === "detail"}
        >
          Detail Barang
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("important")}
          className={`py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] ${
            activeTab === "important"
              ? "border-b-2 border-[#f7a81b] text-[#f7a81b]"
              : "text-black hover:bg-[#f4f6f8] hover:text-[#17458f]"
          }`}
          aria-pressed={activeTab === "important"}
        >
          Info Penting
        </button>
      </div>

      {activeTab === "detail" ? (
        <dl className="mt-4 grid gap-3 font-poppins text-[13px]">
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <dt className="text-[#8f8a8a]">Kondisi</dt>
            <dd className="text-black">{product.condition}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <dt className="text-[#8f8a8a]">Kategori</dt>
            <dd className="font-semibold text-[#f7a81b]">{product.category}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <dt className="text-[#8f8a8a]">Mode</dt>
            <dd className="text-black">{formatListingMode(product.mode)}</dd>
          </div>
          {product.subcategory && (
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <dt className="text-[#8f8a8a]">Subkategori</dt>
              <dd className="text-black">{product.subcategory}</dd>
            </div>
          )}
          {product.handoverOptions && product.handoverOptions.length > 0 && (
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <dt className="text-[#8f8a8a]">Serah Terima</dt>
              <dd className="flex flex-wrap gap-1.5">
                {product.handoverOptions.map((option) => (
                  <span key={option} className="rounded-full bg-[#eef6ff] px-2 py-0.5 text-[11px] font-semibold text-[#17458f]">
                    {option}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <div className="mt-4 grid gap-3 font-poppins text-[13px] text-black">
          {[
            "Pastikan kondisi barang sudah sesuai sebelum membuat kesepakatan.",
            "Gunakan fitur chat untuk menyepakati titik temu dan pengiriman.",
            "Semua deal dilakukan langsung antar pengguna di luar aplikasi.",
          ].map((info) => (
            <div key={info} className="flex gap-2 rounded-lg bg-[#f8fafc] p-3">
              <Icon icon="lucide:info" width={16} height={16} className="mt-0.5 shrink-0 text-[#17458f]" aria-hidden="true" />
              <p>{info}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
