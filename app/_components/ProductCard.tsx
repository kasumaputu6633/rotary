import { Icon } from "@iconify/react";
import Link from "next/link";
import { toggleFavoriteListingAction } from "@/app/account/actions";
import { formatPrice, formatPublicLocation, type ListingCardData } from "@/lib/listing-format";

export default function ProductCard({ product, isAdmin }: { product: ListingCardData; isAdmin?: boolean }) {
  const isSale = product.mode === "sale";
  const isReserved = product.status === "reserved";
  const publicLocation = formatPublicLocation(product.location);
  const typeLabel = isReserved ? "Dipesan" : isSale ? "Dijual" : "Donasi gratis";
  const typeIcon = isReserved ? "lucide:handshake" : isSale ? "lucide:tag" : "lucide:hand-heart";
  const typeColor = isReserved ? "text-[#17458f]" : isSale ? "text-[#f47b20]" : "text-[#2f7d49]";

  return (
    <article className="group min-w-0 font-open-sauce">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4"
        >
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-[#e4e8ef] bg-[#f4f6f8] text-[28px] text-[#9aa7b8] shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_22px_rgba(15,23,42,0.11)]">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 transition-colors group-hover:bg-white">
                <Icon icon="lucide:image" aria-hidden="true" />
              </span>
            )}
          </div>
        </Link>

        {!isAdmin && (
          <form action={toggleFavoriteListingAction.bind(null, product.id, product.slug)} className="absolute right-2 top-2">
            <button
              type="submit"
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-[#fff7e8] ${
                product.isFavorite ? "text-[#ef476f]" : "text-[#6b7280]"
              }`}
              aria-label={product.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
            >
              <Icon
                icon="lucide:heart"
                width={15}
                height={15}
                className={product.isFavorite ? "[&_path]:fill-current" : ""}
                aria-hidden="true"
              />
            </button>
          </form>
        )}
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        <h3 className="mt-2 line-clamp-2 min-h-[34px] text-[13px] font-normal leading-[17px] text-[#31353b] transition-colors group-hover:text-[#17458f]">
          {product.title}
        </h3>
        <p className="mt-1 text-[16px] font-bold leading-tight text-[#212121]">{formatPrice(product.price, product.mode)}</p>

        <div className={`mt-1.5 flex min-w-0 items-center gap-1 text-[11px] font-semibold ${typeColor}`}>
          <Icon icon={typeIcon} width={12} height={12} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{typeLabel}</span>
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-[#6b7280]">
          <Icon icon="lucide:badge-check" width={12} height={12} className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
          <span className="truncate">{product.condition}</span>
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-[#6b7280]">
          <Icon icon="lucide:map-pin" width={12} height={12} className="shrink-0 text-[#9aa3af]" aria-hidden="true" />
          <span className="truncate">{publicLocation}</span>
        </div>
      </Link>
    </article>
  );
}
