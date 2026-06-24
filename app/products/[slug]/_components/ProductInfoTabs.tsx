"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { formatListingMode, type ListingCardData } from "@/lib/listing-format";

type ActiveTab = "detail" | "important";

export default function ProductInfoTabs({ product }: { product: ListingCardData }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("detail");

  return (
    <div className="mt-6 border-t border-[#e5e7eb]">
      <div className="flex gap-10 border-b border-[#edf0f5] font-poppins text-[13px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("detail")}
          className={`border-b-2 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] ${
            activeTab === "detail"
              ? "border-[#f7a81b] text-[#17458f]"
              : "border-transparent text-[#6b7280] hover:text-[#17458f]"
          }`}
          aria-pressed={activeTab === "detail"}
        >
          Detail Barang
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("important")}
          className={`border-b-2 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] ${
            activeTab === "important"
              ? "border-[#f7a81b] text-[#17458f]"
              : "border-transparent text-[#6b7280] hover:text-[#17458f]"
          }`}
          aria-pressed={activeTab === "important"}
        >
          Info Penting
        </button>
      </div>

      {activeTab === "detail" ? (
        <dl className="mt-4 grid gap-2.5 font-poppins text-[13px]">
          <div className="grid grid-cols-[112px_1fr] gap-3">
            <dt className="text-[#6b7280]">Kondisi</dt>
            <dd className="font-medium text-black">{product.condition}</dd>
          </div>
          <div className="grid grid-cols-[112px_1fr] gap-3">
            <dt className="text-[#6b7280]">Kategori</dt>
            <dd className="font-semibold text-[#17458f]">{product.category}</dd>
          </div>
          <div className="grid grid-cols-[112px_1fr] gap-3">
            <dt className="text-[#6b7280]">Mode</dt>
            <dd className="font-medium text-black">{formatListingMode(product.mode)}</dd>
          </div>
          {product.subcategory && (
            <div className="grid grid-cols-[112px_1fr] gap-3">
              <dt className="text-[#6b7280]">Subkategori</dt>
              <dd className="font-medium text-black">{product.subcategory}</dd>
            </div>
          )}
          {product.handoverOptions && product.handoverOptions.length > 0 && (
            <div className="grid grid-cols-[112px_1fr] gap-3">
              <dt className="text-[#6b7280]">Serah Terima</dt>
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
        <div className="mt-4 grid gap-2.5 font-poppins text-[13px] text-black">
          {[
            "Pastikan kondisi barang sudah sesuai sebelum membuat kesepakatan.",
            "Gunakan fitur chat untuk menyepakati titik temu dan pengiriman.",
            "Semua deal dilakukan langsung antar pengguna di luar aplikasi.",
          ].map((info) => (
            <div key={info} className="flex gap-2 rounded-lg border border-[#edf0f5] bg-white p-3">
              <Icon icon="lucide:info" width={16} height={16} className="mt-0.5 shrink-0 text-[#17458f]" aria-hidden="true" />
              <p>{info}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
