"use client";

import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LocationCard, { type WasteLocation } from "./LocationCard";
import LocationModal from "./LocationModal";
import Filters from "./Filters";
import { deleteWasteLocationAction } from "../actions";

const WASTE_TYPES = ["Logam", "Plastik", "Kertas", "Organik", "Elektronik", "Kaca", "Tekstil"];
const PAGE_SIZE = 10;

interface WasteLocationsClientProps {
    initialLocations: WasteLocation[];
}

export default function WasteLocationsClient({ initialLocations }: WasteLocationsClientProps) {
    const router = useRouter();
    const [locations, setLocations] = useState<WasteLocation[]>(initialLocations);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedWasteType, setSelectedWasteType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Edit modal state only (add is handled by a dedicated page)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<WasteLocation | null>(null);

    // Sync with server data if it changes
    useEffect(() => {
        setLocations(initialLocations);
    }, [initialLocations]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedType, selectedWasteType]);

    // Filtering
    const filteredLocations = useMemo(() => {
        return locations.filter((loc) => {
            const matchesSearch =
                loc.namaUsaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (loc.alamat || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType ? loc.type === selectedType : true;
            const matchesWasteType = selectedWasteType ? (loc.jenisSampahDiterima || []).includes(selectedWasteType) : true;
            return matchesSearch && matchesType && matchesWasteType;
        });
    }, [locations, searchQuery, selectedType, selectedWasteType]);

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

    const handleDelete = async (id: string) => {
        try {
            await deleteWasteLocationAction(id);
            const updated = locations.filter((loc) => loc.id !== id);
            setLocations(updated);
            
            const newTotalPages = Math.ceil(updated.length / PAGE_SIZE);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
            router.refresh();
        } catch (err) {
            console.error("Gagal menghapus lokasi:", err);
            alert("Gagal menghapus lokasi dari database.");
        }
    };

    const handleSaveEdit = (updatedLoc: WasteLocation) => {
        setLocations((prev) =>
            prev.map((loc) => (loc.id === updatedLoc.id ? updatedLoc : loc))
        );
        router.refresh();
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
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedWasteType={selectedWasteType}
                    setSelectedWasteType={setSelectedWasteType}
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
                wasteTypes={WASTE_TYPES}
            />
        </div>
    );
}
