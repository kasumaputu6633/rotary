"use client";

import { useEffect, useRef, useState } from "react";

const HANDOVER_OPTIONS = ["Ambil di tempat", "Titik temu", "Bisa dikirim manual"];

type ListingHandoverOptionsProps = {
  defaultValue?: string[] | null;
};

export function ListingHandoverOptions({ defaultValue }: ListingHandoverOptionsProps) {
  const initialSelected = new Set(
    defaultValue && defaultValue.length > 0 ? defaultValue : ["Ambil di tempat"],
  );
  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const sentinelRef = useRef<HTMLInputElement>(null);

  const isInvalid = selected.size === 0;

  // Sync customValidity tiap state berubah biar ngga stale gara-gara onInput
  // ngga ke-fire saat value di-set programmatically lewat React.
  useEffect(() => {
    sentinelRef.current?.setCustomValidity(
      isInvalid ? "Pilih minimal 1 opsi serah terima." : "",
    );
  }, [isInvalid]);

  function toggle(option: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(option);
      else next.delete(option);
      return next;
    });
  }

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

      {/* Sentinel input buat trigger native required validation. */}
      <input
        ref={sentinelRef}
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        value={isInvalid ? "" : "ok"}
        onChange={() => {}}
        className="sr-only"
      />

      {isInvalid ? (
        <p className="text-[11px] text-[var(--seller-accent)]">
          Pilih minimal 1 opsi serah terima.
        </p>
      ) : null}
    </div>
  );
}
