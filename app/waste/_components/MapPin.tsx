import { Icon } from "@iconify/react";
import type { MouseEvent } from "react";

interface MapPinProps {
  type: string;
  isSelected: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function MapPin({ type, isSelected, onClick }: MapPinProps) {
  const isTps = type === "tps";
  const isVendor = type === "vendor";
  const bgColor = isTps ? "bg-[#17458f]" : isVendor ? "bg-[#2f7d49]" : "bg-[#5543a9]";
  const icon = isTps ? "lucide:warehouse" : isVendor ? "lucide:recycle" : "lucide:building-2";
  const pinSize = isSelected ? "h-10 w-10" : isTps ? "h-8 w-8" : "h-7 w-7";
  const iconSize = isSelected ? "h-5 w-5" : isTps ? "h-4 w-4" : "h-3.5 w-3.5";

  if (isSelected) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="relative z-50 flex cursor-pointer flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
        aria-label="Pilih lokasi penampung"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#17458f] text-white shadow-[0_8px_12px_rgba(23,69,143,0.26)] ring-4 ring-[#f7a81b]/35">
          <Icon icon={icon} className="h-5 w-5" />
        </span>
        <span className="-mt-1 h-2.5 w-2.5 rotate-45 rounded-[2px] border-b border-r border-white bg-[#17458f]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 flex cursor-pointer flex-col items-center transition-transform duration-200 hover:z-50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
      aria-label="Pilih lokasi penampung"
    >
      <span
        className={`flex ${pinSize} items-center justify-center rounded-full border-2 border-white ${bgColor} text-white shadow-[0_6px_10px_rgba(15,23,42,0.18)]`}
      >
        <Icon icon={icon} className={iconSize} />
      </span>
      <span className={`-mt-1 h-2 w-2 rotate-45 rounded-[2px] border-b border-r border-white ${bgColor}`} />
    </button>
  );
}
