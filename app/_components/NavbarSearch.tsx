"use client";

import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RECENT = 6;
const STORAGE_KEY = "rotary_recent_searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (!query.trim()) return;
  const existing = getRecentSearches().filter(
    (s) => s.toLowerCase() !== query.toLowerCase(),
  );
  const updated = [query.trim(), ...existing].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* storage might be full — diam saja */
  }
}

function removeRecentSearch(query: string): string[] {
  const updated = getRecentSearches().filter((s) => s !== query);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { }
  return updated;
}

export default function NavbarSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Sync nilai input ketika URL berubah (misalnya navigasi kategori) */
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  /* Load riwayat saat dropdown akan muncul */
  useEffect(() => {
    if (isFocused) {
      setRecents(getRecentSearches());
      setHighlightedIndex(-1);
    }
  }, [isFocused]);

  /* Tutup dropdown kalau klik di luar */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
        saveRecentSearch(query.trim());
        setRecents(getRecentSearches());
      } else {
        params.delete("q");
      }
      params.delete("page");
      setIsFocused(false);
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(value);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const handleRecentClick = (query: string) => {
    setValue(query);
    navigate(query);
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(query);
    setRecents(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, recents.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleRecentClick(recents[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = isFocused && recents.length > 0 && value.trim() === "";

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`w-full flex items-center h-10 bg-white border rounded-xl overflow-hidden transition-all duration-150 ${isFocused
            ? "border-[#f7a81b]"
            : "border-[#c5cbd6] hover:border-[#a0a9b8]"
          }`}
      >
        <input
          ref={inputRef}
          id="navbar-search-input"
          name="q"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari di Marketplace"
          autoComplete="off"
          className="flex-1 px-4 font-open-sauce text-[13px] text-gray-700 placeholder:text-[#9ca3af] outline-none bg-transparent min-w-0"
          aria-label="Cari produk"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? "search-recents-dropdown" : undefined}
          aria-autocomplete="list"
        />

        {/* Clear button */}
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center w-7 h-full text-[#9ca3af] hover:text-[#555] transition-colors shrink-0"
            aria-label="Hapus kata kunci"
            tabIndex={-1}
          >
            <Icon icon="lucide:x" width={13} height={13} aria-hidden="true" />
          </button>
        )}

        <button
          type="submit"
          className="h-full w-11 bg-[#f7a81b] hover:bg-[#e09918] active:bg-[#d08a10] transition-colors flex items-center justify-center shrink-0"
          aria-label="Cari"
        >
          <Icon
            icon="lucide:search"
            width={15}
            height={15}
            className="text-white"
            aria-hidden="true"
          />
        </button>
      </form>

      {/* Recent searches dropdown */}
      {showDropdown && (
        <div
          id="search-recents-dropdown"
          role="listbox"
          aria-label="Pencarian terakhir"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[980] overflow-hidden rounded-xl border border-gray-200/80 bg-white animate-[dropdownSlideIn_150ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
          style={{
            boxShadow:
              "0 12px 32px rgba(23,69,143,0.13), 0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="flex items-center gap-1.5 font-open-sauce text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">
              <Icon
                icon="lucide:clock-3"
                width={12}
                height={12}
                aria-hidden="true"
              />
              Pencarian terakhir
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch { }
                setRecents([]);
                setIsFocused(false);
              }}
              className="font-open-sauce text-[11px] text-[#9ca3af] hover:text-[#ef476f] transition-colors"
            >
              Hapus semua
            </button>
          </div>

          {/* List */}
          <ul className="py-1">
            {recents.map((item, idx) => (
              <li
                key={item}
                role="option"
                aria-selected={idx === highlightedIndex}
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} /* prevent blur sebelum click */
                  onClick={() => handleRecentClick(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${idx === highlightedIndex
                      ? "bg-[#fafbff]"
                      : "hover:bg-[#fafbff]"
                    }`}
                >
                  <Icon
                    icon="lucide:history"
                    width={14}
                    height={14}
                    className="shrink-0 text-[#c5cbd6] group-hover:text-[#f7a81b] transition-colors"
                    aria-hidden="true"
                  />
                  <span className="flex-1 min-w-0 truncate font-open-sauce text-[13px] text-[#374151]">
                    {item}
                  </span>
                  {/* Tombol hapus per-item */}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Hapus "${item}" dari riwayat`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => handleRemoveRecent(e, item)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#c5cbd6] opacity-0 group-hover:opacity-100 hover:!text-[#ef476f] hover:bg-[#fef2f2] transition-all"
                  >
                    <Icon
                      icon="lucide:x"
                      width={11}
                      height={11}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer CTA */}
          <div className="border-t border-gray-100 px-3 py-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => navigate(value)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 font-open-sauce text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#eef6ff]"
            >
              <Icon
                icon="lucide:search"
                width={13}
                height={13}
                aria-hidden="true"
              />
              Cari di Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
