import Link from "next/link";
import { Icon } from "@iconify/react";
import { getSessionUserId } from "@/lib/auth";
import { getPublicListings } from "@/lib/listings";
import ProductCard from "./ProductCard";

export default async function HomeProductShowcase() {
  const userId = await getSessionUserId();
  const products = await getPublicListings({ limit: 24, userId });

  return (
    <section className="bg-white pb-12 pt-10 md:pb-14 md:pt-12" aria-labelledby="new-products-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3 md:mb-12">
          <div>
            <h2 id="new-products-heading" className="font-roboto-serif text-[24px] font-semibold leading-tight text-black md:text-[28px]">
              Barang Baru Ditambahkan
            </h2>
            <p className="mt-0.5 font-poppins text-[14px] leading-snug text-black md:text-[16px]">
              Temukan barang bekas yang siap dijual atau didonasikan
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 font-poppins text-[12px] font-semibold text-[#17458f] hover:bg-[#eef6ff]"
          >
            Lihat semua
            <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center">
            <p className="font-poppins text-[15px] font-semibold text-black">Belum ada listing aktif</p>
            <p className="mt-2 font-poppins text-[13px] text-[#6b7280]">Jadilah yang pertama mengunggah barang bekas layak pakai.</p>
            <Link href="/dashboard/listings/new" className="mt-5 inline-flex h-10 items-center rounded-full bg-[#f7a81b] px-5 font-poppins text-[12px] font-semibold text-white">
              Unggah Barang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
