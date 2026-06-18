import { Icon } from "@iconify/react";
import Link from "next/link";
import { toggleFavoriteListingAction } from "@/app/dashboard/actions";
import { formatListingMode, formatPrice, type ListingCardData } from "@/lib/listing-format";

export default function ProductCard({ product }: { product: ListingCardData }) {
  const isSale = product.mode === "sale";

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4"
        >
          <div className="relative flex aspect-[1.12/1] items-center justify-center overflow-hidden rounded-md border border-[#e5e7eb] bg-[#f4f6f8] text-[28px] text-[#9aa7b8] shadow-[0_6px_16px_rgba(15,23,42,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)]">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 transition-colors group-hover:bg-white">
                <Icon icon="lucide:image" aria-hidden="true" />
              </span>
            )}
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#17458f] shadow-sm">
              {formatListingMode(product.mode)}
            </span>
          </div>
        </Link>

        <form action={toggleFavoriteListingAction.bind(null, product.id, product.slug)} className="absolute right-2 top-2">
          <button
            type="submit"
            className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-[#fff7e8] ${
              product.isFavorite ? "text-[#ef476f]" : "text-[#6b7280]"
            }`}
            aria-label={product.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
          >
            <Icon icon={product.isFavorite ? "lucide:heart" : "lucide:heart"} width={15} height={15} aria-hidden="true" />
          </button>
        </form>
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        <h3 className="mt-2 truncate font-poppins text-[13px] leading-tight text-black transition-colors group-hover:text-[#17458f]">
          {product.title}
        </h3>
        <p className="mt-1.5 font-poppins text-[17px] font-semibold leading-none text-black">{formatPrice(product.price, product.mode)}</p>

        <div className={`mt-2 flex items-center gap-1.5 font-poppins text-[12px] ${isSale ? "text-[#f5a623]" : "text-[#48b461]"}`}>
          <Icon icon={isSale ? "lucide:tag" : "lucide:hand-heart"} aria-hidden="true" />
          <span>{formatListingMode(product.mode)}</span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 font-poppins text-[12px] text-black">
          <Icon icon="lucide:map-pin" aria-hidden="true" />
          <span>{product.location}</span>
        </div>
      </Link>
    </article>
  );
}
