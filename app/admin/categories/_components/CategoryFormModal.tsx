"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import type { AdminCategory } from "./CategoriesClient";

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    category: AdminCategory | null;
}

const ICON_SUGGESTIONS: Record<string, string> = {
    elektronik: "lucide:monitor-smartphone",
    kendaraan: "lucide:car",
    mobil: "lucide:car",
    motor: "lucide:bike",
    properti: "lucide:home",
    rumah: "lucide:home",
    pakaian: "lucide:shirt",
    baju: "lucide:shirt",
    sepatu: "lucide:footprints",
    kesehatan: "lucide:heart-pulse",
    olahraga: "lucide:dumbbell",
    hobi: "lucide:gamepad-2",
    mainan: "lucide:toy-brick",
    makanan: "lucide:utensils",
    minuman: "lucide:cup-soda",
    jasa: "lucide:briefcase",
    kantor: "lucide:building-2",
    buku: "lucide:book",
    hewan: "lucide:paw-print",
    peliharaan: "lucide:paw-print",
    bayi: "lucide:baby",
    peralatan: "lucide:wrench",
    furniture: "lucide:sofa",
    perabotan: "lucide:sofa",
    musik: "lucide:music",
    kamera: "lucide:camera",
    tiket: "lucide:ticket",
    voucher: "lucide:ticket",
    travel: "lucide:plane",
    komputer: "lucide:laptop",
    laptop: "lucide:laptop",
    handphone: "lucide:smartphone",
    hp: "lucide:smartphone",
};

const POPULAR_ICONS = [
    "lucide:tag", "lucide:monitor-smartphone", "lucide:car", "lucide:bike", "lucide:home",
    "lucide:shirt", "lucide:footprints", "lucide:heart-pulse", "lucide:dumbbell", "lucide:gamepad-2",
    "lucide:toy-brick", "lucide:utensils", "lucide:cup-soda", "lucide:briefcase", "lucide:building-2",
    "lucide:book", "lucide:paw-print", "lucide:baby", "lucide:wrench", "lucide:sofa",
    "lucide:music", "lucide:camera", "lucide:ticket", "lucide:plane", "lucide:laptop",
    "lucide:smartphone", "lucide:shopping-bag", "lucide:shopping-cart", "lucide:gift", "lucide:star",
    "lucide:truck", "lucide:bus", "lucide:ship", "lucide:scissors", "lucide:palette",
    "lucide:wallet", "lucide:credit-card", "lucide:watch", "lucide:glasses", "lucide:headphones"
];

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    category,
}: CategoryFormModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [subcategories, setSubcategories] = useState("");
    const [isIconManuallyEdited, setIsIconManuallyEdited] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [iconSearch, setIconSearch] = useState("");

    // Sinkron dengan kategori yang dipilih tiap modal dibuka.
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setName(category?.name ?? "");
        setIcon(category?.icon ?? "lucide:tag");
        setSubcategories(category?.subcategories.join(", ") ?? "");
        setIsIconManuallyEdited(!!category);
    }, [isOpen, category]);

    if (!isOpen) return null;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);

        if (!isIconManuallyEdited && !category) {
            const keyword = val.toLowerCase();
            for (const [key, suggestedIcon] of Object.entries(ICON_SUGGESTIONS)) {
                if (keyword.includes(key)) {
                    setIcon(suggestedIcon);
                    break;
                }
            }
        }
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const formData = new FormData();
        formData.set("name", name);
        formData.set("icon", icon);
        formData.set("subcategories", subcategories);
        startTransition(async () => {
            try {
                await onSubmit(formData);
            } catch (err: any) {
                setError(err?.message ?? "Terjadi kesalahan saat menyimpan.");
            }
        });
    }

    const isEdit = !!category;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
                onClick={onClose}
            />
            <div
                className="relative w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-1.5 w-full rounded-t-2xl bg-linear-to-r from-[#f7a81b] to-[#e89a14]" />

                <form onSubmit={handleSubmit} className="px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff9f0]">
                            <Icon
                                icon={icon || "lucide:tag"}
                                width={22}
                                height={22}
                                className="text-[#f7a81b]"
                            />
                        </div>
                        <div>
                            <h3 className="font-open-sauce text-[17px] font-bold text-gray-900">
                                {isEdit ? "Edit Kategori" : "Tambah Kategori"}
                            </h3>
                            <p className="font-open-sauce text-[12px] text-gray-500">
                                {isEdit
                                    ? "Perubahan langsung berlaku di marketplace."
                                    : "Kategori baru akan tampil di picker & filter."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4">
                        <label className="grid gap-1.5">
                            <span className="font-open-sauce text-[12px] font-semibold text-gray-700">
                                Nama Kategori
                            </span>
                            <input
                                value={name}
                                onChange={handleNameChange}
                                placeholder="mis. Elektronik"
                                maxLength={80}
                                required
                                className="h-11 rounded-xl border border-gray-200 px-3 font-open-sauce text-[13px] outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                            />
                        </label>

                        <div className="grid gap-1.5 relative">
                            <span className="font-open-sauce text-[12px] font-semibold text-gray-700">
                                Ikon
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                                className="flex h-11 w-full items-center gap-3 rounded-xl border border-gray-200 px-3 font-open-sauce text-[13px] text-gray-700 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                            >
                                <Icon icon={icon || "lucide:tag"} width={18} height={18} className={icon ? "text-[#f7a81b]" : "text-gray-400"} />
                                <span className="flex-1 text-left truncate">{icon || "Pilih Ikon..."}</span>
                                <Icon icon="lucide:chevron-down" width={16} height={16} className={`text-gray-400 transition-transform ${isIconPickerOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isIconPickerOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsIconPickerOpen(false)} />
                                    <div className="absolute top-[calc(100%+8px)] z-20 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2">
                                        <input 
                                            type="text" 
                                            placeholder="Cari ikon atau ketik custom (mis. mdi:car)" 
                                            value={iconSearch}
                                            onChange={(e) => setIconSearch(e.target.value)}
                                            className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-open-sauce text-[12px] outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (iconSearch) {
                                                        setIcon(iconSearch);
                                                        setIsIconManuallyEdited(true);
                                                        setIsIconPickerOpen(false);
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="grid grid-cols-7 gap-1 max-h-[180px] overflow-y-auto pr-1">
                                            {POPULAR_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()) || i.replace('lucide:', '').includes(iconSearch.toLowerCase())).map(ic => (
                                                <button
                                                    key={ic}
                                                    type="button"
                                                    onClick={() => {
                                                        setIcon(ic);
                                                        setIsIconManuallyEdited(true);
                                                        setIsIconPickerOpen(false);
                                                    }}
                                                    className={`flex aspect-square items-center justify-center rounded-lg border transition-colors hover:bg-gray-50 ${icon === ic ? 'border-[#f7a81b] bg-[#fff9f0] text-[#f7a81b]' : 'border-transparent text-gray-600 hover:border-gray-200'}`}
                                                    title={ic.replace('lucide:', '')}
                                                >
                                                    <Icon icon={ic} width={22} height={22} />
                                                </button>
                                            ))}
                                            {POPULAR_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()) || i.replace('lucide:', '').includes(iconSearch.toLowerCase())).length === 0 && (
                                                <div className="col-span-7 py-6 text-center font-open-sauce text-[11px] text-gray-400">
                                                    Tekan Enter untuk simpan ikon kustom
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <label className="grid gap-1.5">
                            <span className="font-open-sauce text-[12px] font-semibold text-gray-700">
                                Subkategori{" "}
                                <span className="font-normal text-gray-400">
                                    (pisahkan dengan koma)
                                </span>
                            </span>
                            <textarea
                                value={subcategories}
                                onChange={(e) => setSubcategories(e.target.value)}
                                placeholder="Laptop & Komputer, Handphone, Audio"
                                rows={3}
                                className="rounded-xl border border-gray-200 px-3 py-2.5 font-open-sauce text-[13px] outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                            />
                        </label>
                    </div>

                    {error && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-open-sauce text-[12px] text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 font-open-sauce text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-[#f7a81b] to-[#e89a14] py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                        >
                            {isPending ? (
                                <Icon icon="lucide:loader-2" className="animate-spin" width={14} height={14} />
                            ) : (
                                <>
                                    <Icon icon="lucide:check" width={14} height={14} />
                                    {isEdit ? "Simpan" : "Tambah"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
