"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import MapHeader from "./_components/MapHeader";
import MapControls from "./_components/MapControls";
import MapContainer from "./_components/MapContainer";
import LocationDetailSheet from "./_components/LocationDetailSheet";

// Pindahkan dummy data ke level page agar bisa digunakan oleh MapHeader (untuk filter) dan MapContainer
const dummyMarkers: Array<{id: string, lat: number, lng: number, type: 'tps' | 'vendor', name: string, labelPosition?: 'left' | 'right'}> = [
  { id: "1", lat: -8.5, lng: 115.2, type: "tps", name: "TPS Denpasar" },
  { id: "2", lat: -8.4, lng: 115.1, type: "vendor", name: "Vendor Tabanan" },
  { id: "3", lat: -8.498, lng: 115.202, type: "tps", name: "TPS Kesiman Kertalangu", labelPosition: "left" },
  { id: "4", lat: -8.6, lng: 115.2, type: "vendor", name: "Bank Sampah Sesetan" },
  { id: "5", lat: -8.65, lng: 115.15, type: "tps", name: "TPS Kuta" },
  { id: "6", lat: -8.55, lng: 115.25, type: "vendor", name: "Vendor Sanur", labelPosition: "left" },
  { id: "7", lat: -8.45, lng: 115.18, type: "tps", name: "TPS Mengwi" },
  { id: "8", lat: -8.52, lng: 115.22, type: "vendor", name: "Pengepul Plastik Jaya" },
];

export default function WasteMapPage() {
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // State untuk filter chips (null = tampilkan semua)
  const [activeFilter, setActiveFilter] = useState<'tps' | 'vendor' | null>(null);

  const getLocationName = (id: string | null) => {
    if (!id) return null;
    return dummyMarkers.find(m => m.id === id)?.name || null;
  };

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
    if (activeLocationId) {
      const activeMarker = dummyMarkers.find(m => m.id === activeLocationId);
      if (activeMarker && filter !== null && activeMarker.type !== filter) {
        handleClearSelection();
      }
    }
  };

  // Filter markers untuk dirender
  const filteredMarkers = activeFilter 
    ? dummyMarkers.filter(m => m.type === activeFilter)
    : dummyMarkers;

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
          selectedLocationName={getLocationName(activeLocationId)}
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
            locationId={activeLocationId} 
            onClose={handleClearSelection} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Peta */}
        <MapContainer 
          markers={filteredMarkers}
          onMarkerClick={handleMarkerClick} 
          activeLocationId={activeLocationId}
        />
      </div>
    </div>
  );
}
