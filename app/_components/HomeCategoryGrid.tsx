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

const categoryImages: Record<string, string> = {
  "Rumah Tangga": "/illustrations/categories/rumah-tangga.png",
  "Elektronik": "/illustrations/categories/elektronik.png",
  "Buku": "/illustrations/categories/buku.png",
  "Fashion": "/illustrations/categories/fashion.png",
  "Olahraga": "/illustrations/categories/olahraga.png",
  "Mainan": "/illustrations/categories/mainan-anak.png",
};

export default async function HomeCategoryGrid() {
  const categoryCounts = await getPublicListingCategoryCounts();
  const categoryCountMap = new Map(categoryCounts.map((item) => [item.category, item.count]));

  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="home-categories-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="ds-split-layout">
          <div className="ds-split-header mb-8 lg:mb-0">
            <div>
              <h2 className="font-roboto-serif text-[26px] font-semibold leading-tight text-black md:text-[32px]">
                Pilih Kategori
              </h2>
              <p className="mt-2 font-poppins text-[14px] leading-relaxed text-black md:text-[15px]">
                Temukan berbagai barang reusable berkualitas untuk mendukung gaya hidup sirkular dan ramah lingkungan.
              </p>
            </div>
            <div>
              <Link
                href="/products"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 font-poppins text-[12px] font-semibold text-[#17458f] hover:bg-[#eef6ff] transition-colors"
              >
                Lihat semua kategori
                <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="ds-v3-grid">
            {listingCategoryGroups.map((category) => {
              const imageUrl = categoryImages[category.name];
              return (
                <Link
                  key={category.name}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="ds-v3-card group ds-v3-featured-card"
                >
                  <div className="ds-v3-card-img-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={category.name} className="ds-v3-card-img" />
                    <div className="ds-v3-card-img-overlay" />
                  </div>
                  <div className="ds-v3-card-content font-poppins text-white">
                    <div>
                      <h3 className="ds-v3-title-text">{category.name}</h3>
                      <span className="ds-v3-count-text">{categoryCountMap.get(category.name) ?? 0} listing</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
