import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ProductSummary } from "@/app/_data/products";

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4"
    >
      <article className="min-w-0 cursor-pointer">
        <div
          className={`relative flex aspect-[1.12/1] items-center justify-center overflow-hidden rounded-md border border-[#e5e7eb] text-[28px] text-[#9aa7b8] shadow-[0_6px_16px_rgba(15,23,42,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)] ${product.tone}`}
        >
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#17458f] shadow-sm">
            Baru
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 transition-colors group-hover:bg-white">
            <Icon icon="lucide:image" aria-hidden="true" />
          </span>
        </div>

        <h3 className="mt-2 truncate font-poppins text-[13px] leading-tight text-black transition-colors group-hover:text-[#17458f]">
          {product.title}
        </h3>
        <p className="mt-1.5 font-poppins text-[17px] font-semibold leading-none text-black">{product.price}</p>

        <div className={`mt-2 flex items-center gap-1.5 font-poppins text-[12px] ${product.isSale ? "text-[#f5a623]" : "text-[#48b461]"}`}>
          <Icon icon={product.isSale ? "lucide:tag" : "lucide:hand-heart"} aria-hidden="true" />
          <span>{product.status}</span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 font-poppins text-[12px] text-black">
          <Icon icon="lucide:map-pin" aria-hidden="true" />
          <span>{product.location}</span>
        </div>
      </article>
    </Link>
  );
}
