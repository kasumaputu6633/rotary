import { Icon } from "@iconify/react";
import Link from "next/link";
import { getActiveCategories } from "@/lib/categories";
import { getPublicListingCategoryCounts } from "@/lib/listings";

const categoryImages: Record<string, string> = {
  "Rumah Tangga": "/illustrations/categories/rumah-tangga.png",
  "Elektronik": "/illustrations/categories/elektronik.png",
  "Buku": "/illustrations/categories/buku.png",
  "Fashion": "/illustrations/categories/fashion.png",
  "Olahraga": "/illustrations/categories/olahraga.png",
  "Mainan": "/illustrations/categories/mainan-anak.png",
};

export default async function HomeCategoryGrid() {
  const [categories, categoryCounts] = await Promise.all([
    getActiveCategories(),
    getPublicListingCategoryCounts(),
  ]);
  const categoryCountMap = new Map(categoryCounts.map((item) => [item.category, item.count]));

  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="home-categories-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="category-section">
          <div className="category-section-header mb-8 lg:mb-0">
            <div>
              <span className="inline-flex items-center gap-1.5 font-open-sauce text-[11px] font-semibold uppercase tracking-[0.08em] text-[#17458f]">
                <Icon icon="lucide:layout-grid" width={13} height={13} aria-hidden="true" />
                Jelajahi Kategori
              </span>
              <h2 className="mt-3 font-open-sauce text-[26px] font-semibold leading-tight text-black md:text-[32px]">
                Pilih Kategori
              </h2>
              <p className="mt-2 font-open-sauce text-[14px] leading-relaxed text-[#5f6370] md:text-[15px]">
                Temukan berbagai barang reusable berkualitas untuk mendukung gaya hidup sirkular dan ramah lingkungan.
              </p>
            </div>
            <div>
              <Link
                href="/products"
                className="group/cta inline-flex h-10 items-center gap-2 rounded-lg border border-[#cbd5e1] px-4 font-open-sauce text-[12px] font-semibold text-[#17458f] transition-colors hover:border-[#17458f] hover:bg-[#eef6ff]"
              >
                Lihat semua kategori
                <Icon
                  icon="lucide:arrow-right"
                  width={14}
                  height={14}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
                />
              </Link>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => {
              const imageUrl = categoryImages[category.name];
              return (
                <Link
                  key={category.name}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="category-card group"
                >
                  <div className="category-card-img-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={category.name} className="category-card-img" />
                  </div>
                  <div className="category-card-content font-open-sauce">
                    <h3 className="category-card-title">{category.name}</h3>
                    <span className="category-card-count">{categoryCountMap.get(category.name) ?? 0} listing</span>
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
