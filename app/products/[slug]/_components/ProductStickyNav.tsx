"use client";

import { useEffect, useState } from "react";

type ProductStickyNavProps = {
  hasRecommendations: boolean;
  title: string;
};

export default function ProductStickyNav({ hasRecommendations, title }: ProductStickyNavProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      data-product-sticky-nav
      className={`fixed left-0 right-0 top-[133px] z-[940] hidden border-b border-[#e5e7eb] bg-white/95 shadow-[0_8px_18px_rgba(15,23,42,0.06)] backdrop-blur lg:block ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      } transition duration-200`}
    >
      <div className="mx-auto grid h-12 max-w-[1240px] grid-cols-[360px_minmax(0,1fr)_300px] items-center gap-6 px-6 xl:px-0">
        <p className="truncate font-poppins text-[13px] font-semibold text-black">{title}</p>
        <nav className="flex h-full items-center gap-10 font-poppins text-[13px] font-semibold" aria-label="Navigasi detail produk">
          <a className="flex h-full items-center border-b-2 border-[#f7a81b] text-[#17458f]" href="#detail-produk">
            Detail Produk
          </a>
          {hasRecommendations ? (
            <a className="flex h-full items-center border-b-2 border-transparent text-[#6b7280] transition-colors hover:text-[#17458f]" href="#rekomendasi">
              Rekomendasi
            </a>
          ) : null}
        </nav>
        <div />
      </div>
    </div>
  );
}
