"use client";

import { Icon } from "@iconify/react";

export default function MapControls() {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 pointer-events-auto">
      {/* My Location Button */}
      <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-md hover:bg-gray-50 transition-colors font-poppins text-sm text-gray-700">
        <Icon icon="mdi:crosshairs-gps" className="w-5 h-5" />
        <span className="hidden sm:inline">Lokasi Saya</span>
      </button>

      {/* Zoom Controls */}
      <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden self-end">
        <button className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-center">
          <Icon icon="mdi:plus" className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center">
          <Icon icon="mdi:minus" className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
