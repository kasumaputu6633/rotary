"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { createProduct } from "@/app/_data/products";

const INITIAL_PRODUCT_COUNT = 12;
const MIN_LOAD_MORE_COUNT = 15;
const MAX_LOAD_MORE_COUNT = 20;
const LOAD_MORE_DELAY = 700;

function getLoadMoreCount() {
  return Math.floor(Math.random() * (MAX_LOAD_MORE_COUNT - MIN_LOAD_MORE_COUNT + 1)) + MIN_LOAD_MORE_COUNT;
}

function ProductSkeleton() {
  return (
    <article className="min-w-0" aria-hidden="true">
      <div className="skeleton-shimmer aspect-[1.12/1] rounded-md border border-[#edf0f5] bg-[#eef2f7]" />
      <div className="skeleton-shimmer mt-2 h-3.5 w-11/12 rounded-full bg-[#edf0f5]" />
      <div className="skeleton-shimmer mt-2 h-4.5 w-1/2 rounded-full bg-[#e4e9f1]" />
      <div className="skeleton-shimmer mt-2 h-3 w-20 rounded-full bg-[#edf0f5]" />
      <div className="skeleton-shimmer mt-1.5 h-3 w-24 rounded-full bg-[#edf0f5]" />
    </article>
  );
}

export default function HomeProductShowcase() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_PRODUCT_COUNT);
  const [loadingCount, setLoadingCount] = useState(0);
  const products = useMemo(
    () => Array.from({ length: visibleCount }, (_, index) => createProduct(index)),
    [visibleCount]
  );

  function handleLoadMore() {
    if (loadingCount > 0) return;

    const nextCount = getLoadMoreCount();
    setLoadingCount(nextCount);

    window.setTimeout(() => {
      setVisibleCount((count) => count + nextCount);
      setLoadingCount(0);
    }, LOAD_MORE_DELAY);
  }

  return (
    <section className="bg-white pb-12 pt-10 md:pb-14 md:pt-12" aria-labelledby="new-products-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="mb-10 md:mb-12">
          <h2 id="new-products-heading" className="font-roboto-serif text-[24px] font-semibold leading-tight text-black md:text-[28px]">
            Barang Baru Ditambahkan
          </h2>
          <p className="mt-0.5 font-poppins text-[14px] leading-snug text-black md:text-[16px]">
            Temukan barang bekas yang siap dijual atau didonasikan
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard key={`${product.slug}-${index}`} product={product} />
          ))}

          {Array.from({ length: loadingCount }, (_, index) => (
            <ProductSkeleton key={`product-skeleton-${index}`} />
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-12">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingCount > 0}
            className="group inline-flex h-11 items-center gap-3 rounded-full bg-[#f7a81b] pl-7 pr-4 font-poppins text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(247,168,27,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-4 disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
          >
            {loadingCount > 0 ? "Memuat Produk" : "Lihat Lebih Banyak"}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[15px] transition-transform group-hover:translate-x-0.5">
              <Icon icon={loadingCount > 0 ? "lucide:loader-circle" : "lucide:arrow-right"} className={loadingCount > 0 ? "animate-spin" : ""} aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
