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

    // Sinkron dengan kategori yang dipilih tiap modal dibuka.
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setName(category?.name ?? "");
        setIcon(category?.icon ?? "lucide:tag");
        setSubcategories(category?.subcategories.join(", ") ?? "");
    }, [isOpen, category]);

    if (!isOpen) return null;

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
                                onChange={(e) => setName(e.target.value)}
                                placeholder="mis. Elektronik"
                                maxLength={80}
                                required
                                className="h-11 rounded-xl border border-gray-200 px-3 font-open-sauce text-[13px] outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                            />
                        </label>

                        <label className="grid gap-1.5">
                            <span className="font-open-sauce text-[12px] font-semibold text-gray-700">
                                Ikon{" "}
                                <span className="font-normal text-gray-400">
                                    (nama ikon Iconify, mis. lucide:sofa)
                                </span>
                            </span>
                            <input
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="lucide:tag"
                                maxLength={120}
                                className="h-11 rounded-xl border border-gray-200 px-3 font-open-sauce text-[13px] outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                            />
                        </label>

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
