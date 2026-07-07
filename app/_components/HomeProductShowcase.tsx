import Link from "next/link";
import { Icon } from "@iconify/react";
import { getSessionUserId } from "@/lib/auth";
import { getPublicListings } from "@/lib/listings";
import ProductCard from "./ProductCard";

export default async function HomeProductShowcase() {
  const userId = await getSessionUserId();
  const products = await getPublicListings({ limit: 24, userId });

  return (
    <section className="bg-white pb-10 pt-8 md:pb-12 md:pt-10" aria-labelledby="new-products-heading">
      <div className="mx-auto max-w-[1728px] px-5 sm:px-8 lg:px-40">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-7">
          <div>
            <h2 id="new-products-heading" className="font-open-sauce text-[22px] font-semibold leading-tight text-black md:text-[24px]">
              Barang Baru Ditambahkan
            </h2>
            <p className="mt-1 font-open-sauce text-[13px] leading-snug text-[#5f6370] md:text-[14px]">
              Temukan barang bekas yang siap dijual atau didonasikan
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 font-open-sauce text-[12px] font-semibold text-[#17458f] hover:bg-[#eef6ff]"
          >
            Lihat semua
            <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center">
            <p className="font-open-sauce text-[15px] font-semibold text-black">Belum ada listing aktif</p>
            <p className="mt-2 font-open-sauce text-[13px] text-[#6b7280]">Jadilah yang pertama mengunggah barang bekas layak pakai.</p>
            <Link href="/dashboard/listings/new" className="mt-5 inline-flex h-10 items-center rounded-full bg-[#f7a81b] px-5 font-open-sauce text-[12px] font-semibold text-white">
              Unggah Barang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(142px,1fr))] gap-x-3 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(155px,1fr))]">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
