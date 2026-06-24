"use client";

import { useState } from "react";

const HANDOVER_OPTIONS = ["Ambil di tempat", "Titik temu", "Bisa dikirim manual"];

type ListingHandoverOptionsProps = {
  defaultValue?: string[] | null;
};

export function ListingHandoverOptions({ defaultValue }: ListingHandoverOptionsProps) {
  const initialSelected = new Set(
    defaultValue && defaultValue.length > 0 ? defaultValue : ["Ambil di tempat"],
  );
  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  function toggle(option: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(option);
      else next.delete(option);
      return next;
    });
  }

  const isInvalid = selected.size === 0;

  return (
    <div className="mt-3 grid gap-2">
      {HANDOVER_OPTIONS.map((option) => (
        <label
          key={option}
          className="flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 py-2 text-[12px] text-[var(--seller-ink)]"
        >
          <input
            name="handoverOptions"
            type="checkbox"
            value={option}
            checked={selected.has(option)}
            onChange={(event) => toggle(option, event.target.checked)}
            className="accent-[var(--seller-brand)]"
          />
          {option}
        </label>
      ))}

      {/* Hidden input untuk trigger HTML required validation kalo belum ada yang dicentang */}
      <input
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        required
        value={isInvalid ? "" : "ok"}
        onChange={() => {}}
        className="sr-only"
        // biar focus dari validation native nggak nyasar ke field tersembunyi
        onInvalid={(event) => {
          (event.target as HTMLInputElement).setCustomValidity(
            "Pilih minimal 1 opsi serah terima.",
          );
        }}
        onInput={(event) => {
          (event.target as HTMLInputElement).setCustomValidity("");
        }}
      />

      {isInvalid ? (
        <p className="text-[11px] text-[var(--seller-accent)]">
          Pilih minimal 1 opsi serah terima.
        </p>
      ) : null}
    </div>
  );
}
