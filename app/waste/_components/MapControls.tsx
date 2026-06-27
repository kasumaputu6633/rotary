"use client";

import { Icon } from "@iconify/react";

interface MapControlsProps {
  isLocating?: boolean;
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function MapControls({
  isLocating = false,
  onLocate,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-10 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={onLocate}
        className="flex h-11 items-center gap-2 rounded-lg border border-[#d8deea] bg-white px-3.5 font-poppins text-sm font-semibold text-[#4b5563] shadow-[0_6px_12px_rgba(15,23,42,0.12)] transition hover:border-[#9eb8df] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px"
      >
        <Icon
          icon={isLocating ? "lucide:loader-2" : "lucide:locate-fixed"}
          className={`h-5 w-5 ${isLocating ? "animate-spin" : ""}`}
        />
        <span className="hidden sm:inline">Lokasi Saya</span>
      </button>

      <div className="flex flex-col overflow-hidden rounded-lg border border-[#d8deea] bg-white shadow-[0_6px_12px_rgba(15,23,42,0.12)]">
        <button
          type="button"
          onClick={onZoomIn}
          className="flex h-11 w-11 items-center justify-center border-b border-[#e6eaf0] text-[#4b5563] transition hover:bg-[#f8fafc] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17458f]"
          aria-label="Perbesar peta"
        >
          <Icon icon="lucide:plus" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="flex h-11 w-11 items-center justify-center text-[#4b5563] transition hover:bg-[#f8fafc] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17458f]"
          aria-label="Perkecil peta"
        >
          <Icon icon="lucide:minus" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
