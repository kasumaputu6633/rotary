"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import type { ListingCardData } from "@/lib/listing-format";

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
    ? "aspect-square text-[20px]"
    : modal
      ? "h-[min(68vh,620px)] min-h-[300px] text-[64px]"
      : "aspect-square text-[56px]";

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-[#dfe5ee] bg-[#f4f6f8] text-[#9aa7b8] ${compact ? "" : "shadow-[0_4px_16px_rgba(15,23,42,0.06)]"} ${sizeClass}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
      ) : (
        <span className={`${compact ? "h-12 w-12" : modal ? "h-28 w-28" : "h-24 w-24"} flex items-center justify-center rounded-full bg-white/75`}>
          <Icon icon="lucide:image" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

export default function ProductGallery({
  activeIndex,
  product,
  images,
  onActiveIndexChange,
}: {
  activeIndex?: number;
  product: ListingCardData;
  images: string[];
  onActiveIndexChange?: (index: number) => void;
}) {
  const galleryImages = useMemo(() => (images.length > 0 ? images : [null]), [images]);
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = Math.min(activeIndex ?? internalActiveIndex, galleryImages.length - 1);
  const activeImage = galleryImages[selectedIndex] ?? null;

  function handleActiveIndexChange(index: number) {
    if (onActiveIndexChange) {
      onActiveIndexChange(index);
      return;
    }
    setInternalActiveIndex(index);
  }

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
      <div data-product-gallery className="lg:sticky lg:top-[196px] lg:self-start">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group block w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
          aria-label="Perbesar gambar produk"
        >
          <div className="transition-transform duration-300 group-hover:scale-[1.006]">
            <ImageFrame product={product} imageUrl={activeImage} />
          </div>
        </button>

        <div className="mt-3 grid grid-cols-5 gap-2">
          {galleryImages.slice(0, 5).map((imageUrl, index) => (
            <button
              key={`${imageUrl ?? "placeholder"}-${index}`}
              type="button"
              onClick={() => handleActiveIndexChange(index)}
              className={`rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${
                index === selectedIndex ? "ring-2 ring-[#f7a81b] shadow-[0_8px_18px_rgba(247,168,27,0.18)]" : ""
              }`}
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
