"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { type WasteLocation } from "./LocationCard";
import { updateWasteLocationAction } from "../actions";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: WasteLocation) => void;
    locationToEdit?: WasteLocation | null;
    wasteTypes: string[];
}

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS_ID: Record<string, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu"
};

const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10 hover:border-gray-300";

const DEFAULT_HOURS = {
    monday: { open: "08:00", close: "17:00", isClosed: false },
    tuesday: { open: "08:00", close: "17:00", isClosed: false },
    wednesday: { open: "08:00", close: "17:00", isClosed: false },
    thursday: { open: "08:00", close: "17:00", isClosed: false },
    friday: { open: "08:00", close: "17:00", isClosed: false },
    saturday: { open: "08:00", close: "15:00", isClosed: false },
    sunday: { open: "08:00", close: "17:00", isClosed: true }
};

function parseOperatingHours(hours: any) {
    if (!hours || typeof hours !== "object") {
        return { selectedDays: ["monday", "tuesday", "wednesday", "thursday", "friday"], open: "08:00", close: "17:00" };
    }

    const selectedDays: string[] = [];
    let open = "08:00";
    let close = "17:00";
    let foundFirst = false;

    for (const day of DAY_KEYS) {
        const sched = hours[day];
        if (sched && !sched.isClosed) {
            selectedDays.push(day);
            if (!foundFirst && sched.open && sched.close) {
                open = sched.open;
                close = sched.close;
                foundFirst = true;
            }
        }
    }

    return {
        selectedDays: selectedDays.length > 0 ? selectedDays : ["monday", "tuesday", "wednesday", "thursday", "friday"],
        open,
        close,
    };
}

export default function LocationModal({
    isOpen,
    onClose,
    onSave,
    locationToEdit,
    wasteTypes,
}: LocationModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [type, setType]                             = useState<"tps" | "vendor">("tps");
    const [name, setName]                             = useState("");
    const [email, setEmail]                           = useState("");
    const [phone, setPhone]                           = useState("");
    const [address, setAddress]                       = useState("");
    const [website, setWebsite]                       = useState("");
    const [latitude, setLatitude]                     = useState("");
    const [longitude, setLongitude]                   = useState("");
    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
    
    // Operating hours state
    const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"]);
    const [openTime, setOpenTime] = useState("08:00");
    const [closeTime, setCloseTime] = useState("17:00");

    const operatingHours = useMemo(() => {
        const hours: any = {};
        for (const day of DAY_KEYS) {
            hours[day] = {
                open: openTime,
                close: closeTime,
                isClosed: !selectedDays.includes(day),
            };
        }
        return hours;
    }, [selectedDays, openTime, closeTime]);

    const [imageFile, setImageFile]                   = useState<File | null>(null);
    const [previewUrl, setPreviewUrl]                 = useState<string | null>(null);
    const [error, setError]                           = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting]             = useState(false);

    // Initialize/Reset form based on edit mode
    useEffect(() => {
        if (locationToEdit && isOpen) {
            setType(locationToEdit.type || "tps");
            setName(locationToEdit.namaUsaha || "");
            setEmail(locationToEdit.emailKontak || "");
            setPhone(locationToEdit.teleponKontak || "");
            setAddress(locationToEdit.alamat || "");
            setWebsite(locationToEdit.website || "");
            setLatitude(locationToEdit.latitude !== undefined && locationToEdit.latitude !== null ? String(locationToEdit.latitude) : "");
            setLongitude(locationToEdit.longitude !== undefined && locationToEdit.longitude !== null ? String(locationToEdit.longitude) : "");
            setSelectedWasteTypes(locationToEdit.jenisSampahDiterima || []);
            
            const parsedHours = parseOperatingHours(locationToEdit.operatingHours);
            setSelectedDays(parsedHours.selectedDays);
            setOpenTime(parsedHours.open);
            setCloseTime(parsedHours.close);

            setPreviewUrl(locationToEdit.imageUrl || null);
            setImageFile(null);
        } else {
            setName("");
            setEmail("");
            setPhone("");
            setAddress("");
            setWebsite("");
            setLatitude("");
            setLongitude("");
            setSelectedWasteTypes([]);
            setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
            setOpenTime("08:00");
            setCloseTime("17:00");
            setPreviewUrl(null);
            setImageFile(null);
        }
        setError(null);
    }, [locationToEdit, isOpen]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    // ── Image handlers ─────────────────────────────────────────────────────
    const handleFileSelect = (file: File) => {
        if (file.size > 10 * 1024 * 1024) { setError("Ukuran file melebihi 10 MB."); return; }
        setImageFile(file);
        setPreviewUrl((prev) => {
            if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
        setError(null);
    };

    const handleClearImage = () => {
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        setImageFile(null);
        setPreviewUrl(null);
    };

    function handleToggleWasteType(typeKey: string) {
        setSelectedWasteTypes((prev) =>
            prev.includes(typeKey)
                ? prev.filter((t) => t !== typeKey)
                : [...prev, typeKey]
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validation
        if (!previewUrl)              return setError("Gambar lokasi harus ada.");
        if (!type)                    return setError("Tipe lokasi harus dipilih.");
        if (!name.trim())             return setError("Nama lokasi harus diisi.");
        if (!phone.trim())            return setError("Nomor telepon harus diisi.");
        if (!address.trim())          return setError("Alamat detail harus diisi.");
        if (!latitude.trim())         return setError("Latitude harus diisi.");
        if (!longitude.trim())        return setError("Longitude harus diisi.");
        if (selectedWasteTypes.length === 0) {
            return setError("Pilih minimal satu jenis sampah yang diterima.");
        }

        // Coordinate checks
        if (isNaN(parseFloat(latitude))) return setError("Latitude harus berupa angka.");
        if (isNaN(parseFloat(longitude))) return setError("Longitude harus berupa angka.");

        if (!locationToEdit?.id) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("namaUsaha", name.trim());
            formData.append("emailKontak", email.trim());
            formData.append("teleponKontak", phone.trim());
            formData.append("alamat", address.trim());
            formData.append("website", website.trim());
            formData.append("latitude", latitude.trim());
            formData.append("longitude", longitude.trim());
            formData.append("jenisSampahDiterima", JSON.stringify(selectedWasteTypes));
            formData.append("operatingHours", JSON.stringify(operatingHours));
            
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (locationToEdit.imageUrl) {
                formData.append("currentImageUrl", locationToEdit.imageUrl);
            }

            await updateWasteLocationAction(locationToEdit.id, formData);

            // Fetch absolute URL or updated details
            const updatedLoc: WasteLocation = {
                ...locationToEdit,
                type,
                namaUsaha: name.trim(),
                emailKontak: email.trim() || null,
                teleponKontak: phone.trim(),
                alamat: address.trim(),
                website: website.trim() || null,
                latitude: parseFloat(latitude.trim()),
                longitude: parseFloat(longitude.trim()),
                jenisSampahDiterima: selectedWasteTypes,
                operatingHours,
                imageUrl: imageFile ? previewUrl : locationToEdit.imageUrl,
            };

            onSave(updatedLoc);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Gagal memperbarui data lokasi.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-[3px]"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div
                className="relative w-full max-w-[550px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header line strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#f7a81b] to-[#e89a14] shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                    <h3 className="font-poppins text-base font-bold text-gray-900">
                        Edit Lokasi Sampah
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
                    >
                        <Icon icon="lucide:x" width={18} height={18} />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Error display */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-semibold font-poppins flex items-center gap-2">
                            <Icon icon="lucide:alert-circle" width={14} height={14} />
                            {error}
                        </div>
                    )}

                    {/* Image Preview & Upload */}
                    <div className="space-y-2">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Gambar Lokasi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative h-44 w-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <>
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl bg-white/90 px-3 py-1.5 font-poppins text-[11px] font-bold text-gray-800 hover:bg-white transition shadow">
                                            <Icon icon="lucide:pencil" width={12} height={12} className="inline mr-1" />Ganti
                                        </button>
                                        <button type="button" onClick={handleClearImage}
                                            className="rounded-xl bg-red-500/90 px-3 py-1.5 font-poppins text-[11px] font-bold text-white hover:bg-red-600 transition shadow">
                                            <Icon icon="lucide:trash-2" width={12} height={12} className="inline mr-1" />Hapus
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition">
                                    <Icon icon="lucide:image" width={32} height={32} />
                                    <span className="font-poppins text-[12px] font-semibold">Unggah Gambar</span>
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/png,image/jpg,image/jpeg,image/webp" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    </div>

                    {/* Radio Tipe Lokasi */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Tipe Lokasi <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                                type === "tps" 
                                    ? "border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545] font-bold" 
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}>
                                <input type="radio" name="modal-type" value="tps" checked={type === "tps"} onChange={() => setType("tps")} className="hidden" />
                                <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${type === "tps" ? "border-[#0B2545]" : "border-gray-300"}`}>
                                    {type === "tps" && <div className="h-2 w-2 rounded-full bg-[#0B2545]" />}
                                </div>
                                <span className="font-poppins text-[12px]">TPS</span>
                            </label>
                            
                            <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                                type === "vendor" 
                                    ? "border-[#E53E3E] bg-[#E53E3E]/5 text-[#E53E3E] font-bold" 
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}>
                                <input type="radio" name="modal-type" value="vendor" checked={type === "vendor"} onChange={() => setType("vendor")} className="hidden" />
                                <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${type === "vendor" ? "border-[#E53E3E]" : "border-gray-300"}`}>
                                    {type === "vendor" && <div className="h-2 w-2 rounded-full bg-[#E53E3E]" />}
                                </div>
                                <span className="font-poppins text-[12px]">Vendor</span>
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Nama Lokasi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Misal: Mang Adi Recycle"
                            className={inputCls}
                            required
                        />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Email Kontak
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="kontak@daurulang.com"
                                className={inputCls}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Nomor Telepon / Kontak <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Misal: +62 812-3456-7890"
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>

                    {/* Latitude, Longitude, Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Latitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                placeholder="-8.6500"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Longitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                placeholder="115.2166"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-1">
                            <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                Website
                            </label>
                            <input
                                type="text"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="daurulang.com"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Address Detail */}
                    <div className="space-y-1.5">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Alamat Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Tuliskan alamat jalan, RT/RW, kode pos..."
                            className={inputCls}
                            required
                        />
                    </div>

                    {/* Waste Types accepted */}
                    <div className="space-y-2">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Jenis Sampah yang Diterima <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {wasteTypes.map((typeKey) => {
                                const isSelected = selectedWasteTypes.includes(typeKey);
                                return (
                                    <button
                                        type="button"
                                        key={typeKey}
                                        onClick={() => handleToggleWasteType(typeKey)}
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
                                        {typeKey}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Jam Operasional */}
                    <div className="space-y-2 pt-2">
                        <label className="block font-poppins text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                            Jam Operasional <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                            <div className="space-y-1.5">
                                <label className="block font-poppins text-[11px] font-semibold text-gray-500">Hari Operasional</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {DAY_KEYS.map((day) => {
                                        const isSelected = selectedDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setSelectedDays(prev =>
                                                    prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                                )}
                                                className={`rounded-lg px-2.5 py-1.5 font-poppins text-[12px] font-semibold transition select-none ${
                                                    isSelected
                                                        ? "bg-[#17458f] text-white shadow-sm"
                                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                                }`}
                                            >
                                                {DAY_LABELS_ID[day]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block font-poppins text-[11px] font-semibold text-gray-500">Jam Buka</label>
                                    <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)}
                                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                        className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-poppins text-[11px] font-semibold text-gray-500">Jam Tutup</label>
                                    <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)}
                                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                        className={inputCls} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 font-poppins text-[13px] font-semibold text-gray-600 bg-white transition hover:bg-gray-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#f7a81b] hover:bg-[#e89a14] px-5 py-2.5 font-poppins text-[13px] font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-[#f7a81b]/10 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Icon icon="lucide:loader-2" className="animate-spin" width={14} height={14} />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Icon icon="lucide:save" width={14} height={14} />
                                Simpan Lokasi
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
