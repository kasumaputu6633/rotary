"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { formatListingMode, type ListingCardData } from "@/lib/listing-format";

function ImageFrame({
  product,
  imageUrl,
  compact = false,
  modal = false,
}: {
  product: ListingCardData;
  imageUrl?: string | null;
  compact?: boolean;
  modal?: boolean;
}) {
  const sizeClass = compact
    ? "aspect-square text-[24px]"
    : modal
      ? "h-[min(68vh,620px)] min-h-[300px] text-[64px]"
      : "aspect-square text-[56px]";

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f4f6f8] text-[#9aa7b8] shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${sizeClass}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
      ) : (
        <span className={`${compact ? "h-12 w-12" : modal ? "h-28 w-28" : "h-24 w-24"} flex items-center justify-center rounded-full bg-white/75`}>
          <Icon icon="lucide:image" aria-hidden="true" />
        </span>
      )}
      {!compact && (
        <>
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-poppins text-[11px] font-semibold text-[#17458f] shadow-sm">
            {formatListingMode(product.mode)}
          </span>
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-poppins text-[11px] font-semibold text-[#17458f] shadow-sm">
            <Icon icon="lucide:zoom-in" width={14} height={14} aria-hidden="true" />
            Lihat Detail
          </span>
        </>
      )}
    </div>
  );
}

export default function ProductGallery({
  product,
  images,
}: {
  product: ListingCardData;
  images: string[];
}) {
  const galleryImages = useMemo(() => (images.length > 0 ? images : [null]), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const activeImage = galleryImages[activeIndex] ?? null;

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
            <ImageFrame product={product} imageUrl={activeImage} />
          </div>
        </button>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {galleryImages.slice(0, 4).map((imageUrl, index) => (
            <button
              key={`${imageUrl ?? "placeholder"}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${index === activeIndex ? "ring-2 ring-[#f7a81b] shadow-[0_8px_18px_rgba(247,168,27,0.18)]" : ""}`}
              aria-label={`Pilih gambar produk ${index + 1} sebagai preview utama`}
            >
              <ImageFrame product={product} imageUrl={imageUrl} compact />
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
              className="sticky left-full top-0 z-20 -mb-9 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#555] shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#f7a81b] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
              aria-label="Tutup preview gambar"
            >
              <Icon icon="lucide:x" width={18} height={18} aria-hidden="true" />
            </button>

            <ImageFrame product={product} imageUrl={activeImage} modal />
          </div>
        </div>
      )}
    </>
  );
}
