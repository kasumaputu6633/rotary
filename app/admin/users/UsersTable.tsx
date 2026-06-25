"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { deleteUser, type UserRow } from "./actions";

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

const ROLE_CONFIG = {
    admin: {
        label: "Admin",
        className: "bg-[#17458f]/10 text-[#17458f] border-[#17458f]/20",
        icon: "lucide:shield-check",
    },
    user: {
        label: "User",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: "lucide:user",
    },
} as const;

// ─── Delete Modal ───────────────────────────────────────────────────────────

function DeleteModal({
    user,
    onClose,
    onSuccess,
}: {
    user: UserRow;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleDelete() {
        setError(null);
        startTransition(async () => {
            const result = await deleteUser(user.id);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error ?? "Terjadi kesalahan.");
            }
        });
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
                onClick={onClose}
            />
            {/* Modal */}
            <div
                className="relative w-full max-w-[400px] rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header strip */}
                <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-red-500 to-rose-500" />

                <div className="px-6 py-6">
                    {/* Icon */}
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60">
                        <Icon icon="lucide:trash-2" width={26} height={26} className="text-red-500" />
                    </div>

                    {/* Title */}
                    <h3 className="text-center font-poppins text-[17px] font-bold text-gray-900">
                        Hapus Pengguna?
                    </h3>
                    <p className="mt-1.5 text-center font-poppins text-[12.5px] text-gray-500 leading-relaxed">
                        Apakah kamu yakin ingin menghapus{" "}
                        <span className="font-semibold text-gray-800">
                            {user.fullName || user.email || "pengguna ini"}
                        </span>
                        ? Data yang dihapus tidak dapat dikembalikan.
                    </p>

                    {/* User preview */}
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.fullName ?? ""}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#f7a81b] to-[#e89a14] font-poppins text-xs font-bold text-white">
                                {getInitials(user.fullName || user.email || "?")}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate font-poppins text-sm font-semibold text-gray-900">
                                {user.fullName || "-"}
                            </p>
                            <p className="truncate font-poppins text-[11px] text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-poppins text-[12px] text-red-600">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex gap-2.5">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 font-poppins text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                            {isPending ? (
                                <Icon icon="lucide:loader-2" className="animate-spin" width={14} height={14} />
                            ) : (
                                <>
                                    <Icon icon="lucide:trash-2" width={13} height={13} />
                                    Hapus
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Search Bar ─────────────────────────────────────────────────────────────

function SearchBar({ defaultValue }: { defaultValue: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(defaultValue);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set("search", value);
        else params.delete("search");
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
            <Icon
                icon="lucide:search"
                width={15}
                height={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Cari nama, email, telepon..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 font-poppins text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/20"
            />
        </form>
    );
}

// ─── Role Filter ─────────────────────────────────────────────────────────────

function RoleFilter({ current }: { current: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function setRole(role: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (role) params.set("role", role);
        else params.delete("role");
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    }

    const options = [
        { value: "", label: "Semua" },
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
    ];

    return (
        <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    className={`rounded-lg px-3.5 py-1.5 font-poppins text-[12px] font-semibold transition-all ${
                        current === opt.value
                            ? "bg-[#17458f] text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
    page,
    totalPages,
}: {
    page: number;
    totalPages: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function goTo(p: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(p));
        router.push(`${pathname}?${params.toString()}`);
    }

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visible = pages.filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
    );

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => goTo(page - 1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white font-poppins text-sm text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
            >
                <Icon icon="lucide:chevron-left" width={14} height={14} />
            </button>

            {visible.map((p, i) => {
                const prev = visible[i - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                    <span key={p} className="flex items-center gap-1">
                        {showEllipsis && (
                            <span className="px-1 font-poppins text-xs text-gray-400">…</span>
                        )}
                        <button
                            onClick={() => goTo(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg font-poppins text-[13px] font-semibold transition ${
                                p === page
                                    ? "bg-[#17458f] text-white shadow-sm"
                                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {p}
                        </button>
                    </span>
                );
            })}

            <button
                onClick={() => goTo(page + 1)}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white font-poppins text-sm text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
            >
                <Icon icon="lucide:chevron-right" width={14} height={14} />
            </button>
        </div>
    );
}

// ─── Main Table Component ────────────────────────────────────────────────────

export default function UsersTable({
    users,
    total,
    page,
    pageSize,
    search,
    role,
}: {
    users: UserRow[];
    total: number;
    page: number;
    pageSize: number;
    search: string;
    role: string;
}) {
    const router = useRouter();
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

    const totalPages = Math.ceil(total / pageSize);

    const handleDeleteSuccess = useCallback(() => {
        setDeleteTarget(null);
        router.refresh();
    }, [router]);

    return (
        <>
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchBar defaultValue={search} />
                    <RoleFilter current={role} />
                </div>
                <p className="font-poppins text-[12px] text-gray-400">
                    {total} pengguna ditemukan
                </p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gradient-to-r from-[#f8faff] to-[#f0f4ff]">
                                <th className="px-5 py-3.5 text-left font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Pengguna
                                </th>
                                <th className="px-5 py-3.5 text-left font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Nama Toko
                                </th>
                                <th className="px-5 py-3.5 text-left font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Role
                                </th>
                                <th className="px-5 py-3.5 text-left font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    No. Telepon
                                </th>
                                <th className="px-5 py-3.5 text-center font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Total Listing
                                </th>
                                <th className="px-5 py-3.5 text-left font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Dibuat
                                </th>
                                <th className="px-5 py-3.5 text-center font-poppins text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Icon
                                                icon="lucide:users"
                                                width={36}
                                                height={36}
                                                className="text-gray-200"
                                            />
                                            <p className="font-poppins text-sm text-gray-400">
                                                {search
                                                    ? "Tidak ada pengguna yang cocok."
                                                    : "Belum ada pengguna."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const roleConf = ROLE_CONFIG[user.role];
                                    const initials = getInitials(
                                        user.fullName || user.email || "?",
                                    );
                                    return (
                                        <tr
                                            key={user.id}
                                            className="group transition-colors hover:bg-[#fafbff]"
                                        >
                                            {/* User info */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {user.avatarUrl ? (
                                                        <Image
                                                            src={user.avatarUrl}
                                                            alt={user.fullName ?? ""}
                                                            width={36}
                                                            height={36}
                                                            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#f7a81b] to-[#e89a14] font-poppins text-[11px] font-bold text-white shadow-sm">
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate font-poppins text-[13px] font-semibold text-gray-900">
                                                            {user.fullName || (
                                                                <span className="italic text-gray-400">
                                                                    —
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="truncate font-poppins text-[11px] text-gray-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Shop Name */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-poppins text-[13px] text-gray-700">
                                                    {user.shopName || (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-poppins text-[11px] font-semibold ${roleConf.className}`}
                                                >
                                                    <Icon
                                                        icon={roleConf.icon}
                                                        width={11}
                                                        height={11}
                                                    />
                                                    {roleConf.label}
                                                </span>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-poppins text-[13px] text-gray-700">
                                                    {user.phone || (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Total Listings */}
                                            <td className="px-5 py-3.5 text-center">
                                                <span
                                                    className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 font-poppins text-[12px] font-bold ${
                                                        user.totalListings > 0
                                                            ? "bg-[#17458f]/10 text-[#17458f]"
                                                            : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    {user.totalListings}
                                                </span>
                                            </td>

                                            {/* Created At */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-poppins text-[12px] text-gray-500">
                                                    {formatDate(user.createdAt)}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setDeleteTarget(user)}
                                                        title="Hapus pengguna"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Icon
                                                            icon="lucide:trash-2"
                                                            width={15}
                                                            height={15}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {users.length > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                        <p className="font-poppins text-[12px] text-gray-400">
                            Menampilkan {(page - 1) * pageSize + 1}–
                            {Math.min(page * pageSize, total)} dari {total}
                        </p>
                        <Pagination page={page} totalPages={totalPages} />
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    user={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}
