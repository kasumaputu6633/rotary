"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ProductStickyNavProps = {
  hasRecommendations: boolean;
  title: string;
};

const SECTION_IDS = ["detail-produk", "rekomendasi"] as const;
type SectionId = (typeof SECTION_IDS)[number];

export default function ProductStickyNav({ hasRecommendations, title }: ProductStickyNavProps) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionId>("detail-produk");
  const isClickScrolling = useRef(false);

  // Track navbar visibility based on scroll position
  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track which section is in view using IntersectionObserver
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip observer updates while click-scrolling is in progress
        if (isClickScrolling.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id as SectionId);
          }
        }
      },
      {
        // Offset for the sticky nav + some breathing room
        rootMargin: "-220px 0px -40% 0px",
        threshold: 0,
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: SectionId) => {
    e.preventDefault();
    setActiveTab(sectionId);

    const target = document.getElementById(sectionId);
    if (target) {
      // Prevent observer from overriding while we scroll
      isClickScrolling.current = true;
      target.scrollIntoView({ behavior: "smooth" });

      // Re-enable observer after scroll animation settles
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  }, []);

  const tabClass = (id: SectionId) =>
    `flex h-full items-center border-b-2 transition-colors ${
      activeTab === id
        ? "border-[#f7a81b] text-[#17458f]"
        : "border-transparent text-[#6b7280] hover:text-[#17458f]"
    }`;

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
          <a className={tabClass("detail-produk")} href="#detail-produk" onClick={(e) => handleClick(e, "detail-produk")}>
            Detail Produk
          </a>
          {hasRecommendations ? (
            <a className={tabClass("rekomendasi")} href="#rekomendasi" onClick={(e) => handleClick(e, "rekomendasi")}>
              Rekomendasi
            </a>
          ) : null}
        </nav>
        <div />
      </div>
    </div>
  );
}
