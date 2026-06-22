"use client";

import { useState } from "react";
import type { ListingMode } from "@/lib/listing-format";

type ListingModePriceFieldsProps = {
  defaultMode?: ListingMode;
  defaultPrice?: number | null;
  fieldClass: string;
  labelClass: string;
  labelTextClass: string;
};

export function ListingModePriceFields({
  defaultMode = "sale",
  defaultPrice,
  fieldClass,
  labelClass,
  labelTextClass,
}: ListingModePriceFieldsProps) {
  const [mode, setMode] = useState<ListingMode>(defaultMode);
  const isDonation = mode === "donation";

  return (
    <>
      <label className={labelClass}>
        <span className={labelTextClass}>Mode Listing</span>
        <select
          name="mode"
          value={mode}
          onChange={(event) => setMode(event.target.value === "donation" ? "donation" : "sale")}
          className={fieldClass}
        >
          <option value="sale">Dijual</option>
          <option value="donation">Didonasi</option>
        </select>
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>Harga jika dijual</span>
        <input
          name="price"
          inputMode="numeric"
          defaultValue={defaultPrice ?? ""}
          disabled={isDonation}
          className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-[var(--seller-surface-2)] disabled:text-[var(--seller-muted)]`}
          placeholder={isDonation ? "Tidak perlu harga" : "180000"}
        />
        <span className="text-[11px] leading-relaxed text-[var(--seller-muted)]">
          {isDonation ? "Listing donasi akan tampil sebagai Gratis." : "Kosongkan jika harga ingin dibicarakan langsung."}
        </span>
      </label>
    </>
  );
}
