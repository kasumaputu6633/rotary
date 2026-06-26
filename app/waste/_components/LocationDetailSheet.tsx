"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import type { WasteLocation } from "../actions";

interface LocationDetailSheetProps {
  location: WasteLocation | null;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function LocationDetailSheet({ location, onClose, isCollapsed, onToggleCollapse }: LocationDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "about">("overview");

  if (!location) return null;

  const isVendor = location.type === "vendor";
  const title = location.namaUsaha;
  const category = isVendor ? "Vendor" : "TPS";
  
  // Format rating: jika ada rating tampilkan 1 desimal, jika tidak kosongkan
  const ratingDisplay = location.rating ? location.rating.toFixed(1) : null;
  const reviewCount = location.reviewCount || 0;
  
  // Ambil gambar dari DB atau pakai default image
  const coverImage = location.imageUrl || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop";

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
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col">
          <h2 className="font-roboto-serif text-2xl font-bold text-gray-900">{title}</h2>
          
          {/* Rating Section */}
          {(ratingDisplay || reviewCount > 0) && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 font-poppins">
              {ratingDisplay && <span className="text-amber-500 font-bold">{ratingDisplay}</span>}
              <div className="flex text-amber-500">
                <Icon icon="mdi:star" className="w-4 h-4" />
                <Icon icon="mdi:star" className="w-4 h-4" />
                <Icon icon="mdi:star" className="w-4 h-4" />
                <Icon icon="mdi:star" className="w-4 h-4" />
                <Icon icon="mdi:star-outline" className="w-4 h-4" />
              </div>
              <span>({reviewCount.toLocaleString()})</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 font-poppins">
            <Icon icon={isVendor ? "mdi:recycle" : "mdi:hospital-marker"} className="w-5 h-5 text-[#17458f]" />
            <span className="capitalize">{category}</span>
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
                  {location.teleponKontak && (
                    <button className="flex flex-col items-center gap-2 text-[#17458f] hover:text-blue-800">
                      <div className="bg-blue-50 p-3 rounded-full"><Icon icon="mdi:phone" className="w-6 h-6" /></div>
                      <span className="text-xs font-bold">Call</span>
                    </button>
                  )}
                </div>

                {/* Info Rows */}
                <div className="flex flex-col gap-5 text-sm text-gray-700">
                  {location.alamat && (
                    <div className="flex items-start gap-4">
                      <Icon icon="mdi:map-marker-outline" className="w-6 h-6 text-[#17458f] shrink-0" />
                      <p>{location.alamat}</p>
                    </div>
                  )}

                  {location.operatingHours && (
                    <div className="flex items-center gap-4">
                      <Icon icon="mdi:clock-outline" className="w-6 h-6 text-[#17458f] shrink-0" />
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <span className="text-gray-900">{location.operatingHours}</span>
                        </div>
                        <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {location.emailKontak && (
                    <div className="flex items-center gap-4">
                      <Icon icon="mdi:email-outline" className="w-6 h-6 text-[#17458f] shrink-0" />
                      <p className="text-blue-600 hover:underline cursor-pointer">{location.emailKontak}</p>
                    </div>
                  )}
                  
                  {location.website && (
                    <div className="flex items-center gap-4">
                      <Icon icon="mdi:web" className="w-6 h-6 text-[#17458f] shrink-0" />
                      <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline cursor-pointer">
                        {location.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Menerima Sampah</h3>
                <div className="grid grid-cols-2 gap-4">
                  {location.jenisSampahDiterima && location.jenisSampahDiterima.length > 0 ? (
                    location.jenisSampahDiterima.map((jenis, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                        <Icon icon="mdi:check" className="w-5 h-5 text-green-600" />
                        <span className="capitalize">{jenis}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 col-span-2">Belum ada informasi jenis sampah yang diterima.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
