"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { createWasteLocationAction } from "../actions";
import { formatOperatingHours } from "../_components/LocationCard";

// ─── Constants ───────────────────────────────────────────────────────────────

const WASTE_TYPES = [
    { key: "Plastik",    icon: "lucide:recycle",   bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-600",   iconColor: "text-blue-400"   },
    { key: "Logam",      icon: "lucide:hammer",    bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  iconColor: "text-slate-400"  },
    { key: "Kertas",     icon: "lucide:file-text", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  iconColor: "text-amber-500"  },
    { key: "Tekstil",    icon: "lucide:shirt",     bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", iconColor: "text-purple-400" },
    { key: "Elektronik", icon: "lucide:cpu",       bg: "bg-green-50",  border: "border-green-200",  text: "text-green-600",  iconColor: "text-green-400"  },
    { key: "Organik",    icon: "lucide:leaf",      bg: "bg-lime-50",   border: "border-lime-200",   text: "text-lime-700",   iconColor: "text-lime-500"   },
    { key: "Kaca",       icon: "lucide:sparkles",  bg: "bg-cyan-50",   border: "border-cyan-200",   text: "text-cyan-600",   iconColor: "text-cyan-400"   },
];

const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-open-sauce text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10 hover:border-gray-300";

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

// ─── Live Preview Card ────────────────────────────────────────────────────────

function LivePreview({
    name, type, address, operatingHours, phone, email, website, latitude, longitude,
    selectedWasteTypes, previewUrl,
}: {
    name: string; type: "tps" | "vendor"; address: string;
    operatingHours: any; phone: string; email: string; website: string; latitude: string; longitude: string;
    selectedWasteTypes: string[]; previewUrl: string | null;
}) {
    const isEmpty = !name && !address && !phone && selectedWasteTypes.length === 0 && !previewUrl;

    const formattedHours = useMemo(() => {
        return formatOperatingHours(operatingHours);
    }, [operatingHours]);

    return (
        <div className="sticky top-6 space-y-3">
            {/* Label */}
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#f7a81b]" />
                <p className="font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Preview Real-time
                </p>
            </div>

            {/* Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                {/* Image area */}
                <div className="relative h-44 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                            <Icon icon="lucide:image" width={36} height={36} />
                            <span className="font-open-sauce text-[11px]">Foto belum diunggah</span>
                        </div>
                    )}
                    {previewUrl && (
                        <div className="absolute bottom-2 right-2 rounded-lg bg-black/40 px-2 py-1 font-open-sauce text-[10px] font-semibold text-white backdrop-blur-sm">
                            Foto Lokasi
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {isEmpty ? (
                        <div className="py-6 text-center">
                            <Icon icon="lucide:pencil-line" width={28} height={28} className="mx-auto text-gray-200" />
                            <p className="mt-2 font-open-sauce text-[11px] text-gray-300">
                                Isi form untuk melihat preview
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Name & Type */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="font-open-sauce text-[15px] font-bold text-gray-900 leading-snug truncate">
                                        {name || <span className="italic text-gray-300 font-normal text-[13px]">Nama lokasi...</span>}
                                    </h3>
                                    {address && (
                                        <p className="mt-0.5 flex items-center gap-1.5 font-open-sauce text-[11px] font-semibold text-[#17458f] truncate">
                                            <Icon icon="lucide:map-pin" width={11} height={11} className="shrink-0" />
                                            {address}
                                        </p>
                                    )}
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-open-sauce text-[9px] font-bold text-white uppercase select-none ${
                                    type === "tps" ? "bg-[#0B2545]" : "bg-[#E53E3E]"
                                }`}>
                                    {type}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100" />

                            {/* Info rows */}
                            <div className="space-y-2">
                                {formattedHours && formattedHours !== "-" && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:clock" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-open-sauce text-[11px] text-gray-600 leading-relaxed">{formattedHours}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:phone" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-open-sauce text-[11px] text-gray-600">{phone}</span>
                                    </div>
                                )}
                                {email && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:mail" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-open-sauce text-[11px] text-gray-600 truncate">{email}</span>
                                    </div>
                                )}
                                {website && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:globe" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-open-sauce text-[11px] text-gray-600 truncate">{website}</span>
                                    </div>
                                )}
                                {(latitude || longitude) && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:compass" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-open-sauce text-[11px] text-gray-500 truncate">
                                            {latitude || "0"}, {longitude || "0"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Waste type badges */}
                            {selectedWasteTypes.length > 0 && (
                                <>
                                    <div className="h-px bg-gray-100" />
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedWasteTypes.map((t) => {
                                            const meta = WASTE_TYPES.find((w) => w.key === t);
                                            return (
                                                <span
                                                    key={t}
                                                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-open-sauce text-[10px] font-semibold ${meta ? `${meta.bg} ${meta.border} ${meta.text}` : "bg-gray-50 border-gray-200 text-gray-600"}`}
                                                >
                                                    {meta && <Icon icon={meta.icon} width={10} height={10} className={meta.iconColor} />}
                                                    {t}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <p className="font-open-sauce text-[10.5px] text-gray-400 text-center leading-relaxed">
                Preview ini menampilkan tampilan kartu lokasi<br />sebelum disimpan.
            </p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddLocationClient() {
    const router = useRouter();
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
    const [isDragging, setIsDragging]                 = useState(false);
    const [error, setError]                           = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting]             = useState(false);
    const [isSuccess, setIsSuccess]                   = useState(false);

    // ── Image handlers ─────────────────────────────────────────────────────
    const handleFileSelect = useCallback((file: File) => {
        if (file.size > 10 * 1024 * 1024) { setError("Ukuran file melebihi 10 MB."); return; }
        setImageFile(file);
        setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
        setError(null);
    }, []);

    const handleClearImage = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageFile(null);
        setPreviewUrl(null);
    };

    const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop      = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) handleFileSelect(file);
    };

    const toggleWasteType = (key: string) =>
        setSelectedWasteTypes((p) => p.includes(key) ? p.filter((t) => t !== key) : [...p, key]);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!imageFile)               return setError("Gambar lokasi harus diunggah.");
        if (!type)                    return setError("Tipe lokasi harus dipilih.");
        if (!selectedWasteTypes.length) return setError("Pilih minimal satu jenis sampah.");
        if (!name.trim())             return setError("Nama lokasi harus diisi.");
        if (!phone.trim())            return setError("Kontak harus diisi.");
        if (!address.trim())          return setError("Alamat harus diisi.");
        if (!latitude.trim())         return setError("Latitude harus diisi.");
        if (!longitude.trim())        return setError("Longitude harus diisi.");

        // Coordinate checks
        if (isNaN(parseFloat(latitude))) return setError("Latitude harus berupa angka.");
        if (isNaN(parseFloat(longitude))) return setError("Longitude harus berupa angka.");

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
            formData.append("image", imageFile);

            await createWasteLocationAction(formData);

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/admin/waste-locations");
                router.refresh();
            }, 1200);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Gagal menyimpan data lokasi ke database.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 font-open-sauce text-[12px] text-gray-400">
                <span>Dashboard</span>
                <Icon icon="lucide:chevron-right" width={12} height={12} className="text-gray-300" />
                <Link href="/admin/waste-locations" className="hover:text-[#17458f] transition-colors">Lokasi</Link>
                <Icon icon="lucide:chevron-right" width={12} height={12} className="text-gray-300" />
                <span className="font-semibold text-[#17458f]">Tambah Lokasi</span>
            </nav>

            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-open-sauce text-2xl font-bold text-gray-900">Tambah Lokasi</h1>
                    <p className="mt-0.5 font-open-sauce text-sm text-gray-500">
                        Lengkapi data di bawah ini untuk menambahkan lokasi penampungan sampah baru ke database.
                    </p>
                </div>
                <Link
                    href="/admin/waste-locations"
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 font-open-sauce text-[13px] font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
                >
                    <Icon icon="lucide:arrow-left" width={14} height={14} />
                    Kembali
                </Link>
            </div>

            {/* ─── Two-column layout: Form (left) + Preview (right) ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

                {/* ══ FORM COLUMN ══════════════════════════════════════════ */}
                <form onSubmit={handleSubmit}>
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">

                        {/* Feedback banners */}
                        {error && (
                            <div className="flex items-center gap-2 px-6 py-3 bg-red-50 font-open-sauce text-[12.5px] font-semibold text-red-600 animate-fade-in">
                                <Icon icon="lucide:alert-circle" width={15} height={15} className="shrink-0" />
                                {error}
                            </div>
                        )}
                        {isSuccess && (
                            <div className="flex items-center gap-2 px-6 py-3 bg-green-50 font-open-sauce text-[12.5px] font-semibold text-green-700">
                                <Icon icon="lucide:check-circle" width={15} height={15} className="shrink-0" />
                                Lokasi berhasil ditambahkan ke database! Mengalihkan...
                            </div>
                        )}

                        {/* ── 1. Upload File ─────────────────────────────── */}
                        <div className="px-6 py-5 space-y-3">
                            <p className="font-open-sauce text-[13px] font-bold text-gray-700">Upload Gambar Lokasi <span className="text-red-500">*</span></p>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !previewUrl && fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
                                    isDragging ? "border-[#f7a81b] bg-[#fff9ee] cursor-copy"
                                    : previewUrl ? "border-gray-200 cursor-default"
                                    : "border-gray-200 bg-gray-50/50 hover:border-[#f7a81b]/60 hover:bg-[#fff9ee]/40 cursor-pointer"
                                }`}
                                style={{ minHeight: previewUrl ? "auto" : "170px" }}
                            >
                                {previewUrl ? (
                                    <div className="relative w-full" style={{ height: "190px" }}>
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="rounded-xl bg-white/90 px-3 py-1.5 font-open-sauce text-[12px] font-bold text-gray-800 hover:bg-white transition shadow">
                                                <Icon icon="lucide:pencil" width={12} height={12} className="inline mr-1" />Ganti
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleClearImage(); }}
                                                className="rounded-xl bg-red-500/90 px-3 py-1.5 font-open-sauce text-[12px] font-bold text-white hover:bg-red-600 transition shadow">
                                                <Icon icon="lucide:trash-2" width={12} height={12} className="inline mr-1" />Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-9 px-4 text-center">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${isDragging ? "bg-[#f7a81b]" : "bg-gray-100"}`}>
                                            <Icon icon={isDragging ? "lucide:download" : "lucide:upload"} width={24} height={24}
                                                className={isDragging ? "text-white" : "text-gray-400"} />
                                        </div>
                                        <p className="font-open-sauce text-[12.5px] text-gray-500">
                                            {isDragging ? "Lepaskan untuk mengunggah" : "Maks 10 MB, PNG, JPEG, WEBP"}
                                        </p>
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl bg-gray-900 px-5 py-2 font-open-sauce text-[12px] font-bold text-white hover:bg-gray-700 transition shadow-sm">
                                            Telusuri File
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpg,image/jpeg,image/webp" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                        </div>

                        {/* ── 2. Tipe Lokasi (Radio Buttons) ─────────────── */}
                        <div className="px-6 py-5 space-y-3">
                            <p className="font-open-sauce text-[13px] font-bold text-gray-700">Tipe Lokasi <span className="text-red-500">*</span></p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                                    type === "tps" 
                                        ? "border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545] font-bold" 
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}>
                                    <div className="flex items-center gap-2.5">
                                        <input type="radio" name="type" value="tps" checked={type === "tps"} onChange={() => setType("tps")} className="hidden" />
                                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${type === "tps" ? "border-[#0B2545]" : "border-gray-300"}`}>
                                            {type === "tps" && <div className="h-2 w-2 rounded-full bg-[#0B2545]" />}
                                        </div>
                                        <span className="font-open-sauce text-[13px]">TPS (Tempat Pembuangan Sementara)</span>
                                    </div>
                                </label>
                                
                                <label className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                                    type === "vendor" 
                                        ? "border-[#E53E3E] bg-[#E53E3E]/5 text-[#E53E3E] font-bold" 
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}>
                                    <div className="flex items-center gap-2.5">
                                        <input type="radio" name="type" value="vendor" checked={type === "vendor"} onChange={() => setType("vendor")} className="hidden" />
                                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${type === "vendor" ? "border-[#E53E3E]" : "border-gray-300"}`}>
                                            {type === "vendor" && <div className="h-2 w-2 rounded-full bg-[#E53E3E]" />}
                                        </div>
                                        <span className="font-open-sauce text-[13px]">Vendor / Pusat Daur Ulang</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* ── 3. Jenis Sampah ────────────────────────────── */}
                        <div className="px-6 py-5 space-y-3">
                            <p className="font-open-sauce text-[13px] font-bold text-gray-700">Jenis Sampah Yang Diterima <span className="text-red-500">*</span></p>
                            <div className="flex flex-wrap gap-2">
                                {WASTE_TYPES.map((t) => {
                                    const sel = selectedWasteTypes.includes(t.key);
                                    return (
                                        <button key={t.key} type="button" onClick={() => toggleWasteType(t.key)}
                                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 font-open-sauce text-[12.5px] font-semibold transition-all select-none ${
                                                sel ? "border-[#f7a81b] bg-[#f7a81b] text-white shadow-sm shadow-[#f7a81b]/20"
                                                    : `${t.bg} ${t.border} ${t.text} hover:border-[#f7a81b]/50`}`}>
                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${sel ? "border-white bg-white" : "border-current"}`}>
                                                {sel && <Icon icon="lucide:check" width={10} height={10} className="text-[#f7a81b]" />}
                                            </span>
                                            <Icon icon={t.icon} width={13} height={13} className={sel ? "text-white" : t.iconColor} />
                                            {t.key}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── 4. Informasi Lokasi ────────────────────────── */}
                        <div className="px-6 py-5 space-y-4">
                            <p className="font-open-sauce text-[13px] font-bold text-gray-700">Detail Informasi Lokasi</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Nama Lokasi <span className="text-red-500">*</span></label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Misal: Mang Adi Recycle" className={inputCls} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Email Kontak</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Misal: kontak@daurulang.com" className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Kontak / Telepon <span className="text-red-500">*</span></label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+62 812-3456-7890" className={inputCls} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Website Resmi</label>
                                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://www.laporansampah.com" className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Latitude <span className="text-red-500">*</span></label>
                                    <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="Contoh: -8.6500" className={inputCls} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Longitude <span className="text-red-500">*</span></label>
                                    <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="Contoh: 115.2166" className={inputCls} required />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-open-sauce text-[12px] font-semibold text-gray-500">Alamat Lengkap <span className="text-red-500">*</span></label>
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Jalan, nomor, desa, kecamatan, kode pos..." className={inputCls} required />
                            </div>

                            {/* Jam Operasional */}
                            <div className="space-y-2 pt-2">
                                <label className="block font-open-sauce text-[12px] font-bold text-gray-500 uppercase tracking-wider">Jam Operasional <span className="text-red-500">*</span></label>
                                <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                                    <div className="space-y-1.5">
                                        <label className="block font-open-sauce text-[11px] font-semibold text-gray-500">Hari Operasional</label>
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
                                                        className={`rounded-lg px-2.5 py-1.5 font-open-sauce text-[12px] font-semibold transition select-none ${
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block font-open-sauce text-[11px] font-semibold text-gray-500">Jam Buka</label>
                                            <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)}
                                                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                                className={inputCls} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block font-open-sauce text-[11px] font-semibold text-gray-500">Jam Tutup</label>
                                            <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)}
                                                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                                className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 5. Submit ──────────────────────────────────── */}
                        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50/50">
                            <Link href="/admin/waste-locations"
                                className="font-open-sauce text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition">
                                Batal
                            </Link>
                            <button type="submit" disabled={isSubmitting || isSuccess}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f7a81b] to-[#e89a14] px-7 py-2.5 font-open-sauce text-[13px] font-bold text-white shadow-md shadow-[#f7a81b]/20 transition hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSubmitting
                                    ? <><Icon icon="lucide:loader-2" width={15} height={15} className="animate-spin" />Menyimpan...</>
                                    : isSuccess
                                    ? <><Icon icon="lucide:check" width={15} height={15} />Tersimpan!</>
                                    : "Buat Lokasi"}
                            </button>
                        </div>

                    </div>
                </form>

                {/* ══ PREVIEW COLUMN ════════════════════════════════════════ */}
                <LivePreview
                    name={name}
                    type={type}
                    address={address}
                    operatingHours={operatingHours}
                    phone={phone}
                    email={email}
                    website={website}
                    latitude={latitude}
                    longitude={longitude}
                    selectedWasteTypes={selectedWasteTypes}
                    previewUrl={previewUrl}
                />
            </div>
        </div>
    );
}
