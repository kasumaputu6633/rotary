"use client";

import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import LocationCard, { type WasteLocation } from "./LocationCard";
import LocationModal from "./LocationModal";
import Filters from "./Filters";

const DISTRICTS = ["Badung", "Bangli", "Buleleng", "Denpasar", "Gianyar", "Jembrana", "Karangasem", "Klungkung", "Tabanan"];
const WASTE_TYPES = ["Logam", "Plastik", "Kertas", "Organik", "Elektronik", "Kaca", "Tekstil"];

const DEFAULT_LOCATIONS: WasteLocation[] = [
    {
        id: "1",
        name: "Mang Adi Recycle",
        district: "Gianyar",
        address: "Kabupaten Gianyar, Bali 8058",
        operationalHours: "Senin - Jumat : 08.00 - 16.00",
        phone: "+62 982 876 124 12",
        wasteTypes: ["Logam", "Plastik", "Kertas"],
    },
    {
        id: "2",
        name: "Denpasar Waste Hub",
        district: "Denpasar",
        address: "Jalan Teuku Umar No. 102, Denpasar Barat",
        operationalHours: "Senin - Sabtu : 07.30 - 17.00",
        phone: "+62 812-3456-7890",
        wasteTypes: ["Plastik", "Kertas", "Kaca"],
    },
    {
        id: "3",
        name: "Badung Eco Depot",
        district: "Badung",
        address: "Jalan Sunset Road No. 88, Kuta, Badung",
        operationalHours: "Setiap Hari : 09.00 - 18.00",
        phone: "+62 821-9876-5432",
        wasteTypes: ["Organik", "Plastik", "Elektronik"],
    },
    {
        id: "4",
        name: "Tabanan Green Center",
        district: "Tabanan",
        address: "Jalan Pahlawan No. 45, Tabanan",
        operationalHours: "Senin - Jumat : 08.00 - 15.00",
        phone: "+62 857-3921-1122",
        wasteTypes: ["Organik", "Kertas"],
    },
    {
        id: "5",
        name: "Gianyar Clean Up Team",
        district: "Gianyar",
        address: "Jalan Bypass Dharma Giri No. 12, Gianyar",
        operationalHours: "Senin - Sabtu : 08.00 - 16.00",
        phone: "+62 813-5556-7788",
        wasteTypes: ["Logam", "Elektronik", "Plastik"],
    },
    {
        id: "6",
        name: "Eco Bali Recycle",
        district: "Badung",
        address: "Jalan Raya Canggu No. 24, Canggu, Badung",
        operationalHours: "Senin - Sabtu : 08.00 - 17.00",
        phone: "+62 361-9345-678",
        wasteTypes: ["Kertas", "Plastik", "Kaca", "Organik"],
    },
    {
        id: "7",
        name: "Jimbaran Waste Point",
        district: "Badung",
        address: "Jalan Uluwatu II, Jimbaran, Badung",
        operationalHours: "Senin - Jumat : 09.00 - 17.00",
        phone: "+62 878-1234-9988",
        wasteTypes: ["Plastik", "Logam"],
    },
    {
        id: "8",
        name: "Sanur Recovery Center",
        district: "Denpasar",
        address: "Jalan Danau Tamblingan No. 56, Sanur, Denpasar",
        operationalHours: "Setiap Hari : 08.00 - 20.00",
        phone: "+62 811-3829-102",
        wasteTypes: ["Kertas", "Kaca", "Organik", "Elektronik"],
    },
    {
        id: "9",
        name: "Klungkung Waste Station",
        district: "Klungkung",
        address: "Jalan Gajah Mada No. 89, Semarapura, Klungkung",
        operationalHours: "Senin - Jumat : 08.00 - 15.00",
        phone: "+62 851-0987-1234",
        wasteTypes: ["Plastik", "Kertas"],
    },
    {
        id: "10",
        name: "Singaraja Waste Solutions",
        district: "Buleleng",
        address: "Jalan Ngurah Rai No. 12, Singaraja, Buleleng",
        operationalHours: "Senin - Jumat : 09.00 - 16.00",
        phone: "+62 819-1234-5678",
        wasteTypes: ["Logam", "Plastik", "Kertas", "Organik", "Elektronik", "Kaca"],
    },
    {
        id: "11",
        name: "Karangasem Eco Center",
        district: "Karangasem",
        address: "Jalan Raya Candidasa, Karangasem",
        operationalHours: "Senin - Sabtu : 08.00 - 16.00",
        phone: "+62 813-7766-5544",
        wasteTypes: ["Plastik", "Organik"],
    }
];

const PAGE_SIZE = 10;

export default function WasteLocationsClient() {
    const [locations, setLocations] = useState<WasteLocation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWasteType, setSelectedWasteType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Edit modal state only (add is handled by a dedicated page)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<WasteLocation | null>(null);

    // Load locations from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("rotary_waste_locations");
        if (stored) {
            try {
                setLocations(JSON.parse(stored));
            } catch {
                setLocations(DEFAULT_LOCATIONS);
            }
        } else {
            setLocations(DEFAULT_LOCATIONS);
            localStorage.setItem("rotary_waste_locations", JSON.stringify(DEFAULT_LOCATIONS));
        }
    }, []);

    // Persist helpers
    const saveLocations = (newLocs: WasteLocation[]) => {
        setLocations(newLocs);
        localStorage.setItem("rotary_waste_locations", JSON.stringify(newLocs));
    };

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDistrict, selectedWasteType]);

    // Filtering
    const filteredLocations = useMemo(() => {
        return locations.filter((loc) => {
            const matchesSearch =
                loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.district.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDistrict = selectedDistrict ? loc.district === selectedDistrict : true;
            const matchesWasteType = selectedWasteType ? loc.wasteTypes.includes(selectedWasteType) : true;
            return matchesSearch && matchesDistrict && matchesWasteType;
        });
    }, [locations, searchQuery, selectedDistrict, selectedWasteType]);

    // Pagination slice
    const paginatedLocations = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredLocations.slice(start, start + PAGE_SIZE);
    }, [filteredLocations, currentPage]);

    const totalPages = Math.ceil(filteredLocations.length / PAGE_SIZE);

    // Handlers
    const handleEditClick = (loc: WasteLocation) => {
        setLocationToEdit(loc);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const updated = locations.filter((loc) => loc.id !== id);
        saveLocations(updated);
        const newTotalPages = Math.ceil(updated.length / PAGE_SIZE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }
    };

    const handleSaveEdit = (formData: Omit<WasteLocation, "id"> & { id?: string }) => {
        if (formData.id) {
            const updated = locations.map((loc) =>
                loc.id === formData.id ? (formData as WasteLocation) : loc
            );
            saveLocations(updated);
        }
    };

    const paginationButtons = useMemo(() => {
        if (totalPages <= 1) return null;
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 font-poppins text-[12px] text-gray-400">
                <span>Dashboard</span>
                <Icon icon="lucide:chevron-right" width={12} height={12} className="text-gray-300" />
                <span className="font-semibold text-[#17458f]">Lokasi</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-poppins text-2xl font-bold text-gray-900">
                        Waste Location
                    </h1>
                    <p className="mt-0.5 font-poppins text-sm text-gray-500">
                        Kelola lokasi pembuangan sampah, jam operasional, dan jenis sampah yang diterima.
                    </p>
                </div>

                {/* Tambah Lokasi → navigates to dedicated add page */}
                <Link
                    href="/admin/waste-locations/add"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f7a81b] to-[#e89a14] px-4 py-2.5 font-poppins text-[13px] font-bold text-white transition hover:opacity-95 shadow-md shadow-[#f7a81b]/15"
                >
                    <Icon icon="lucide:plus" width={16} height={16} />
                    <span>Tambah Lokasi</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <Filters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedWasteType={selectedWasteType}
                    setSelectedWasteType={setSelectedWasteType}
                    districts={DISTRICTS}
                    wasteTypes={WASTE_TYPES}
                />
            </div>

            {/* Location Cards */}
            <div className="space-y-4">
                {paginatedLocations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Icon icon="lucide:map-pin-off" width={40} height={40} className="text-gray-300" />
                            <p className="font-poppins text-sm font-semibold text-gray-500">
                                Tidak ada lokasi sampah yang ditemukan
                            </p>
                            <p className="font-poppins text-[12px] text-gray-400">
                                Coba sesuaikan kata kunci pencarian atau filter Anda.
                            </p>
                        </div>
                    </div>
                ) : (
                    paginatedLocations.map((loc) => (
                        <LocationCard
                            key={loc.id}
                            location={loc}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Footer & Pagination */}
            {filteredLocations.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 rounded-2xl px-5 py-4 shadow-sm">
                    <p className="font-poppins text-[12px] text-gray-400">
                        Menampilkan{" "}
                        {Math.min(filteredLocations.length, (currentPage - 1) * PAGE_SIZE + 1)}–
                        {Math.min(currentPage * PAGE_SIZE, filteredLocations.length)}{" "}
                        dari {filteredLocations.length} data
                    </p>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-poppins text-[12px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 select-none"
                            >
                                Sebelumnya
                            </button>

                            {paginationButtons?.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-poppins text-[13px] font-bold transition ${p === currentPage
                                            ? "bg-[#f7a81b] text-white shadow-sm shadow-[#f7a81b]/10"
                                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-poppins text-[12px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 select-none"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal (edit only — add uses dedicated page) */}
            <LocationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
                locationToEdit={locationToEdit}
                districts={DISTRICTS}
                wasteTypes={WASTE_TYPES}
            />
        </div>
    );
}
