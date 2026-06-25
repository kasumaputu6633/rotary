"use client";

import { Icon } from "@iconify/react";
import { toggleFavoriteListingAction } from "@/app/account/actions";
import { formatListingMode, formatPrice, type ListingCardData } from "@/lib/listing-format";
import ProductContactActions from "./ProductContactActions";

type ProductActionCardProps = {
  imageUrl?: string | null;
  product: ListingCardData;
  publicLocation: string;
  sellerWhatsapp?: string | null;
};

export default function ProductActionCard({
  imageUrl,
  product,
  publicLocation,
  sellerWhatsapp,
}: ProductActionCardProps) {
  const handoverOptions = product.handoverOptions ?? [];

  return (
    <div className="rounded-lg border border-[#d8deea] bg-white p-4 font-poppins shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <h2 className="text-[15px] font-semibold text-black">
        {product.status === "reserved" ? "Informasi Barang" : "Hubungi Pemilik"}
      </h2>

      <div className="mt-4 flex gap-3 border-b border-[#edf0f5] pb-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#e5e7eb] bg-[#f4f6f8]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[#9aa7b8]">
              <Icon icon="lucide:image" width={20} height={20} aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-black">{product.title}</p>
          <span className="mt-1.5 inline-flex items-center rounded-full bg-[#eef6ff] px-2 py-0.5 text-[10px] font-semibold text-[#17458f]">
            {formatListingMode(product.mode)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium text-[#6b7280]">Harga</p>
        <p className="mt-1 text-[24px] font-bold leading-none text-black">{formatPrice(product.price, product.mode)}</p>
      </div>

      <div className="mt-4 grid gap-2 border-b border-[#edf0f5] pb-4 text-[12px] text-[#4b5563]">
        <div className="flex min-w-0 items-center gap-2">
          <Icon icon="lucide:map-pin" width={15} height={15} className="shrink-0 text-[#17458f]" aria-hidden="true" />
          <span className="truncate font-semibold text-black">{publicLocation}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Icon icon="lucide:badge-check" width={15} height={15} className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
          <span className="truncate">{product.condition}</span>
        </div>
        {handoverOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {handoverOptions.map((option) => (
              <span key={option} className="rounded-full bg-[#fff7e8] px-2 py-0.5 text-[11px] font-semibold text-[#17458f]">
                {option}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8edf4] text-[#6b7280]">
          {product.sellerAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.sellerAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon icon="lucide:user" width={19} height={19} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-[#6b7280]">Informasi Pemilik</p>
          <p className="truncate text-[13px] font-semibold text-black">{product.sellerName ?? "Pengguna Rotary"}</p>
        </div>
      </div>

      <ProductContactActions product={product} sellerWhatsapp={sellerWhatsapp} />

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#edf0f5] pt-3">
        <form action={toggleFavoriteListingAction.bind(null, product.id, product.slug)}>
          <button
            type="submit"
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#d8deea] text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
          >
            <Icon icon="lucide:heart" width={15} height={15} className={product.isFavorite ? "fill-current text-[#ef476f]" : ""} aria-hidden="true" />
            {product.isFavorite ? "Tersimpan" : "Favorit"}
          </button>
        </form>
        <button
          type="button"
          className="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#d8deea] text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
        >
          <Icon icon="lucide:share-2" width={15} height={15} aria-hidden="true" />
          Bagikan
        </button>
      </div>
    </div>
  );
}
