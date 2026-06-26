"use client";

import { useState } from "react";
import type { ListingMode } from "@/lib/listing-format";
import { SellerSelect } from "@/app/dashboard/_components/SellerSelect";
import { CurrencyInput } from "@/app/dashboard/_components/CurrencyInput";

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
        <CurrencyInput
          name="price"
          defaultValue={defaultPrice}
          disabled={isDonation}
          required={!isDonation}
          placeholder={isDonation ? "Tidak perlu harga" : "180.000"}
        />
        <span className="text-[11px] leading-relaxed text-[var(--seller-muted)]">
          {isDonation ? "Listing donasi akan tampil sebagai Gratis." : "Harga ditampilkan otomatis dalam format Rupiah."}
        </span>
      </label>
    </>
  );
}

