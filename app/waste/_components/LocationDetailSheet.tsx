"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import type { WasteLocation } from "../actions";

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS: Record<string, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday'
};

function parseTime(timeStr: string) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)[.:](\d+)\s*(am|pm)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const ampm = match[3]?.toLowerCase();
  
  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  
  return hours + (mins / 60);
}

function OperatingHoursSection({ hours }: { hours: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hours || typeof hours !== 'object') return null;

  const todayIndex = new Date().getDay();
  const todayKey = DAYS[todayIndex];
  const todaySchedule = hours[todayKey];

  let statusText = "Closed";
  let statusColor = "text-[#b31412]"; 
  let secondaryText = "";

  if (todaySchedule && !todaySchedule.isClosed && todaySchedule.open && todaySchedule.close) {
    const now = new Date();
    const currentTime = now.getHours() + (now.getMinutes() / 60);
    const openTime = parseTime(todaySchedule.open);
    const closeTime = parseTime(todaySchedule.close);

    if (currentTime >= openTime && currentTime < closeTime) {
      statusText = "Open";
      statusColor = "text-green-600";
      secondaryText = `· Closes ${todaySchedule.close}`;
    } else if (currentTime < openTime) {
      statusText = "Closed";
      secondaryText = `· Opens ${todaySchedule.open}`;
    } else {
      statusText = "Closed";
    }
  }

  return (
    <div className="flex items-start gap-4">
      <Icon icon="mdi:clock-outline" className="w-6 h-6 text-[#17458f] shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col">
        <div 
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <span className={`${statusColor} font-medium`}>{statusText}</span>
            {secondaryText && <span className="text-gray-900 ml-1">{secondaryText}</span>}
          </div>
          <Icon icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-5 h-5 text-gray-500" />
        </div>

        {isExpanded && (
          <div className="mt-3 flex flex-col gap-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((dayKey) => {
              const schedule = hours[dayKey];
              const isToday = dayKey === todayKey;
              
              let timeStr = "Closed";
              if (schedule && !schedule.isClosed && schedule.open && schedule.close) {
                 timeStr = `${schedule.open}–${schedule.close}`;
              }

              return (
                <div key={dayKey} className={`flex text-sm ${isToday ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                  <span className="w-28 shrink-0">{DAY_LABELS[dayKey]}</span>
                  <span className="flex-1">{timeStr}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const category = location.type
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
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
          <h2 className="font-open-sauce text-2xl font-bold text-gray-900">{title}</h2>
          
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 font-open-sauce">
            <Icon icon={isVendor ? "mdi:recycle" : "mdi:hospital-marker"} className="w-5 h-5 text-[#17458f]" />
            <span className="capitalize">{category}</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 text-sm font-bold font-open-sauce text-center transition-colors ${activeTab === "overview"
                ? "text-[#17458f] border-b-2 border-[#17458f]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 py-3 text-sm font-bold font-open-sauce text-center transition-colors ${activeTab === "about"
                ? "text-[#17458f] border-b-2 border-[#17458f]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              About
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6 font-open-sauce">
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                {/* Action Buttons */}
                <div className="flex justify-around border-b border-gray-100 pb-6 mt-4">
                  <button className="flex flex-col items-center gap-2 text-[#0b5c92] hover:opacity-80 transition-opacity">
                    <div className="bg-[#0b5c92] text-white p-3.5 rounded-full shadow-sm"><Icon icon="mdi:directions" className="w-6 h-6" /></div>
                    <span className="text-[13px] font-bold">Rute</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-[#0b5c92] hover:opacity-80 transition-opacity">
                    <div className="bg-[#82cdff] text-[#0b5c92] p-3.5 rounded-full shadow-sm"><Icon icon="mdi:bookmark-outline" className="w-6 h-6" /></div>
                    <span className="text-[13px] font-bold">Simpan</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-[#0b5c92] hover:opacity-80 transition-opacity">
                    <div className="bg-[#82cdff] text-[#0b5c92] p-3.5 rounded-full shadow-sm"><Icon icon="mdi:share-variant" className="w-6 h-6" /></div>
                    <span className="text-[13px] font-bold">Bagikan</span>
                  </button>
                  {location.teleponKontak && (
                    <button className="flex flex-col items-center gap-2 text-[#0b5c92] hover:opacity-80 transition-opacity">
                      <div className="bg-[#82cdff] text-[#0b5c92] p-3.5 rounded-full shadow-sm"><Icon icon="mdi:whatsapp" className="w-6 h-6" /></div>
                      <span className="text-[13px] font-bold">Kontak</span>
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

                  <OperatingHoursSection hours={location.operatingHours} />

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
