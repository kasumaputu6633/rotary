"use client";

import { useState } from "react";
import type { ListingMode } from "@/lib/listing-format";
import { SellerSelect } from "@/app/dashboard/_components/SellerSelect";

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
      <div className={labelClass}>
        <span className={labelTextClass}>Mode Listing</span>
        <SellerSelect
          ariaLabel="Mode Listing"
          name="mode"
          value={mode}
          dropdownDirection="up"
          onValueChange={(nextMode) => setMode(nextMode === "donation" ? "donation" : "sale")}
          className={fieldClass}
          options={[
            { value: "sale", label: "Dijual" },
            { value: "donation", label: "Didonasi" },
          ]}
        />
      </div>
      <label className={labelClass}>
        <span className={labelTextClass}>Harga jika dijual</span>
        <input
          name="price"
          inputMode="numeric"
          pattern="[0-9]*"
          defaultValue={defaultPrice ?? ""}
          disabled={isDonation}
          required={!isDonation}
          onInvalid={(event) => {
            (event.target as HTMLInputElement).setCustomValidity("Harga wajib diisi untuk listing yang dijual.");
          }}
          onInput={(event) => {
            (event.target as HTMLInputElement).setCustomValidity("");
          }}
          className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-[var(--seller-surface-2)] disabled:text-[var(--seller-muted)]`}
          placeholder={isDonation ? "Tidak perlu harga" : "180000"}
        />
        <span className="text-[11px] leading-relaxed text-[var(--seller-muted)]">
          {isDonation ? "Listing donasi akan tampil sebagai Gratis." : "Isi harga dalam rupiah, tanpa titik atau koma."}
        </span>
      </label>
    </>
  );
}
