import { Icon } from "@iconify/react";
import Link from "next/link";
import { listingCategoryGroups } from "@/lib/listing-taxonomy";
import { getPublicListingCategoryCounts } from "@/lib/listings";

export default async function HomeCategoryGrid() {
  const categoryCounts = await getPublicListingCategoryCounts();
  const categoryCountMap = new Map(categoryCounts.map((item) => [item.category, item.count]));

  return (
    <section className="bg-white py-10 md:py-12" aria-labelledby="home-categories-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="home-categories-heading" className="font-roboto-serif text-[24px] font-semibold leading-tight text-black md:text-[28px]">
              Jelajahi Kategori
            </h2>
            <p className="mt-0.5 font-poppins text-[14px] leading-snug text-black md:text-[16px]">
              Temukan barang bekas layak pakai berdasarkan kebutuhanmu
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

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {listingCategoryGroups.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 font-poppins transition duration-300 hover:-translate-y-1 hover:border-[#f7a81b] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#17458f] shadow-sm transition group-hover:bg-[#17458f] group-hover:text-white">
                <Icon icon={category.icon} width={19} height={19} aria-hidden="true" />
              </span>
              <span className="mt-4 block text-[13px] font-semibold text-black">{category.name}</span>
              <span className="mt-1 block text-[12px] text-[#6b7280]">
                {categoryCountMap.get(category.name) ?? 0} listing aktif
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
