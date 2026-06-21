import { Icon } from "@iconify/react";
import Link from "next/link";
import { listingCategoryGroups } from "@/lib/listing-taxonomy";
import { getPublicListingCategoryCounts } from "@/lib/listings";

const categoryIconStyles = [
  {
    iconBg: "bg-[#ecfdf5]",
    iconText: "text-[#169b61]",
    iconRing: "ring-[#b7efce]",
  },
  {
    iconBg: "bg-[#eef6ff]",
    iconText: "text-[#17458f]",
    iconRing: "ring-[#bdd9ff]",
  },
  {
    iconBg: "bg-[#fff7df]",
    iconText: "text-[#c77800]",
    iconRing: "ring-[#f6d47a]",
  },
  {
    iconBg: "bg-[#fff0f5]",
    iconText: "text-[#c63f6d]",
    iconRing: "ring-[#efb3c7]",
  },
  {
    iconBg: "bg-[#edfff9]",
    iconText: "text-[#078876]",
    iconRing: "ring-[#a8eadb]",
  },
  {
    iconBg: "bg-[#f7f2ff]",
    iconText: "text-[#6547ad]",
    iconRing: "ring-[#cbb9f3]",
  },
];

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
          {listingCategoryGroups.map((category, index) => {
            const style = categoryIconStyles[index % categoryIconStyles.length];
            return (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group flex min-h-[76px] items-center gap-3 rounded-lg border border-[#d6deea] bg-white px-3.5 py-3 font-poppins transition duration-300 hover:-translate-y-0.5 hover:border-[#f7a81b] hover:shadow-[0_10px_22px_rgba(15,23,42,0.09)]"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${style.iconBg} ${style.iconText} ring-1 ${style.iconRing} transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105`}>
                  <Icon icon={category.icon} width={19} height={19} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold leading-tight text-black">{category.name}</span>
                  <span className="mt-1 block text-[11px] leading-tight text-[#6b7280]">
                    {categoryCountMap.get(category.name) ?? 0} listing aktif
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
