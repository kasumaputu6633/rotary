"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import {
  formatListingMode,
  formatListingStatus,
  formatPrice,
  type ListingStatus,
} from "@/lib/listing-format";
import {
  deleteListing,
  updateListingStatus,
  type AdminListingRow,
} from "../actions";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const STATUS_CONFIG: Record<
  ListingStatus,
  { className: string; icon: string }
> = {
  active: {
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: "lucide:circle-check",
  },
  reserved: {
    className: "bg-amber-50 text-amber-600 border-amber-200",
    icon: "lucide:bookmark",
  },
  completed: {
    className: "bg-[#17458f]/10 text-[#17458f] border-[#17458f]/20",
    icon: "lucide:package-check",
  },
  inactive: {
    className: "bg-gray-100 text-gray-500 border-gray-200",
    icon: "lucide:circle-pause",
  },
  draft: {
    className: "bg-violet-50 text-violet-500 border-violet-200",
    icon: "lucide:file-pen",
  },
  blocked: {
    className: "bg-red-50 text-red-600 border-red-200",
    icon: "lucide:shield-alert",
  },
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "reserved", label: "Dipesan" },
  { value: "completed", label: "Selesai" },
  { value: "inactive", label: "Nonaktif" },
  { value: "blocked", label: "Diblokir" },
  { value: "draft", label: "Draft" },
];

// ─── Delete Modal ────────────────────────────────────────────────────────────

function DeleteModal({
  listing,
  onClose,
  onSuccess,
}: {
  listing: AdminListingRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteListing(listing.id);
      if (result.success) onSuccess();
      else setError(result.error ?? "Terjadi kesalahan.");
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-100 overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full rounded-t-4xl bg-gradient-to-r from-red-500 to-rose-500" />
        <div className="px-6 py-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60">
            <Icon
              icon="lucide:trash-2"
              width={26}
              height={26}
              className="text-red-500"
            />
          </div>
          <h3 className="text-center font-open-sauce text-[17px] font-bold text-gray-900">
            Hapus Listing?
          </h3>
          <p className="mt-1.5 text-center font-open-sauce text-[12.5px] leading-relaxed text-gray-500">
            Apakah kamu yakin ingin menghapus{" "}
            <span className="font-semibold text-gray-800">{listing.title}</span>
            ? Data yang dihapus tidak dapat dikembalikan.
          </p>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-open-sauce text-[12px] text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 font-open-sauce text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {isPending ? (
                <Icon
                  icon="lucide:loader-2"
                  className="animate-spin"
                  width={14}
                  height={14}
                />
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

// ─── Search Bar ──────────────────────────────────────────────────────────────

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
    <form onSubmit={handleSearch} className="relative max-w-xs flex-1">
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
        placeholder="Cari judul atau penjual..."
        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 font-open-sauce text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/20"
      />
    </form>
  );
}

// ─── Status Filter ────────────────────────────────────────────────────────────

function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1">
      {STATUS_FILTERS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setStatus(opt.value)}
          className={`rounded-lg px-3 py-1.5 font-open-sauce text-[12px] font-semibold transition-all ${current === opt.value
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

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
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
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white font-open-sauce text-sm text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
      >
        <Icon icon="lucide:chevron-left" width={14} height={14} />
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-1 font-open-sauce text-xs text-gray-400">…</span>
            )}
            <button
              onClick={() => goTo(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-open-sauce text-[13px] font-semibold transition ${p === page
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
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white font-open-sauce text-sm text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
      >
        <Icon icon="lucide:chevron-right" width={14} height={14} />
      </button>
    </div>
  );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function RowActions({
  listing,
  onDelete,
}: {
  listing: AdminListingRow;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isInactive = listing.status === "inactive";
  const isBlocked = listing.status === "blocked";

  function setStatus(status: ListingStatus) {
    startTransition(async () => {
      await updateListingStatus(listing.id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Link
        href={`/products/${listing.slug}`}
        target="_blank"
        title="Lihat detail"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#17458f]/10 hover:text-[#17458f]"
      >
        <Icon icon="lucide:eye" width={15} height={15} />
      </Link>

      {isBlocked ? (
        <button
          onClick={() => setStatus("inactive")}
          disabled={isPending}
          title="Buka blokir (jadikan nonaktif)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
        >
          {isPending ? (
            <Icon icon="lucide:loader-2" className="animate-spin" width={15} height={15} />
          ) : (
            <Icon icon="lucide:shield-check" width={15} height={15} />
          )}
        </button>
      ) : (
        <>
          <button
            onClick={() => setStatus(isInactive ? "active" : "inactive")}
            disabled={isPending}
            title={isInactive ? "Aktifkan kembali" : "Nonaktifkan"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
          >
            {isPending ? (
              <Icon icon="lucide:loader-2" className="animate-spin" width={15} height={15} />
            ) : (
              <Icon
                icon={isInactive ? "lucide:circle-play" : "lucide:circle-pause"}
                width={15}
                height={15}
              />
            )}
          </button>
          <button
            onClick={() => setStatus("blocked")}
            disabled={isPending}
            title="Blokir listing (penjual tidak bisa aktifkan sendiri)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Icon icon="lucide:shield-alert" width={15} height={15} />
          </button>
        </>
      )}

      <button
        onClick={onDelete}
        title="Hapus listing"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Icon icon="lucide:trash-2" width={15} height={15} />
      </button>
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export default function ListingsTable({
  listings,
  total,
  page,
  pageSize,
  search,
  status,
}: {
  listings: AdminListingRow[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
}) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AdminListingRow | null>(null);

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
          <StatusFilter current={status} />
        </div>
        <p className="font-open-sauce text-[12px] text-gray-400">
          {total} listing ditemukan
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gradient-to-r from-[#f8faff] to-[#f0f4ff]">
                {[
                  "Barang",
                  "Penjual",
                  "Kategori",
                  "Mode & Harga",
                  "Status",
                  "Dilihat",
                  "Terbit",
                  "Aksi",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-500 ${i >= 5 ? "text-center" : "text-left"
                      }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Icon
                        icon="lucide:package-search"
                        width={36}
                        height={36}
                        className="text-gray-200"
                      />
                      <p className="font-open-sauce text-sm text-gray-400">
                        {search || status
                          ? "Tidak ada listing yang cocok."
                          : "Belum ada listing."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((l) => {
                  const statusConf = STATUS_CONFIG[l.status];
                  const published = formatDate(l.publishedAt);
                  return (
                    <tr
                      key={l.id}
                      className="group transition-colors hover:bg-[#fafbff]"
                    >
                      {/* Barang */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {l.imageUrl ? (
                            <Image
                              src={l.imageUrl}
                              alt={l.title}
                              width={44}
                              height={44}
                              className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                              <Icon
                                icon="lucide:image"
                                width={18}
                                height={18}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                          <p className="max-w-[220px] truncate font-open-sauce text-[13px] font-semibold text-gray-900">
                            {l.title}
                          </p>
                        </div>
                      </td>

                      {/* Penjual */}
                      <td className="px-5 py-3.5">
                        <span className="font-open-sauce text-[13px] text-gray-700">
                          {l.sellerName || (
                            <span className="text-gray-300">—</span>
                          )}
                        </span>
                      </td>

                      {/* Kategori */}
                      <td className="px-5 py-3.5">
                        <span className="font-open-sauce text-[12.5px] text-gray-500">
                          {l.category}
                        </span>
                      </td>

                      {/* Mode & Harga */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-open-sauce text-[13px] font-semibold text-gray-900">
                            {formatPrice(l.price, l.mode)}
                          </span>
                          <span className="font-open-sauce text-[11px] text-gray-400">
                            {formatListingMode(l.mode)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-open-sauce text-[11px] font-semibold ${statusConf.className}`}
                        >
                          <Icon icon={statusConf.icon} width={11} height={11} />
                          {formatListingStatus(l.status, l.mode)}
                        </span>
                      </td>

                      {/* Dilihat */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-open-sauce text-[12.5px] text-gray-600">
                          <Icon
                            icon="lucide:eye"
                            width={13}
                            height={13}
                            className="text-gray-400"
                          />
                          {l.viewCount.toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* Terbit */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-open-sauce text-[12px] text-gray-500">
                          {published ?? <span className="text-gray-300">—</span>}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5">
                        <RowActions
                          listing={l}
                          onDelete={() => setDeleteTarget(l)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {listings.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3">
            <p className="font-open-sauce text-[12px] text-gray-400">
              Menampilkan {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} dari {total}
            </p>
            <Pagination page={page} totalPages={totalPages} />
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          listing={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
