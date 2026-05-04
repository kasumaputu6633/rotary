"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import type { ProductSummary } from "@/app/_data/products";

function ProductPlaceholder({
  product,
  compact = false,
  modal = false,
  index = 0,
}: {
  product: ProductSummary;
  compact?: boolean;
  modal?: boolean;
  index?: number;
}) {
  const icon = ["lucide:image", "lucide:package-open", "lucide:camera", "lucide:box"][index % 4];
  const sizeClass = compact
    ? "aspect-square text-[24px]"
    : modal
      ? "h-[min(68vh,620px)] min-h-[300px] text-[64px]"
      : "aspect-square text-[56px]";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] text-[#9aa7b8] shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${product.tone} ${sizeClass}`}
    >
      {!compact && (
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-poppins text-[11px] font-semibold text-[#17458f] shadow-sm">
          {product.status}
        </span>
      )}
      <span className={`${compact ? "h-12 w-12" : modal ? "h-28 w-28" : "h-24 w-24"} flex items-center justify-center rounded-full bg-white/75`}>
        <Icon icon={icon} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-poppins text-[11px] font-semibold text-[#17458f] shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_18px_rgba(15,23,42,0.14)]">
          <Icon icon="lucide:zoom-in" width={14} height={14} aria-hidden="true" />
          Lihat Detail
        </span>
      )}
    </div>
  );
}

export default function ProductGallery({ product }: { product: ProductSummary }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group block w-full rounded-lg text-left transition-shadow hover:shadow-[0_18px_34px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
          aria-label="Perbesar gambar produk"
        >
          <div className="transition-transform duration-300 group-hover:scale-[1.01]">
            <ProductPlaceholder product={product} index={activeIndex} />
          </div>
        </button>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${index === activeIndex ? "ring-2 ring-[#f7a81b] shadow-[0_8px_18px_rgba(247,168,27,0.18)]" : ""
                }`}
              aria-label={`Pilih gambar produk ${index + 1} sebagai preview utama`}
            >
              <ProductPlaceholder product={product} compact index={index} />
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div
          className="modal-backdrop-enter fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Preview gambar produk"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-panel-enter relative max-h-[calc(100vh-32px)] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sticky left-full top-0 z-20 -mb-9 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#555] hover:bg-[#f7a81b] shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:text-[#17458f] hover:shadow-[0_10px_22px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
              aria-label="Tutup preview gambar"
            >
              <Icon icon="lucide:x" width={18} height={18} aria-hidden="true" />
            </button>

            <div className="grid gap-4 md:grid-cols-[1fr_120px]">
              <ProductPlaceholder product={product} index={activeIndex} modal />

              <div className="grid grid-cols-4 gap-2 md:grid-cols-1">
                {Array.from({ length: 4 }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${index === activeIndex ? "ring-2 ring-[#f7a81b] shadow-[0_8px_18px_rgba(247,168,27,0.18)]" : ""
                      }`}
                    aria-label={`Pilih gambar produk ${index + 1}`}
                  >
                    <ProductPlaceholder product={product} compact index={index} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 font-poppins">
              <div>
                <p className="text-[14px] font-semibold text-black">{product.title}</p>
                <p className="mt-1 text-[12px] text-[#6b7280]">Preview gambar {activeIndex + 1} dari 4</p>
              </div>
              <p className="text-[16px] font-semibold text-[#17458f]">{product.price}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
