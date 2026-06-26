"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { type WasteLocation } from "./LocationCard";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: Omit<WasteLocation, "id"> & { id?: string }) => void;
    locationToEdit?: WasteLocation | null;
    districts: string[];
    wasteTypes: string[];
}

export default function LocationModal({
    isOpen,
    onClose,
    onSave,
    locationToEdit,
    districts,
    wasteTypes,
}: LocationModalProps) {
    const [name, setName] = useState("");
    const [district, setDistrict] = useState("");
    const [address, setAddress] = useState("");
    const [operationalHours, setOperationalHours] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Initialize/Reset form based on add vs edit mode
    useEffect(() => {
        if (locationToEdit) {
            setName(locationToEdit.name);
            setDistrict(locationToEdit.district);
            setAddress(locationToEdit.address);
            setOperationalHours(locationToEdit.operationalHours);
            setPhone(locationToEdit.phone);
            setSelectedWasteTypes(locationToEdit.wasteTypes);
            setImageUrl(locationToEdit.imageUrl ?? "");
        } else {
            setName("");
            setDistrict("");
            setAddress("");
            setOperationalHours("");
            setPhone("");
            setSelectedWasteTypes([]);
            setImageUrl("");
        }
        setError(null);
    }, [locationToEdit, isOpen]);

    if (!isOpen) return null;

    function handleToggleWasteType(type: string) {
        setSelectedWasteTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validation
        if (!name.trim()) return setError("Nama lokasi harus diisi.");
        if (!district) return setError("Kabupaten/Kota harus dipilih.");
        if (!address.trim()) return setError("Alamat detail harus diisi.");
        if (!operationalHours.trim()) return setError("Jam operasional harus diisi.");
        if (!phone.trim()) return setError("Nomor telepon harus diisi.");
        if (selectedWasteTypes.length === 0) {
            return setError("Pilih minimal satu jenis sampah yang diterima.");
        }

        onSave({
            id: locationToEdit?.id,
            name: name.trim(),
            district,
            address: address.trim(),
            operationalHours: operationalHours.trim(),
            phone: phone.trim(),
            wasteTypes: selectedWasteTypes,
            imageUrl: imageUrl.trim() || undefined,
        });

        onClose();
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-[3px]"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div
                className="relative my-8 w-full max-w-[520px] rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header line strip using the logo's orange color */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#f7a81b] to-[#e89a14]" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="font-poppins text-base font-bold text-gray-900">
                        {locationToEdit ? "Edit Lokasi Sampah" : "Tambah Lokasi Baru"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
                    >
                        <Icon icon="lucide:x" width={18} height={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error display */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-semibold font-poppins flex items-center gap-2">
                            <Icon icon="lucide:alert-circle" width={14} height={14} />
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Nama Lokasi
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Misal: Mang Adi Recycle"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                        />
                    </div>

                    {/* District */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Kabupaten / Kota
                        </label>
                        <div className="relative">
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                            >
                                <option value="" disabled>Pilih Kabupaten/Kota</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                            <Icon
                                icon="lucide:chevron-down"
                                width={16}
                                height={16}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Address Detail */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Detail Alamat
                        </label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Tuliskan alamat jalan, RT/RW, kode pos..."
                            className="w-full h-18 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                        />
                    </div>

                    {/* Hours & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Jam Operasional
                            </label>
                            <input
                                type="text"
                                value={operationalHours}
                                onChange={(e) => setOperationalHours(e.target.value)}
                                placeholder="Misal: Senin - Jumat : 08.00 - 16.00"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Nomor Telepon
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Misal: +62 812-3456-7890"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                            />
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            URL Gambar Lokasi (Opsional)
                        </label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10"
                        />
                    </div>

                    {/* Waste Types accepted */}
                    <div className="space-y-2">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Jenis Sampah yang Diterima
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {wasteTypes.map((type) => {
                                const isSelected = selectedWasteTypes.includes(type);
                                return (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => handleToggleWasteType(type)}
                                        className={`inline-flex items-center gap-1.5 border rounded-xl px-3 py-1.5 font-poppins text-[12px] font-semibold transition select-none ${
                                            isSelected
                                                ? "bg-[#17458f] text-white border-[#17458f] shadow-sm shadow-[#17458f]/10"
                                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
                                        }`}
                                    >
                                        <Icon
                                            icon={isSelected ? "lucide:check" : "lucide:plus"}
                                            width={12}
                                            height={12}
                                        />
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 font-poppins text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#f7a81b] hover:bg-[#e89a14] px-5 py-2.5 font-poppins text-[13px] font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-[#f7a81b]/10"
                        >
                            <Icon icon="lucide:save" width={14} height={14} />
                            Simpan Lokasi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
