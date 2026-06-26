"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

const DISTRICTS = [
    "Badung", "Bangli", "Buleleng", "Denpasar",
    "Gianyar", "Jembrana", "Karangasem", "Klungkung", "Tabanan",
];

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
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/10 hover:border-gray-300";

// ─── Live Preview Card ────────────────────────────────────────────────────────

function LivePreview({
    name, district, address, operationalHours, phone, locationLink,
    selectedWasteTypes, previewUrl,
}: {
    name: string; district: string; address: string;
    operationalHours: string; phone: string; locationLink: string;
    selectedWasteTypes: string[]; previewUrl: string | null;
}) {
    const isEmpty = !name && !district && !address && !operationalHours && !phone && selectedWasteTypes.length === 0 && !previewUrl;

    return (
        <div className="sticky top-6 space-y-3">
            {/* Label */}
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#f7a81b]" />
                <p className="font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-400">
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
                            <span className="font-poppins text-[11px]">Foto belum diunggah</span>
                        </div>
                    )}
                    {/* Badge overlay if image exists */}
                    {previewUrl && (
                        <div className="absolute bottom-2 right-2 rounded-lg bg-black/40 px-2 py-1 font-poppins text-[10px] font-semibold text-white backdrop-blur-sm">
                            Foto Lokasi
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {isEmpty ? (
                        <div className="py-6 text-center">
                            <Icon icon="lucide:pencil-line" width={28} height={28} className="mx-auto text-gray-200" />
                            <p className="mt-2 font-poppins text-[11px] text-gray-300">
                                Isi form untuk melihat preview
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Name */}
                            <div>
                                <h3 className="font-poppins text-[15px] font-bold text-gray-900 leading-snug">
                                    {name || <span className="italic text-gray-300 font-normal text-[13px]">Nama lokasi...</span>}
                                </h3>
                                {district && (
                                    <p className="mt-0.5 flex items-center gap-1.5 font-poppins text-[11px] font-semibold text-[#17458f]">
                                        <Icon icon="lucide:map-pin" width={11} height={11} />
                                        {district}, Bali
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100" />

                            {/* Info rows */}
                            <div className="space-y-2">
                                {operationalHours && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:clock" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-poppins text-[12px] text-gray-600">{operationalHours}</span>
                                    </div>
                                )}
                                {address && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:navigation" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-poppins text-[12px] text-gray-600 leading-relaxed">{address}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:phone" width={13} height={13} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="font-poppins text-[12px] text-gray-600">{phone}</span>
                                    </div>
                                )}
                                {locationLink && (
                                    <div className="flex items-start gap-2.5">
                                        <Icon icon="lucide:map" width={13} height={13} className="mt-0.5 shrink-0 text-[#17458f]" />
                                        <span className="font-poppins text-[12px] text-[#17458f] truncate">{locationLink}</span>
                                    </div>
                                )}
                            </div>

                            {/* Waste type badges */}
                            {selectedWasteTypes.length > 0 && (
                                <>
                                    <div className="h-px bg-gray-100" />
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedWasteTypes.map((type) => {
                                            const meta = WASTE_TYPES.find((w) => w.key === type);
                                            return (
                                                <span
                                                    key={type}
                                                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-poppins text-[11px] font-semibold ${meta ? `${meta.bg} ${meta.border} ${meta.text}` : "bg-gray-50 border-gray-200 text-gray-600"}`}
                                                >
                                                    {meta && <Icon icon={meta.icon} width={11} height={11} className={meta.iconColor} />}
                                                    {type}
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

            {/* Tip */}
            <p className="font-poppins text-[10.5px] text-gray-400 text-center leading-relaxed">
                Preview ini menampilkan tampilan kartu lokasi<br />sebelum disimpan.
            </p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddLocationClient() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName]                             = useState("");
    const [district, setDistrict]                     = useState("");
    const [address, setAddress]                       = useState("");
    const [operationalHours, setOperationalHours]     = useState("");
    const [phone, setPhone]                           = useState("");
    const [locationLink, setLocationLink]             = useState("");
    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
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
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim())             return setError("Nama lokasi harus diisi.");
        if (!district)                return setError("Kabupaten/Kota harus dipilih.");
        if (!address.trim())          return setError("Alamat harus diisi.");
        if (!operationalHours.trim()) return setError("Jam operasional harus diisi.");
        if (!phone.trim())            return setError("Kontak / nomor telepon harus diisi.");
        if (!selectedWasteTypes.length) return setError("Pilih minimal satu jenis sampah.");

        setIsSubmitting(true);
        setTimeout(() => {
            const newLoc = {
                id: Date.now().toString(),
                name: name.trim(), district,
                address: address.trim(),
                operationalHours: operationalHours.trim(),
                phone: phone.trim(),
                locationLink: locationLink.trim() || undefined,
                wasteTypes: selectedWasteTypes,
                imageUrl: previewUrl ?? undefined,
            };
            const existing = JSON.parse(localStorage.getItem("rotary_waste_locations") ?? "[]");
            localStorage.setItem("rotary_waste_locations", JSON.stringify([newLoc, ...existing]));
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => router.push("/admin/waste-locations"), 1200);
        }, 600);
    };

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 font-poppins text-[12px] text-gray-400">
                <span>Dashboard</span>
                <Icon icon="lucide:chevron-right" width={12} height={12} className="text-gray-300" />
                <Link href="/admin/waste-locations" className="hover:text-[#17458f] transition-colors">Lokasi</Link>
                <Icon icon="lucide:chevron-right" width={12} height={12} className="text-gray-300" />
                <span className="font-semibold text-[#17458f]">Tambah Lokasi</span>
            </nav>

            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-poppins text-2xl font-bold text-gray-900">Tambah Lokasi Vendor</h1>
                    <p className="mt-0.5 font-poppins text-sm text-gray-500">
                        Lengkapi data di bawah ini untuk menambahkan lokasi penampungan sampah baru.
                    </p>
                </div>
                <Link
                    href="/admin/waste-locations"
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 font-poppins text-[13px] font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
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
                            <div className="flex items-center gap-2 px-6 py-3 bg-red-50 font-poppins text-[12.5px] font-semibold text-red-600">
                                <Icon icon="lucide:alert-circle" width={15} height={15} className="shrink-0" />
                                {error}
                            </div>
                        )}
                        {isSuccess && (
                            <div className="flex items-center gap-2 px-6 py-3 bg-green-50 font-poppins text-[12.5px] font-semibold text-green-700">
                                <Icon icon="lucide:check-circle" width={15} height={15} className="shrink-0" />
                                Lokasi berhasil ditambahkan! Mengalihkan ke daftar...
                            </div>
                        )}

                        {/* ── 1. Upload File ─────────────────────────────── */}
                        <div className="px-6 py-5 space-y-3">
                            <p className="font-poppins text-[13px] font-bold text-gray-700">Upload File</p>
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
                                                className="rounded-xl bg-white/90 px-3 py-1.5 font-poppins text-[12px] font-bold text-gray-800 hover:bg-white transition shadow">
                                                <Icon icon="lucide:pencil" width={12} height={12} className="inline mr-1" />Ganti
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleClearImage(); }}
                                                className="rounded-xl bg-red-500/90 px-3 py-1.5 font-poppins text-[12px] font-bold text-white hover:bg-red-600 transition shadow">
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
                                        <p className="font-poppins text-[12.5px] text-gray-500">
                                            {isDragging ? "Lepaskan untuk mengunggah" : "Maks 10 MB, PNG, JPEG"}
                                        </p>
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl bg-gray-900 px-5 py-2 font-poppins text-[12px] font-bold text-white hover:bg-gray-700 transition shadow-sm">
                                            Telusuri File
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpg,image/jpeg,image/webp" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                        </div>

                        {/* ── 2. Jenis Sampah ────────────────────────────── */}
                        <div className="px-6 py-5 space-y-3">
                            <p className="font-poppins text-[13px] font-bold text-gray-700">Jenis Sampah Yang Diterima</p>
                            <div className="flex flex-wrap gap-2">
                                {WASTE_TYPES.map((type) => {
                                    const sel = selectedWasteTypes.includes(type.key);
                                    return (
                                        <button key={type.key} type="button" onClick={() => toggleWasteType(type.key)}
                                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 font-poppins text-[12.5px] font-semibold transition-all select-none ${
                                                sel ? "border-[#f7a81b] bg-[#f7a81b] text-white shadow-sm shadow-[#f7a81b]/20"
                                                    : `${type.bg} ${type.border} ${type.text} hover:border-[#f7a81b]/50`}`}>
                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${sel ? "border-white bg-white" : "border-current"}`}>
                                                {sel && <Icon icon="lucide:check" width={10} height={10} className="text-[#f7a81b]" />}
                                            </span>
                                            <Icon icon={type.icon} width={13} height={13} className={sel ? "text-white" : type.iconColor} />
                                            {type.key}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedWasteTypes.length > 0 && (
                                <p className="font-poppins text-[11px] text-gray-400">
                                    {selectedWasteTypes.length} dipilih: <span className="font-semibold text-gray-600">{selectedWasteTypes.join(", ")}</span>
                                </p>
                            )}
                        </div>

                        {/* ── 3. Informasi Vendor ────────────────────────── */}
                        <div className="px-6 py-5 space-y-4">
                            <p className="font-poppins text-[13px] font-bold text-gray-700">Informasi Vendor</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block font-poppins text-[12px] font-semibold text-gray-500">Nama Lokasi</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Misal: Mang Adi Recycle" className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-poppins text-[12px] font-semibold text-gray-500">Kabupaten / Kota</label>
                                    <div className="relative">
                                        <select value={district} onChange={(e) => setDistrict(e.target.value)}
                                            className={`${inputCls} appearance-none pr-9 ${!district ? "text-gray-400" : ""}`}>
                                            <option value="" disabled>Pilih Kabupaten/Kota</option>
                                            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <Icon icon="lucide:chevron-down" width={14} height={14}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-poppins text-[12px] font-semibold text-gray-500">Jam Operasional</label>
                                    <input type="text" value={operationalHours} onChange={(e) => setOperationalHours(e.target.value)}
                                        placeholder="Senin - Jumat, 08.00 - 17.00" className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block font-poppins text-[12px] font-semibold text-gray-500">Kontak</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+62 812-3456-7890" className={inputCls} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-poppins text-[12px] font-semibold text-gray-500">Alamat Lengkap</label>
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Jalan, nomor, desa, kecamatan..." className={inputCls} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-poppins text-[12px] font-semibold text-gray-500">Link Lokasi</label>
                                <input type="url" value={locationLink} onChange={(e) => setLocationLink(e.target.value)}
                                    placeholder="https://maps.google.com/..." className={inputCls} />
                            </div>
                        </div>

                        {/* ── 4. Submit ──────────────────────────────────── */}
                        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50/50">
                            <Link href="/admin/waste-locations"
                                className="font-poppins text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition">
                                Batal
                            </Link>
                            <button type="submit" disabled={isSubmitting || isSuccess}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f7a81b] to-[#e89a14] px-7 py-2.5 font-poppins text-[13px] font-bold text-white shadow-md shadow-[#f7a81b]/20 transition hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed">
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
                    district={district}
                    address={address}
                    operationalHours={operationalHours}
                    phone={phone}
                    locationLink={locationLink}
                    selectedWasteTypes={selectedWasteTypes}
                    previewUrl={previewUrl}
                />
            </div>
        </div>
    );
}
