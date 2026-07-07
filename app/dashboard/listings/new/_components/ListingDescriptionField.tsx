"use client";

import { useState } from "react";

const MAX_LENGTH = 2000;

type ListingDescriptionFieldProps = {
  defaultValue?: string | null;
  labelClass: string;
  labelTextClass: string;
};

export function ListingDescriptionField({
  defaultValue,
  labelClass,
  labelTextClass,
}: ListingDescriptionFieldProps) {
  const [length, setLength] = useState((defaultValue ?? "").length);
  const isNearLimit = length >= MAX_LENGTH - 100;

  return (
    <label className={labelClass}>
      <span className="flex items-center justify-between gap-2">
        <span className={labelTextClass}>Deskripsi</span>
        <span
          className={`text-[11px] tabular-nums ${
            isNearLimit ? "text-[var(--seller-accent)]" : "text-[var(--seller-muted)]"
          }`}
        >
          {length}/{MAX_LENGTH}
        </span>
      </span>
      <textarea
        name="description"
        defaultValue={defaultValue ?? ""}
        maxLength={MAX_LENGTH}
        onChange={(event) => setLength(event.target.value.length)}
        className="min-h-32 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 py-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        placeholder="Ceritakan kondisi barang, kelengkapan, ukuran, dan catatan penting."
      />
    </label>
  );
}
