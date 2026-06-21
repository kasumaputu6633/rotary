"use client";

import { useSearchBoxCore } from "@mapbox/search-js-react";
import { SessionToken, type SearchBoxSuggestion } from "@mapbox/search-js-core";
import { useEffect, useMemo, useRef, useState } from "react";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type Props = {
  defaultLocation?: string;
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
};

// Bangun label lokasi yang bersih: "Nama Jalan, Kota, Provinsi" — tanpa kode pos dan negara
function buildLocationLabel(s: SearchBoxSuggestion): string {
  const parts: string[] = [s.name];
  const ctx = s.context as Record<string, { name?: string } | undefined> | undefined;
  const place = ctx?.place?.name ?? ctx?.locality?.name;
  const region = ctx?.region?.name;
  if (place) parts.push(place);
  if (region && region !== place) parts.push(region);
  return parts.join(", ");
}

export function ListingLocationPicker({ defaultLocation, defaultLatitude, defaultLongitude }: Props) {
  const search = useSearchBoxCore({
    accessToken: TOKEN,
    language: "id",
    country: "id",
    limit: 5,
  });

  const sessionToken = useMemo(() => new SessionToken(), []);

  const [query, setQuery] = useState(defaultLocation ?? "");
  const [suggestions, setSuggestions] = useState<SearchBoxSuggestion[]>([]);
  const [latitude, setLatitude] = useState<number | null>(defaultLatitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(defaultLongitude ?? null);
  const [openRequested, setOpenRequested] = useState(false);
  const [dropdownAbove, setDropdownAbove] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSuggestRef = useRef(false);

  // Dropdown terbuka hanya ketika user sedang fokus/interaksi DAN ada saran.
  const isOpen = openRequested && suggestions.length > 0;

  // Tentukan apakah dropdown harus muncul di atas atau di bawah input
  useEffect(() => {
    if (!isOpen || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const estimatedHeight = suggestions.length * 58 + 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropdownAbove(spaceBelow < estimatedHeight && rect.top > estimatedHeight);
  }, [isOpen, suggestions.length]);

  // Debounced suggest. Bukan sync-setState di effect — hanya menjadwalkan fetch
  // dan menulis hasilnya via setState asinkron di dalam timer callback.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || !TOKEN) return;

    debounceRef.current = setTimeout(async () => {
      if (skipNextSuggestRef.current) {
        skipNextSuggestRef.current = false;
        return;
      }
      try {
        const res = await search.suggest(query, { sessionToken });
        setSuggestions(res.suggestions);
      } catch {
        // silent
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search, sessionToken]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenRequested(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSelect(suggestion: SearchBoxSuggestion) {
    try {
      const res = await search.retrieve(suggestion, { sessionToken });
      const feature = res.features[0];
      if (!feature) return;
      const [lng, lat] = feature.geometry.coordinates;
      skipNextSuggestRef.current = true;
      setQuery(buildLocationLabel(suggestion));
      setLatitude(lat);
      setLongitude(lng);
      setSuggestions([]);
      setOpenRequested(false);
    } catch {
      // silent
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        name="location"
        required
        maxLength={160}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // Saran lama tidak relevan untuk teks baru; bersihkan di event handler
          // (bukan effect) supaya tidak trigger cascading render.
          setSuggestions([]);
          setLatitude(null);
          setLongitude(null);
        }}
        onFocus={() => setOpenRequested(true)}
        className="h-11 w-full rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        placeholder="Contoh: Denpasar Barat, Bali"
        autoComplete="off"
      />

      <input type="hidden" name="latitude" value={latitude ?? ""} />
      <input type="hidden" name="longitude" value={longitude ?? ""} />

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 z-[200] max-h-[280px] overflow-y-auto rounded-[8px] border border-[#d1d5db] bg-white py-1 shadow-lg ${
            dropdownAbove ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {suggestions.map((s) => (
            <li key={s.mapbox_id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className="flex w-full flex-col px-3 py-2.5 text-left transition hover:bg-[#f3f4f6]"
              >
                <span className="text-[13px] font-medium text-[#111827]">{s.name}</span>
                {s.full_address && s.full_address !== s.name && (
                  <span className="mt-0.5 text-[11px] leading-snug text-[#6b7280]">{s.full_address}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
