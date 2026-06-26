"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import MapHeader from "./MapHeader";
import MapControls from "./MapControls";
import MapContainer from "./MapContainer";
import LocationDetailSheet from "./LocationDetailSheet";
import type { WasteLocation } from "../actions";

interface WasteMapClientProps {
  initialLocations: WasteLocation[];
}

export default function WasteMapClient({ initialLocations }: WasteMapClientProps) {
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // State untuk filter chips (null = tampilkan semua)
  const [activeFilter, setActiveFilter] = useState<'tps' | 'vendor' | null>(null);

  const activeLocation = activeLocationId 
    ? initialLocations.find(loc => loc.id === activeLocationId) || null
    : null;

  const handleMarkerClick = (locationId: string) => {
    setActiveLocationId(locationId);
    setIsSidebarCollapsed(false); 
  };

  const handleClearSelection = () => {
    setActiveLocationId(null);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleFilterChange = (filter: 'tps' | 'vendor' | null) => {
    setActiveFilter(filter);
    // Jika filter diubah, dan pin yang aktif tidak sesuai filter, bersihkan seleksi
    if (activeLocation) {
      if (filter !== null && activeLocation.type !== filter) {
        handleClearSelection();
      }
    }
  };

  // Filter markers untuk dirender
  const filteredLocations = activeFilter 
    ? initialLocations.filter(loc => loc.type === activeFilter)
    : initialLocations;

  return (
    <div className="relative w-full h-[100dvh] bg-white overflow-hidden flex">
      {/* Thin Left Sidebar */}
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
        {/* Header dengan Search dan Filter Chips */}
        <MapHeader 
          selectedLocationName={activeLocation?.namaUsaha || null}
          onClearSelection={handleClearSelection}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <MapControls />

        {/* Detail Sheet */}
        <div 
          className={`absolute top-0 left-0 h-full z-20 pointer-events-none transition-opacity duration-300 ${
            activeLocationId ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <LocationDetailSheet 
            location={activeLocation} 
            onClose={handleClearSelection} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Peta */}
        <MapContainer 
          locations={filteredLocations}
          onMarkerClick={handleMarkerClick} 
          activeLocationId={activeLocationId}
        />
      </div>
    </div>
  );
}
