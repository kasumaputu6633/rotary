"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { listingCategoryGroups } from "../../../_data/seller-center";

export function ListingCategoryPicker({
  defaultCategory,
  defaultSubcategory,
}: {
  defaultCategory?: string;
  defaultSubcategory?: string;
} = {}) {
  const [category, setCategory] = useState(
    defaultCategory ?? listingCategoryGroups[0]?.name ?? "",
  );
  const activeCategory = useMemo(
    () => listingCategoryGroups.find((item) => item.name === category) ?? listingCategoryGroups[0],
    [category],
  );
  const [subcategory, setSubcategory] = useState(
    defaultSubcategory ?? activeCategory?.subcategories[0] ?? "",
  );

  function chooseCategory(nextCategory: string) {
    const nextGroup = listingCategoryGroups.find((item) => item.name === nextCategory) ?? listingCategoryGroups[0];
    setCategory(nextGroup.name);
    setSubcategory(nextGroup.subcategories[0] ?? "");
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)]">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="subcategory" value={subcategory} />

      <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-3">
        <p className="px-2 text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Kategori</p>
        <div className="mt-3 grid gap-2">
          {listingCategoryGroups.map((item) => {
            const isActive = item.name === category;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => chooseCategory(item.name)}
                className={`flex h-11 items-center gap-3 rounded-[8px] px-3 text-left text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-[var(--seller-brand)] text-white shadow-[var(--seller-shadow-tight)]"
                    : "bg-[var(--seller-surface)] text-[var(--seller-ink)] hover:bg-[var(--seller-brand-soft)] hover:text-[var(--seller-brand)]"
                }`}
              >
                <Icon icon={item.icon} width={18} height={18} aria-hidden="true" />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] p-4">
        <h3 className="text-[20px] font-semibold leading-tight text-[var(--seller-ink)]">Pilih Subkategori</h3>
        <p className="mt-1 text-[12px] text-[var(--seller-muted)]">Pilih jenis barang yang paling dekat dengan listing kamu.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeCategory.subcategories.map((item) => {
            const isActive = item === subcategory;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setSubcategory(item)}
                className={`flex min-h-14 items-center gap-3 rounded-[8px] border px-3 text-left text-[13px] font-semibold transition ${
                  isActive
                    ? "border-[var(--seller-brand)] bg-[var(--seller-brand)] text-white shadow-[var(--seller-shadow-tight)]"
                    : "border-[var(--seller-rule)] bg-[var(--seller-surface)] text-[var(--seller-ink)] hover:border-[var(--seller-accent)] hover:bg-[var(--seller-accent-soft)]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${
                    isActive ? "bg-white/15 text-white" : "bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]"
                  }`}
                >
                  <Icon icon="lucide:tag" width={16} height={16} aria-hidden="true" />
                </span>
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
