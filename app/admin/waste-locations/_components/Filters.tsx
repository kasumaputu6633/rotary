"use client";

import { Icon } from "@iconify/react";

interface FiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedDistrict: string;
    setSelectedDistrict: (district: string) => void;
    selectedWasteType: string;
    setSelectedWasteType: (type: string) => void;
    districts: string[];
    wasteTypes: string[];
}

export default function Filters({
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    setSelectedDistrict,
    selectedWasteType,
    setSelectedWasteType,
    districts,
    wasteTypes,
}: FiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Icon
                    icon="lucide:search"
                    width={15}
                    height={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama lokasi, alamat..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <Icon icon="lucide:x" width={14} height={14} />
                    </button>
                )}
            </div>

            {/* Filter District */}
            <div className="relative">
                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-10 font-poppins text-[13px] font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                >
                    <option value="">Semua Wilayah</option>
                    {districts.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
                <Icon
                    icon="lucide:chevron-down"
                    width={14}
                    height={14}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
            </div>

            {/* Filter Waste Type */}
            <div className="relative">
                <select
                    value={selectedWasteType}
                    onChange={(e) => setSelectedWasteType(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-10 font-poppins text-[13px] font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                >
                    <option value="">Semua Jenis Sampah</option>
                    {wasteTypes.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
                <Icon
                    icon="lucide:chevron-down"
                    width={14}
                    height={14}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
            </div>
        </div>
    );
}
