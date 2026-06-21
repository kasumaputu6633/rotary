"use client";

import dynamic from "next/dynamic";

// Wrapper client component — ssr: false hanya boleh di client component
export const ListingLocationPickerLazy = dynamic(
  () => import("./ListingLocationPicker").then((m) => ({ default: m.ListingLocationPicker })),
  {
    ssr: false,
    loading: () => (
      <input
        name="location"
        required
        maxLength={160}
        className="h-11 w-full rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        placeholder="Contoh: Denpasar Barat, Bali"
      />
    ),
  }
);
