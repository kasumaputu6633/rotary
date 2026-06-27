"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import type { ListingCardData } from "@/lib/listing-format";
import { ProductImageZoom } from "@/app/_components/ProductImageZoom";

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
          <div className="overflow-hidden rounded-lg border border-[#dfe5ee] shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
            {activeImage ? (
              <ProductImageZoom src={activeImage} alt={product.title} />
            ) : (
              <ImageFrame product={product} imageUrl={activeImage} />
            )}
          </div>
        </button>

        <div className="mt-3 grid grid-cols-5 gap-2">
          {galleryImages.slice(0, 5).map((imageUrl, index) => (
            <button
              key={`${imageUrl ?? "placeholder"}-${index}`}
              type="button"
              onClick={() => handleActiveIndexChange(index)}
              className={`rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${index === selectedIndex ? "ring-2 ring-[#f7a81b] shadow-[0_8px_18px_rgba(247,168,27,0.18)]" : ""
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
            className="modal-panel-enter relative w-full max-w-5xl overflow-hidden rounded-xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="font-open-sauce text-[20px] font-bold text-black">{product.title}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="shrink-0 text-[#6d7588] transition-colors hover:text-[#31353b] focus-visible:outline-none"
                aria-label="Tutup preview gambar"
              >
                <Icon icon="lucide:x" width={28} height={28} aria-hidden="true" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-8 md:flex-row">
              {/* Left Column (Main Image) */}
              <div className="relative flex-1 flex items-center justify-center rounded-lg min-h-[300px] md:min-h-[500px]">
                {/* Fixed Canvas Container */}
                <div className="relative flex aspect-square w-full max-w-[500px] items-center justify-center bg-transparent shrink-0">
                  {activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeImage}
                      alt={product.title}
                      className="absolute inset-0 h-full w-full object-contain drop-shadow-md"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-400">
                      <Icon icon="lucide:image" width={48} height={48} aria-hidden="true" />
                    </span>
                  )}
                </div>

                {/* Navigation Arrows (Positioned outside the canvas) */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActiveIndexChange(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#6d7588] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors hover:text-[#31353b] md:left-4"
                      aria-label="Gambar sebelumnya"
                    >
                      <Icon icon="lucide:chevron-left" width={28} height={28} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActiveIndexChange((selectedIndex + 1) % galleryImages.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#6d7588] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors hover:text-[#31353b] md:right-4"
                      aria-label="Gambar selanjutnya"
                    >
                      <Icon icon="lucide:chevron-right" width={28} height={28} />
                    </button>
                  </>
                )}
              </div>

              {/* Right Column (Thumbnails) */}
              <div className="w-full md:w-[320px] shrink-0">
                <h3 className="mb-4 font-open-sauce text-[15px] font-bold text-[#31353b]">Gambar Barang</h3>
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl ?? "placeholder"}-${index}`}
                      type="button"
                      onClick={() => handleActiveIndexChange(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${index === selectedIndex
                          ? "border-[#f7a81b]" // Rotary brand color
                          : "border-transparent hover:border-gray-300"
                        }`}
                      aria-label={`Pilih gambar produk ${index + 1}`}
                    >
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt="" className="h-full w-full object-contain" draggable={false} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                          <Icon icon="lucide:image" width={24} height={24} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
