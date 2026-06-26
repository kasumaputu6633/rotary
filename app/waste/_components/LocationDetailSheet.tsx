"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

interface LocationDetailSheetProps {
  locationId: string | null;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function LocationDetailSheet({ locationId, onClose, isCollapsed, onToggleCollapse }: LocationDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "about">("overview");

  if (!locationId) return null;

  // Dummy data
  const isVendor = locationId === "2";
  const title = isVendor ? "Vendor Tabanan" : "Mank Adi Bali Recycle Centre";
  const category = isVendor ? "Vendor" : "Recycling Center";

  return (
    <div className={`relative h-full w-full sm:w-[400px] bg-white shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>

      {/* Collapse/Expand Toggle Button (Attached to the right edge) */}
      <button
        onClick={onToggleCollapse}
        className={`absolute top-1/2 -translate-y-1/2 -right-6 w-6 h-12 bg-white rounded-r-lg shadow-[2px_0_4px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors z-30 pointer-events-auto`}
        title={isCollapsed ? "Expand side panel" : "Collapse side panel"}
      >
        <Icon icon={isCollapsed ? "mdi:menu-right" : "mdi:menu-left"} className="w-6 h-6" />
      </button>

      {/* Close button (top right inside the panel) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
      >
        <Icon icon="mdi:close" className="w-5 h-5" />
      </button>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image */}
        <div className="w-full h-48 bg-gray-200 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop"
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col">
          <h2 className="font-roboto-serif text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 font-poppins">
            <span className="text-amber-500 font-bold">4.2</span>
            <div className="flex text-amber-500">
              <Icon icon="mdi:star" className="w-4 h-4" />
              <Icon icon="mdi:star" className="w-4 h-4" />
              <Icon icon="mdi:star" className="w-4 h-4" />
              <Icon icon="mdi:star" className="w-4 h-4" />
              <Icon icon="mdi:star-outline" className="w-4 h-4" />
            </div>
            <span>(1,659)</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 font-poppins">
            <Icon icon={isVendor ? "mdi:recycle" : "mdi:hospital-marker"} className="w-5 h-5 text-[#17458f]" />
            <span>{category}</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 text-sm font-bold font-poppins text-center transition-colors ${activeTab === "overview"
                ? "text-[#17458f] border-b-2 border-[#17458f]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 py-3 text-sm font-bold font-poppins text-center transition-colors ${activeTab === "about"
                ? "text-[#17458f] border-b-2 border-[#17458f]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              About
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6 font-poppins">
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                {/* Action Buttons */}
                <div className="flex justify-around border-b border-gray-100 pb-6">
                  <button className="flex flex-col items-center gap-2 text-[#17458f] hover:text-blue-800">
                    <div className="bg-[#17458f] text-white p-3 rounded-full"><Icon icon="mdi:directions" className="w-6 h-6" /></div>
                    <span className="text-xs font-bold">Directions</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-[#17458f] hover:text-blue-800">
                    <div className="bg-blue-50 p-3 rounded-full"><Icon icon="mdi:bookmark-outline" className="w-6 h-6" /></div>
                    <span className="text-xs font-bold">Save</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-[#17458f] hover:text-blue-800">
                    <div className="bg-blue-50 p-3 rounded-full"><Icon icon="mdi:share-variant-outline" className="w-6 h-6" /></div>
                    <span className="text-xs font-bold">Share</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-[#17458f] hover:text-blue-800">
                    <div className="bg-blue-50 p-3 rounded-full"><Icon icon="mdi:cellphone" className="w-6 h-6" /></div>
                    <span className="text-xs font-bold">Send to phone</span>
                  </button>
                </div>

                {/* Info Rows */}
                <div className="flex flex-col gap-5 text-sm text-gray-700">
                  <div className="flex items-start gap-4">
                    <Icon icon="mdi:map-marker-outline" className="w-6 h-6 text-[#17458f] shrink-0" />
                    <p>Jl. Ir Sutami, Batuan, Kec. Sukawati, Kabupaten Gianyar, Bali 80582</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Icon icon="mdi:clock-outline" className="w-6 h-6 text-[#17458f] shrink-0" />
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <span className="text-green-600 font-bold mr-2">Open</span>
                        <span>· Closes 12.00 am</span>
                      </div>
                      <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Icon icon="mdi:web" className="w-6 h-6 text-[#17458f] shrink-0" />
                    <p className="text-blue-600 hover:underline cursor-pointer">localhost.com</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Recycling</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Icon icon="mdi:check" className="w-5 h-5 text-black" />
                    <span>Plastik</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Icon icon="mdi:check" className="w-5 h-5 text-black" />
                    <span>Kertas</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Icon icon="mdi:check" className="w-5 h-5 text-black" />
                    <span>Kaca</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Icon icon="mdi:check" className="w-5 h-5 text-black" />
                    <span>Residu</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
