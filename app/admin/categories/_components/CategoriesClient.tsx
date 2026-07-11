"use client";

import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteConfirmModal from "../../_components/DeleteConfirmModal";
import {
    createCategoryAction,
    deleteCategoryAction,
    seedCategoriesAction,
    toggleCategoryAction,
    updateCategoryAction,
} from "../actions";
import CategoryFormModal from "./CategoryFormModal";

export interface AdminCategory {
    id: string;
    name: string;
    icon: string;
    subcategories: string[];
    sortOrder: number;
    active: boolean;
    usageCount: number;
}

function StatCard({
    label,
    value,
    icon,
    iconBg,
}: {
    label: string;
    value: number | string;
    icon: string;
    iconBg: string;
}) {
    return (
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${iconBg}`}
            >
                <Icon icon={icon} width={20} height={20} className="text-white" />
            </div>
            <div>
                <p className="font-open-sauce text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <p className="font-open-sauce text-[22px] font-bold leading-tight text-gray-900">
                    {typeof value === "number" ? value.toLocaleString("id-ID") : value}
                </p>
            </div>
        </div>
    );
}

export default function CategoriesClient({
    categories,
}: {
    categories: AdminCategory[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<AdminCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce(
        (sum, c) => sum + c.subcategories.length,
        0,
    );
    const totalUsage = categories.reduce((sum, c) => sum + c.usageCount, 0);

    function handleAdd() {
        setCategoryToEdit(null);
        setIsFormOpen(true);
    }

    function handleEdit(cat: AdminCategory) {
        setCategoryToEdit(cat);
        setIsFormOpen(true);
    }

    function handleToggle(cat: AdminCategory) {
        startTransition(async () => {
            try {
                await toggleCategoryAction(cat.id, !cat.active);
                toast.success(cat.active ? "Kategori dinonaktifkan." : "Kategori diaktifkan.");
                router.refresh();
            } catch (err: any) {
                toast.error(err?.message ?? "Gagal mengubah status kategori.");
            }
        });
    }

    function handleSeed() {
        startTransition(async () => {
            try {
                const { inserted } = await seedCategoriesAction();
                toast.success(
                    inserted > 0
                        ? `${inserted} kategori awal ditambahkan.`
                        : "Semua kategori awal sudah ada.",
                );
                router.refresh();
            } catch (err: any) {
                toast.error(err?.message ?? "Gagal mengisi kategori awal.");
            }
        });
    }

    async function handleDeleteConfirm() {
        if (!categoryToDelete) return;
        await deleteCategoryAction(categoryToDelete.id);
        toast.success("Kategori dihapus.");
        setCategoryToDelete(null);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-open-sauce text-2xl font-bold text-gray-900">
                        Kategori
                    </h1>
                    <p className="mt-1 font-open-sauce text-sm text-gray-500">
                        Kelola kategori dan subkategori listing marketplace.
                    </p>
                </div>
                {categories.length > 0 && (
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#f7a81b] to-[#e89a14] px-4 py-2.5 font-open-sauce text-[13px] font-semibold text-white shadow-md shadow-[#f7a81b]/15 transition-transform hover:scale-[1.02]"
                    >
                        <Icon icon="lucide:plus" width={18} height={18} />
                        Tambah Kategori
                    </button>
                )}
            </div>

            {categories.length === 0 ? (
                /* Empty state — seed from hardcoded taxonomy */
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff9f0]">
                        <Icon icon="lucide:tags" width={26} height={26} className="text-[#f7a81b]" />
                    </div>
                    <div>
                        <p className="font-open-sauce text-base font-bold text-gray-900">
                            Belum ada kategori
                        </p>
                        <p className="mt-1 font-open-sauce text-sm text-gray-500">
                            Isi otomatis dari daftar kategori bawaan, lalu sesuaikan sesukamu.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSeed}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#17458f] px-4 py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-[#123a7a] disabled:opacity-60"
                    >
                        {isPending ? (
                            <Icon icon="lucide:loader-2" className="animate-spin" width={16} height={16} />
                        ) : (
                            <Icon icon="lucide:sparkles" width={16} height={16} />
                        )}
                        Isi kategori bawaan
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Total Kategori"
                            value={totalCategories}
                            icon="lucide:tags"
                            iconBg="from-[#17458f] to-[#1a5cbf]"
                        />
                        <StatCard
                            label="Total Subkategori"
                            value={totalSubcategories}
                            icon="lucide:list-tree"
                            iconBg="from-[#f7a81b] to-[#e89a14]"
                        />
                        <StatCard
                            label="Listing Terkait"
                            value={totalUsage}
                            icon="lucide:layout-grid"
                            iconBg="from-emerald-500 to-emerald-600"
                        />
                    </div>

                    {/* Category list */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-3.5">
                            <h2 className="font-open-sauce text-sm font-bold text-gray-900">
                                Daftar Kategori
                            </h2>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {categories.map((cat) => (
                                <li
                                    key={cat.id}
                                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff9f0]">
                                            <Icon
                                                icon={cat.icon}
                                                width={20}
                                                height={20}
                                                className="text-[#f7a81b]"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-open-sauce text-sm font-semibold text-gray-900">
                                                    {cat.name}
                                                </p>
                                                {cat.active ? (
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-open-sauce text-[10px] font-semibold text-emerald-600">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-open-sauce text-[10px] font-semibold text-gray-500">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                {cat.subcategories.length > 0 ? (
                                                    cat.subcategories.map((sub) => (
                                                        <span
                                                            key={sub}
                                                            className="rounded-lg bg-gray-50 px-2 py-0.5 font-open-sauce text-[11px] font-medium text-gray-500"
                                                        >
                                                            {sub}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="font-open-sauce text-[11px] italic text-gray-400">
                                                        Tanpa subkategori
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 sm:pl-4">
                                        <div className="text-right">
                                            <p className="font-open-sauce text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                                Listing
                                            </p>
                                            <p className="font-open-sauce text-sm font-bold text-gray-900">
                                                {cat.usageCount.toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(cat)}
                                                disabled={isPending}
                                                title={cat.active ? "Nonaktifkan" : "Aktifkan"}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <Icon
                                                    icon={cat.active ? "lucide:pause" : "lucide:play"}
                                                    width={16}
                                                    height={16}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(cat)}
                                                title="Edit"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#fff9f0] hover:text-[#f7a81b]"
                                            >
                                                <Icon icon="lucide:pencil" width={16} height={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCategoryToDelete(cat)}
                                                title="Hapus"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
                                            >
                                                <Icon icon="lucide:trash-2" width={16} height={16} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            <CategoryFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                category={categoryToEdit}
                onSubmit={async (formData) => {
                    if (categoryToEdit) {
                        await updateCategoryAction(categoryToEdit.id, formData);
                        toast.success("Kategori diperbarui.");
                    } else {
                        await createCategoryAction(formData);
                        toast.success("Kategori ditambahkan.");
                    }
                    setIsFormOpen(false);
                    router.refresh();
                }}
            />

            <DeleteConfirmModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Hapus Kategori"
                description={
                    <>
                        Kategori{" "}
                        <span className="font-semibold text-gray-700">
                            {categoryToDelete?.name}
                        </span>{" "}
                        akan dihapus permanen. Kategori yang masih dipakai listing tidak
                        bisa dihapus — nonaktifkan saja.
                    </>
                }
            />
        </div>
    );
}
