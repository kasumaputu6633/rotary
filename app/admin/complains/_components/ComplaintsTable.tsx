"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  formatComplaintCode,
  formatComplaintPriority,
  formatComplaintStatus,
  type ComplaintPriority,
  type ComplaintStatus,
} from "@/lib/moderation-format";
import type { AdminComplaintRow } from "../actions";
import {
  assignComplaintToSelf,
  updateComplaintPriority,
  updateComplaintStatus,
} from "../actions";

const STATUS_CONFIG: Record<ComplaintStatus, { className: string }> = {
  new: { className: "bg-blue-50 text-blue-700 border-blue-100" },
  reviewing: { className: "bg-amber-50 text-[#b7791f] border-amber-100" },
  resolved: { className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rejected: { className: "bg-gray-100 text-gray-500 border-gray-200" },
};

const PRIORITY_CONFIG: Record<ComplaintPriority, { className: string }> = {
  low: { className: "bg-gray-100 text-gray-600 border-gray-200" },
  medium: { className: "bg-amber-50 text-[#b7791f] border-amber-100" },
  high: { className: "bg-red-50 text-red-600 border-red-100" },
};

const PRIORITY_CYCLE: Record<ComplaintPriority, ComplaintPriority> = {
  low: "medium",
  medium: "high",
  high: "low",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "new", label: "Baru" },
  { value: "reviewing", label: "Ditinjau" },
  { value: "resolved", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
];

const TARGET_ICON: Record<AdminComplaintRow["targetType"], string> = {
  listing: "lucide:clipboard-list",
  user: "lucide:user",
  deal: "lucide:arrow-left-right",
  waste_location: "lucide:recycle",
};

function isTerminal(status: ComplaintStatus) {
  return status === "resolved" || status === "rejected";
}

function PriorityBadge({ complaint }: { complaint: AdminComplaintRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const terminal = isTerminal(complaint.status);

  function cycle() {
    startTransition(async () => {
      const result = await updateComplaintPriority(
        complaint.id,
        PRIORITY_CYCLE[complaint.priority],
      );
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal memperbarui prioritas.");
      }
    });
  }

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_CONFIG[complaint.priority].className}`}
    >
      {formatComplaintPriority(complaint.priority)}
      {!terminal ? (
        <Icon icon="lucide:chevrons-up-down" width={11} height={11} />
      ) : null}
    </span>
  );

  if (terminal) return badge;

  return (
    <button
      type="button"
      onClick={cycle}
      disabled={isPending}
      title="Klik untuk ubah prioritas"
      className="transition-opacity hover:opacity-75 disabled:opacity-50"
    >
      {badge}
    </button>
  );
}

function AssigneeCell({ complaint }: { complaint: AdminComplaintRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const terminal = isTerminal(complaint.status);

  function assign() {
    startTransition(async () => {
      const result = await assignComplaintToSelf(complaint.id);
      if (result.success) {
        toast.success("Komplain ditugaskan ke Anda.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal menugaskan komplain.");
      }
    });
  }

  if (complaint.assigneeName) {
    return <span className="text-gray-600">{complaint.assigneeName}</span>;
  }

  if (terminal) {
    return <span className="italic text-gray-400">—</span>;
  }

  return (
    <button
      type="button"
      onClick={assign}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-lg border border-[#17458f]/30 bg-[#eef3fb] px-2.5 py-1.5 text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#dfe9f8] disabled:opacity-50"
    >
      <Icon icon="lucide:user-plus" width={13} height={13} />
      Ambil
    </button>
  );
}

function ResolveDialog({
  complaint,
  onClose,
  onDone,
}: {
  complaint: AdminComplaintRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await updateComplaintStatus(complaint.id, "resolved", note);
      if (result.success) {
        toast.success("Komplain diselesaikan dan ditutup.");
        onDone();
        onClose();
      } else {
        toast.error(result.error ?? "Gagal menyelesaikan komplain.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 font-open-sauce text-[15px] font-bold text-gray-900">
          Selesaikan {formatComplaintCode(complaint.seq)}
        </h2>
        <p className="mb-4 font-open-sauce text-[12px] text-gray-400">
          Tandai laporan ini selesai ditangani. Catatan resolusi opsional, tapi
          membantu jejak audit.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ringkasan tindakan, mis. listing diblokir, penjual diperingatkan…"
          className="mb-4 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-open-sauce text-[13px] outline-none focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 font-open-sauce text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
          >
            {isPending ? (
              <Icon
                icon="lucide:loader-circle"
                width={15}
                height={15}
                className="animate-spin"
              />
            ) : (
              <Icon icon="lucide:check-check" width={15} height={15} />
            )}
            Selesaikan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function RowActions({ complaint }: { complaint: AdminComplaintRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showResolve, setShowResolve] = useState(false);
  const terminal = isTerminal(complaint.status);

  function setStatus(status: ComplaintStatus) {
    startTransition(async () => {
      const result = await updateComplaintStatus(complaint.id, status);
      if (result.success) {
        toast.success("Status komplain diperbarui.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal memperbarui status.");
      }
    });
  }

  if (terminal) {
    return (
      <div className="flex items-center justify-end">
        <span className="font-open-sauce text-[11px] italic text-gray-400">
          {complaint.status === "resolved" ? "Selesai" : "Ditolak"}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {complaint.status === "new" ? (
          <button
            type="button"
            onClick={() => setStatus("reviewing")}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] font-semibold text-[#b7791f] transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <Icon icon="lucide:search" width={13} height={13} />
            Tinjau
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setShowResolve(true)}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
        >
          <Icon icon="lucide:check-check" width={13} height={13} />
          Selesaikan & Tutup
        </button>
        <button
          type="button"
          onClick={() => setStatus("rejected")}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Icon icon="lucide:x" width={13} height={13} />
          Tolak
        </button>
      </div>

      {showResolve ? (
        <ResolveDialog
          complaint={complaint}
          onClose={() => setShowResolve(false)}
          onDone={() => router.refresh()}
        />
      ) : null}
    </>
  );
}

export default function ComplaintsTable({
  complaints,
  total,
  page,
  pageSize,
  search,
  status,
}: {
  complaints: AdminComplaintRow[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushParams(next: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "" || value === 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    router.push(`/admin/complains?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search: searchInput, page: undefined });
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Icon
            icon="lucide:search"
            width={15}
            height={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari kategori, pelapor, atau listing…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 font-open-sauce text-[13px] outline-none focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
          />
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => pushParams({ status: f.value, page: undefined })}
                className={`rounded-lg border px-3 py-2 font-open-sauce text-[12px] font-semibold transition-colors ${
                  active
                    ? "border-[#17458f] bg-[#17458f] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {complaints.length === 0 ? (
        <p className="py-12 text-center font-open-sauce text-sm text-gray-400">
          Belum ada komplain yang cocok.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left font-open-sauce text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Pelapor</th>
                <th className="pb-3 pr-4">Target</th>
                <th className="pb-3 pr-4">Kategori</th>
                <th className="pb-3 pr-4">Prioritas</th>
                <th className="pb-3 pr-4">Penanggung Jawab</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.map((c) => (
                <tr key={c.id} className="font-open-sauce text-[13px] align-top">
                  <td className="py-3.5 pr-4 font-mono text-[12px] font-semibold text-[#17458f]">
                    {formatComplaintCode(c.seq)}
                  </td>
                  <td className="py-3.5 pr-4 text-gray-700">
                    {c.reporterName ?? (
                      <span className="italic text-gray-400">Anonim</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5 text-gray-900">
                      <Icon
                        icon={TARGET_ICON[c.targetType]}
                        width={13}
                        height={13}
                        className="shrink-0 text-gray-400"
                      />
                      {c.targetSlug ? (
                        <Link
                          href={`/products/${c.targetSlug}`}
                          className="font-semibold hover:text-[#17458f] hover:underline"
                        >
                          {c.targetLabel}
                        </Link>
                      ) : (
                        <span className="font-semibold">{c.targetLabel}</span>
                      )}
                    </div>
                    {c.description ? (
                      <p className="mt-1 max-w-[240px] text-[11px] leading-snug text-gray-400">
                        {c.description}
                      </p>
                    ) : null}
                    {c.resolutionNote ? (
                      <p className="mt-1 max-w-[240px] text-[11px] leading-snug text-emerald-600">
                        <span className="font-semibold">Resolusi:</span>{" "}
                        {c.resolutionNote}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3.5 pr-4 text-gray-500">{c.category}</td>
                  <td className="py-3.5 pr-4">
                    <PriorityBadge complaint={c} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <AssigneeCell complaint={c} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CONFIG[c.status].className}`}
                    >
                      {formatComplaintStatus(c.status)}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <RowActions complaint={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between font-open-sauce text-[12px] text-gray-500">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => pushParams({ page: page - 1 })}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => pushParams({ page: page + 1 })}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
