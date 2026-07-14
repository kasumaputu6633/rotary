"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface Section {
  id: string;
  icon: string;
  title: string;
}

export default function SidebarNav({
  sections,
  title = "Daftar Isi",
}: {
  sections: Section[];
  title?: string;
}) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      let current = "";

      for (const el of sectionElements) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // 350px provides a better offset so the sidebar updates earlier when scrolling
        if (rect.top <= 350) {
          current = el.id;
        }
      }

      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="sticky top-[153px]">
      <h2 className="mb-4 font-open-sauce text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">
        {title}
      </h2>
      <nav aria-label={title} className="flex flex-col gap-1 border-l-2 border-[#e4e8ef]">
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`group flex items-center gap-2.5 border-l-2 px-4 py-2 font-open-sauce text-[13px] font-medium transition-all -ml-[2px] ${
                isActive
                  ? "border-[#17458f] bg-[#f0f4fa] text-[#17458f]"
                  : "border-transparent text-[#5f6370] hover:border-[#17458f] hover:bg-[#f0f4fa] hover:text-[#17458f]"
              }`}
            >
              <Icon
                icon={s.icon}
                width={16}
                height={16}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-[#17458f]" : "text-[#9ca3af] group-hover:text-[#17458f]"
                }`}
                aria-hidden="true"
              />
              {s.title}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
