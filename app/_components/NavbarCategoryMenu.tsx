"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Category = {
  name: string;
  icon: string;
  subcategories: string[];
};

export default function NavbarCategoryMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const fetchCategories = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          setLoaded(true);
        }
      }
    } catch {
      // Diam — biarkan skeleton tetap, hover berikutnya akan mencoba lagi.
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const open = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => {
      setIsOpen(true);
      void fetchCategories();
    }, 80);
  }, [fetchCategories]);

  const close = useCallback(() => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setIsOpen(false), 260);
  }, []);

  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const activeCategory = categories[activeIndex];

  return (
    <div className="hidden lg:block" onMouseEnter={open} onMouseLeave={close}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          void fetchCategories();
        }}
        className="inline-flex items-center gap-1.5 whitespace-nowrap font-open-sauce text-[14px] text-[#333] transition-colors hover:text-[#17458f]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Kategori
        <Icon
          icon="lucide:chevron-down"
          width={15}
          height={15}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-8 top-[calc(100%+8px)] z-[970] w-[760px] max-w-[calc(100vw-64px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_44px_rgba(23,69,143,0.14),0_8px_20px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-[220px_minmax(0,1fr)]">
            {/* Sidebar kategori */}
            <div className="max-h-[440px] overflow-y-auto border-r border-gray-100 bg-[#fafbfc] py-2">
              {!loaded
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-2.5">
                      <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-gray-200" />
                      <div
                        className="h-3.5 animate-pulse rounded bg-gray-200"
                        style={{ width: `${70 + ((i * 23) % 50)}px` }}
                      />
                    </div>
                  ))
                : categories.map((cat, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onMouseEnter={() => setActiveIndex(i)}
                        onFocus={() => setActiveIndex(i)}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-open-sauce text-[13px] font-semibold transition-colors ${
                          isActive
                            ? "bg-white text-[#17458f]"
                            : "text-[#5b6470] hover:bg-white hover:text-[#17458f]"
                        }`}
                      >
                        <Icon icon={cat.icon} width={17} height={17} className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
            </div>

            {/* Panel subkategori */}
            <div className="max-h-[440px] overflow-y-auto p-5">
              {!loaded ? (
                <>
                  <div className="mb-4 h-5 w-44 animate-pulse rounded bg-gray-200" />
                  <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-3 animate-pulse rounded bg-gray-100" style={{ width: `${60 + ((i * 17) % 40)}%` }} />
                    ))}
                  </div>
                </>
              ) : activeCategory ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <Icon icon={activeCategory.icon} width={20} height={20} className="text-[#f7a81b]" aria-hidden="true" />
                    <Link
                      href={`/products?category=${encodeURIComponent(activeCategory.name)}`}
                      onClick={() => setIsOpen(false)}
                      className="font-open-sauce text-[15px] font-bold text-[#17458f] hover:underline"
                    >
                      {activeCategory.name}
                    </Link>
                  </div>
                  {activeCategory.subcategories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
                      {activeCategory.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/products?category=${encodeURIComponent(activeCategory.name)}&subcategory=${encodeURIComponent(sub)}`}
                          onClick={() => setIsOpen(false)}
                          className="truncate font-open-sauce text-[13px] text-[#5b6470] transition-colors hover:text-[#f7a81b]"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="font-open-sauce text-[12px] italic text-gray-400">Belum ada subkategori.</p>
                  )}
                </>
              ) : (
                <p className="font-open-sauce text-[13px] text-gray-400">Kategori tidak tersedia.</p>
              )}
            </div>
          </div>
          <Link
            href="/products"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 border-t border-gray-100 bg-[#fafbfc] py-3 font-open-sauce text-[13px] font-semibold text-[#17458f] transition-colors hover:bg-[#eef6ff]"
          >
            Lihat semua kategori
            <Icon icon="lucide:arrow-right" width={15} height={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
