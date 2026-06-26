"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

interface MapHeaderProps {
  selectedLocationName: string | null;
  onClearSelection: () => void;
}

export default function MapHeader({ selectedLocationName, onClearSelection }: MapHeaderProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // State pencarian lokal (hanya dummy untuk UI)
  const [searchValue, setSearchValue] = useState("");

  const toggleFilter = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  // Nilai input bergantung pada apakah ada lokasi yang dipilih atau tidak
  const inputValue = selectedLocationName || searchValue;

  return (
    <div className="absolute top-4 left-0 w-full z-40 flex items-start pointer-events-none">
      
      {/* Kolom Kiri: Mengikuti lebar LocationDetailSheet (400px di desktop) agar Search Bar simetris di tengahnya */}
      <div className="w-full sm:w-[400px] flex justify-center shrink-0 px-4 sm:px-0">
        
        {/* Search Bar Container */}
        <div className="w-full sm:w-[360px] flex items-center gap-2 pointer-events-auto bg-white rounded-full shadow-md overflow-hidden">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari di peta..."
              value={inputValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-transparent py-3 pl-5 pr-10 outline-none font-poppins text-sm text-gray-700"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors">
              <Icon icon="mdi:magnify" className="w-5 h-5" />
            </button>
          </div>
          {/* Clear button (X) - Muncul jika ada input atau lokasi yang dipilih */}
          {inputValue && (
            <button 
              onClick={() => {
                setSearchValue("");
                onClearSelection();
              }}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors border-l border-gray-100"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Filter Chips yang melayang bebas di atas peta */}
      <div className="hidden sm:flex items-center gap-2 pointer-events-auto pl-4">
        <button
          onClick={() => toggleFilter("vendor")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-md text-sm font-poppins transition-colors border ${activeFilter === "vendor"
              ? "bg-[#17458f] text-white border-[#17458f]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <Icon icon="mdi:recycle" className={activeFilter === "vendor" ? "text-white" : "text-[#17458f]"} />
          Vendor
        </button>
        
        <button
          onClick={() => toggleFilter("tps")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-md text-sm font-poppins transition-colors border ${activeFilter === "tps"
              ? "bg-[#17458f] text-white border-[#17458f]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <Icon icon="mdi:storefront" className={activeFilter === "tps" ? "text-white" : "text-[#17458f]"} />
          TPS
        </button>
      </div>

    </div>
  );
}
