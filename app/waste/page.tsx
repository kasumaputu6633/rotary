"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import MapHeader from "./_components/MapHeader";
import MapControls from "./_components/MapControls";
import MapContainer from "./_components/MapContainer";
import LocationDetailSheet from "./_components/LocationDetailSheet";

export default function WasteMapPage() {
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dummy data lookup for header
  const getLocationName = (id: string | null) => {
    if (id === "1") return "TPS Denpasar";
    if (id === "2") return "Mank Adi Bali Recycling Centre";
    return null;
  };

  const handleMarkerClick = (locationId: string) => {
    setActiveLocationId(locationId);
    setIsSidebarCollapsed(false); // Selalu buka panel saat marker baru diklik
  };

  const handleClearSelection = () => {
    setActiveLocationId(null);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-white overflow-hidden flex">
      {/* 
        Thin Left Sidebar (Selalu terlihat) 
      */}
      <div className="w-16 h-full bg-white shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 flex flex-col items-center py-4 gap-6 shrink-0 border-r border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Icon icon="mdi:menu" className="w-7 h-7 text-gray-700" />
        </Link>
        <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
          <Icon icon="mdi:bookmark-outline" className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
          <span className="text-[10px] font-poppins text-gray-500">Saved</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
          <Icon icon="mdi:history" className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
          <span className="text-[10px] font-poppins text-gray-500">Recents</span>
        </button>
      </div>

      <div className="relative flex-1 h-full overflow-hidden">
        {/* Floating UI Elements (Z-index tinggi agar selalu di atas LocationDetailSheet) */}
        <MapHeader 
          selectedLocationName={getLocationName(activeLocationId)}
          onClearSelection={handleClearSelection}
        />
        <MapControls />

        {/* Detail Sheet / Sidebar (muncul jika ada marker yang diklik) */}
        <div 
          className={`absolute top-0 left-0 h-full z-20 pointer-events-none transition-opacity duration-300 ${
            activeLocationId ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <LocationDetailSheet 
            locationId={activeLocationId} 
            onClose={handleClearSelection} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Komponen Peta Utama (Z-index paling rendah) */}
        <MapContainer 
          onMarkerClick={handleMarkerClick} 
          activeLocationId={activeLocationId}
        />
      </div>
    </div>
  );
}
