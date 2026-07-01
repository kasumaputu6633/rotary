"use client";

import { Icon } from "@iconify/react";
import { useTransition } from "react";
import type { WasteLocation } from "@/app/waste/actions";
import { toggleSavedWasteLocationAction } from "@/app/waste/actions";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildDirectionsUrl(location: WasteLocation) {
  const destination =
    location.latitude && location.longitude
      ? `${location.latitude},${location.longitude}`
      : `${location.namaUsaha} ${location.alamat ?? ""}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function SavedLocationCard({
  location,
  removable = false,
}: {
  location: WasteLocation;
  removable?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(() => {
      toggleSavedWasteLocationAction(location.id).catch(() => {});
    });
  };

  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-[10px] border border-[var(--seller-rule)] bg-white p-3">
      {location.imageUrl ? (
        <div
          role="img"
          aria-label={location.namaUsaha}
          className="h-[72px] w-[72px] shrink-0 rounded-[8px] border border-[var(--seller-rule)] bg-cover bg-center"
          style={{ backgroundImage: `url("${location.imageUrl}")` }}
        />
      ) : (
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-brand-soft)] text-[15px] font-bold text-[var(--seller-brand)]">
          {getInitials(location.namaUsaha) || "R"}
        </div>
      )}

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-flex rounded-md bg-[var(--seller-brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--seller-brand)]">
              {location.type === "vendor" ? "Partner Penampung" : "Tempat Penampung"}
            </span>
            <h3 className="mt-1 line-clamp-1 text-[14px] font-semibold text-[var(--seller-ink)]">
              {location.namaUsaha}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--seller-muted)]">
              {location.alamat || "Alamat belum tersedia"}
            </p>
          </div>
          {removable && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              aria-label="Hapus dari lokasi tersimpan"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[var(--seller-muted)] transition-colors hover:bg-[var(--seller-surface-2)] hover:text-[#ef476f] disabled:opacity-50"
            >
              <Icon icon="lucide:bookmark-x" width={16} height={16} />
            </button>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <a
            href={buildDirectionsUrl(location)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center gap-1.5 rounded-[7px] border border-[var(--seller-rule-strong)] px-2.5 text-[11px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
          >
            <Icon icon="lucide:navigation" width={13} height={13} />
            Petunjuk arah
          </a>
        </div>
      </div>
    </div>
  );
}
