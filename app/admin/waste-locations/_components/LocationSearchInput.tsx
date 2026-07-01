"use client";

import { useSearchBoxCore } from "@mapbox/search-js-react";
import { SessionToken, type SearchBoxSuggestion } from "@mapbox/search-js-core";
import { useEffect, useMemo, useRef, useState } from "react";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const MAX_LOCATION_LENGTH = 255;

export type Props = {
  value: string;
  onAddressChange: (value: string) => void;
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  required?: boolean;
};

function normalizeLocationLabel(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim().slice(0, MAX_LOCATION_LENGTH);
}

function joinUniqueLocationParts(parts: Array<string | null | undefined>) {
  const cleanParts: string[] = [];
  for (const part of parts) {
    const clean = part?.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    if (cleanParts.some((existing) => existing.toLowerCase() === clean.toLowerCase())) continue;
    cleanParts.push(clean);
  }
  return normalizeLocationLabel(cleanParts.join(", "));
}

function buildDetailedLocationLabel(
  suggestion: SearchBoxSuggestion,
  feature?: { properties?: Partial<SearchBoxSuggestion> },
) {
  const properties = feature?.properties;
  const name = properties?.name_preferred || properties?.name || suggestion.name_preferred || suggestion.name;
  const fullAddress = properties?.full_address || suggestion.full_address;
  const placeFormatted = properties?.place_formatted || suggestion.place_formatted;

  if (fullAddress) {
    const isNameAlreadyIncluded = name && fullAddress.toLowerCase().includes(name.toLowerCase());
    return joinUniqueLocationParts([isNameAlreadyIncluded ? null : name, fullAddress]);
  }

  return joinUniqueLocationParts([name, placeFormatted]);
}

export function LocationSearchInput({
  value,
  onAddressChange,
  onCoordinatesChange,
  className,
  placeholder,
  id,
  required,
}: Props) {
  const search = useSearchBoxCore({
    accessToken: TOKEN,
    language: "id",
    country: "id",
    limit: 5,
  });

  const sessionToken = useMemo(() => new SessionToken(), []);

  const [suggestions, setSuggestions] = useState<SearchBoxSuggestion[]>([]);
  const [openRequested, setOpenRequested] = useState(false);
  const [dropdownAbove, setDropdownAbove] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSuggestRef = useRef(false);

  const isOpen = openRequested && suggestions.length > 0;

  useEffect(() => {
    if (!isOpen || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const estimatedHeight = suggestions.length * 58 + 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropdownAbove(spaceBelow < estimatedHeight && rect.top > estimatedHeight);
  }, [isOpen, suggestions.length]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || !TOKEN) return;

    debounceRef.current = setTimeout(async () => {
      if (skipNextSuggestRef.current) {
        skipNextSuggestRef.current = false;
        return;
      }
      try {
        const res = await search.suggest(value, { sessionToken });
        setSuggestions(res.suggestions);
      } catch {
        // silent
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, search, sessionToken]);

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
      onAddressChange(buildDetailedLocationLabel(suggestion, feature));
      onCoordinatesChange({ lat, lng });
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
        id={id}
        type="text"
        required={required}
        maxLength={MAX_LOCATION_LENGTH}
        value={value}
        onChange={(e) => {
          onAddressChange(e.target.value);
          setSuggestions([]);
        }}
        onFocus={() => setOpenRequested(true)}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 z-[300] max-h-[280px] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg ${
            dropdownAbove ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {suggestions.map((s) => (
            <li key={s.mapbox_id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className="flex w-full flex-col px-3 py-2.5 text-left transition hover:bg-gray-50"
              >
                <span className="font-open-sauce text-[13px] font-medium text-gray-900">{s.name}</span>
                {s.full_address && s.full_address !== s.name && (
                  <span className="mt-0.5 font-open-sauce text-[11px] leading-snug text-gray-500">
                    {s.full_address}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
