"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type AdminRow,
  promoteToAdmin,
  demoteAdmin,
  createAdmin,
  searchPromotableUsers,
} from "../actions";
import { PASSWORD_RULES } from "@/lib/password";

type PromotableUser = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastSeen(date: Date | null): string {
  if (!date) return "Belum pernah";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Online";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(date);
}

// ─── Modal: Tambah Admin (buat akun baru) ───────────────────────────────────
function CreateAdminModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAdmin(formData);
      if (result.success) {
        toast.success("Admin baru berhasil dibuat.");
        onDone();
      } else {
        setError(result.error ?? "Gagal membuat admin.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-[#17458f] to-[#1a5cbf]" />
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17458f]/10 text-[#17458f]">
              <Icon icon="lucide:user-plus" width={22} height={22} />
            </div>
            <div>
              <h3 className="font-open-sauce text-[16px] font-bold text-gray-900">
                Tambah Admin Baru
              </h3>
              <p className="font-open-sauce text-[12px] text-gray-500">
                Akun langsung aktif dan terverifikasi.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="font-open-sauce text-[12px] font-semibold text-gray-700">
                Nama Lengkap
              </label>
              <input
                name="fullName"
                type="text"
                required
                maxLength={120}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-open-sauce text-[13px] outline-none focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
                placeholder="Nama admin"
              />
            </div>
            <div>
              <label className="font-open-sauce text-[12px] font-semibold text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-open-sauce text-[13px] outline-none focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
                placeholder="admin@rotary.com"
              />
            </div>
            <div>
              <label className="font-open-sauce text-[12px] font-semibold text-gray-700">
                Kata Sandi
              </label>
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-open-sauce text-[13px] outline-none focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
                placeholder="••••••••"
              />
              <div className="mt-2 grid grid-cols-2 gap-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <span
                      key={rule.label}
                      className={`inline-flex items-center gap-1 font-open-sauce text-[10px] ${
                        ok ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      <Icon
                        icon={ok ? "lucide:check-circle-2" : "lucide:circle"}
                        width={11}
                        height={11}
                      />
                      {rule.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-open-sauce text-[12px] text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2.5">
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
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#17458f] py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-[#123a78] disabled:opacity-60"
            >
              {isPending ? (
                <Icon
                  icon="lucide:loader-2"
                  className="animate-spin"
                  width={14}
                  height={14}
                />
              ) : (
                "Buat Admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Promosikan user yang sudah ada ───────────────────────────────────
function PromoteModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PromotableUser[]>([]);
  const [selected, setSelected] = useState<PromotableUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // Jadwalkan reset agar tidak memanggil setState sinkron di dalam body effect.
      debounceRef.current = setTimeout(() => {
        setResults([]);
        setIsSearching(false);
      }, 0);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await searchPromotableUsers(trimmed);
        setResults(found);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handlePromote() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await promoteToAdmin(selected.id);
      if (result.success) {
        toast.success(`${selected.name} kini menjadi admin.`);
        onDone();
      } else {
        setError(result.error ?? "Gagal mempromosikan pengguna.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-[#f7a81b] to-[#e89a14]" />
        <div className="px-6 py-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#f7a81b]">
              <Icon icon="lucide:arrow-up-circle" width={22} height={22} />
            </div>
            <div>
              <h3 className="font-open-sauce text-[16px] font-bold text-gray-900">
                Promosikan Pengguna
              </h3>
              <p className="font-open-sauce text-[12px] text-gray-500">
                Cari pengguna untuk dijadikan admin.
              </p>
            </div>
          </div>

          <div className="relative">
            <Icon
              icon="lucide:search"
              width={16}
              height={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              autoFocus
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 font-open-sauce text-[13px] outline-none focus:border-[#f7a81b] focus:ring-2 focus:ring-[#f7a81b]/20"
              placeholder="Nama atau email pengguna…"
            />
          </div>

          <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-gray-100">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-6 font-open-sauce text-[12px] text-gray-400">
                <Icon
                  icon="lucide:loader-2"
                  className="animate-spin"
                  width={14}
                  height={14}
                />
                Mencari…
              </div>
            ) : query.trim().length < 2 ? (
              <p className="py-6 text-center font-open-sauce text-[12px] text-gray-400">
                Ketik minimal 2 huruf untuk mencari.
              </p>
            ) : results.length === 0 ? (
              <p className="py-6 text-center font-open-sauce text-[12px] text-gray-400">
                Tidak ada pengguna yang cocok.
              </p>
            ) : (
              results.map((u) => {
                const isSelected = selected?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelected(u)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {u.avatarUrl ? (
                      <Image
                        src={u.avatarUrl}
                        alt={u.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#f7a81b] to-[#e89a14] font-open-sauce text-[10px] font-bold text-white">
                        {getInitials(u.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-open-sauce text-[13px] font-semibold text-gray-900">
                        {u.name}
                      </p>
                      <p className="truncate font-open-sauce text-[11px] text-gray-400">
                        {u.email}
                      </p>
                    </div>
                    {isSelected && (
                      <Icon
                        icon="lucide:check"
                        width={16}
                        height={16}
                        className="text-[#f7a81b]"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

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
              onClick={handlePromote}
              disabled={isPending || !selected}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#f7a81b] py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-[#e09918] disabled:opacity-50"
            >
              {isPending ? (
                <Icon
                  icon="lucide:loader-2"
                  className="animate-spin"
                  width={14}
                  height={14}
                />
              ) : (
                "Jadikan Admin"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Konfirmasi turunkan admin ────────────────────────────────────────
function DemoteModal({
  target,
  onClose,
  onDone,
}: {
  target: AdminRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDemote() {
    setError(null);
    startTransition(async () => {
      const result = await demoteAdmin(target.id);
      if (result.success) {
        toast.success("Admin diturunkan menjadi pengguna biasa.");
        onDone();
      } else {
        setError(result.error ?? "Gagal menurunkan admin.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-500" />
        <div className="px-6 py-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
            <Icon
              icon="lucide:arrow-down-circle"
              width={26}
              height={26}
              className="text-amber-500"
            />
          </div>
          <h3 className="text-center font-open-sauce text-[17px] font-bold text-gray-900">
            Turunkan Admin?
          </h3>
          <div className="mt-1.5 text-center font-open-sauce text-[12.5px] text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-800">
              {target.fullName || target.email}
            </span>{" "}
            akan kehilangan akses admin dan kembali menjadi pengguna biasa.
          </div>

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
              onClick={handleDemote}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
            >
              {isPending ? (
                <Icon
                  icon="lucide:loader-2"
                  className="animate-spin"
                  width={14}
                  height={14}
                />
              ) : (
                "Ya, Turunkan"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminsClient({
  admins,
  totalAdmins,
  totalSuperAdmins,
  currentUserId,
}: {
  admins: AdminRow[];
  totalAdmins: number;
  totalSuperAdmins: number;
  currentUserId: string;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [demoteTarget, setDemoteTarget] = useState<AdminRow | null>(null);

  const handleDone = useCallback(() => {
    setShowCreate(false);
    setShowPromote(false);
    setDemoteTarget(null);
    router.refresh();
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 font-open-sauce text-[12px] text-gray-400">
        <span>Dashboard</span>
        <Icon
          icon="lucide:chevron-right"
          width={12}
          height={12}
          className="text-gray-300"
        />
        <span className="font-semibold text-[#17458f]">Admin</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-open-sauce text-2xl font-bold text-gray-900">
            Manajemen Admin
          </h1>
          <p className="mt-0.5 font-open-sauce text-sm text-gray-500">
            Kelola siapa saja yang memiliki akses ke panel admin Rotary.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowPromote(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#f7a81b]/30 bg-[#fff9f0] px-4 py-2.5 font-open-sauce text-[13px] font-semibold text-[#b9760a] transition-colors hover:bg-amber-100"
          >
            <Icon icon="lucide:arrow-up-circle" width={16} height={16} />
            Promosikan Pengguna
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17458f] px-4 py-2.5 font-open-sauce text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#123a78]"
          >
            <Icon icon="lucide:user-plus" width={16} height={16} />
            Tambah Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f7a81b] to-[#e89a14]">
            <Icon
              icon="lucide:crown"
              width={20}
              height={20}
              className="text-white"
            />
          </div>
          <div>
            <p className="font-open-sauce text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Super Admin
            </p>
            <p className="font-open-sauce text-[22px] font-bold leading-tight text-gray-900">
              {totalSuperAdmins.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#17458f] to-[#1a5cbf]">
            <Icon
              icon="lucide:shield-check"
              width={20}
              height={20}
              className="text-white"
            />
          </div>
          <div>
            <p className="font-open-sauce text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Admin
            </p>
            <p className="font-open-sauce text-[22px] font-bold leading-tight text-gray-900">
              {totalAdmins.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gradient-to-r from-[#f8faff] to-[#f0f4ff]">
                <th className="px-5 py-3.5 text-left font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Admin
                </th>
                <th className="px-5 py-3.5 text-left font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Peran
                </th>
                <th className="px-5 py-3.5 text-left font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Aktivitas Terakhir
                </th>
                <th className="px-5 py-3.5 text-left font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Bergabung
                </th>
                <th className="px-5 py-3.5 text-center font-open-sauce text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map((admin) => {
                const isSuper = admin.role === "super_admin";
                const isSelf = admin.id === currentUserId;
                const initials = getInitials(
                  admin.fullName || admin.email || "?",
                );
                return (
                  <tr
                    key={admin.id}
                    className="group transition-colors hover:bg-[#fafbff]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {admin.avatarUrl ? (
                          <Image
                            src={admin.avatarUrl}
                            alt={admin.fullName ?? ""}
                            width={36}
                            height={36}
                            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#17458f] to-[#1a5cbf] font-open-sauce text-[11px] font-bold text-white shadow-sm">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-open-sauce text-[13px] font-semibold text-gray-900">
                            {admin.fullName || (
                              <span className="italic text-gray-400">—</span>
                            )}
                            {isSelf && (
                              <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                Anda
                              </span>
                            )}
                          </p>
                          <p className="truncate font-open-sauce text-[11px] text-gray-400">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-open-sauce text-[11px] font-semibold ${
                          isSuper
                            ? "bg-[#f7a81b]/15 text-[#b9760a] border-[#f7a81b]/30"
                            : "bg-[#17458f]/10 text-[#17458f] border-[#17458f]/20"
                        }`}
                      >
                        <Icon
                          icon={
                            isSuper ? "lucide:crown" : "lucide:shield-check"
                          }
                          width={11}
                          height={11}
                        />
                        {isSuper ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-open-sauce text-[12px] text-gray-500">
                        {formatLastSeen(admin.lastSeenAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-open-sauce text-[12px] text-gray-500">
                        {formatDate(admin.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center">
                        {isSuper ? (
                          <span
                            title="Super admin tidak dapat diturunkan dari halaman ini"
                            className="font-open-sauce text-[11px] text-gray-300"
                          >
                            —
                          </span>
                        ) : (
                          <button
                            onClick={() => setDemoteTarget(admin)}
                            title="Turunkan menjadi pengguna"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-open-sauce text-[12px] font-semibold text-amber-600 transition-colors hover:bg-amber-50"
                          >
                            <Icon
                              icon="lucide:arrow-down-circle"
                              width={14}
                              height={14}
                            />
                            Turunkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onDone={handleDone}
        />
      )}
      {showPromote && (
        <PromoteModal
          onClose={() => setShowPromote(false)}
          onDone={handleDone}
        />
      )}
      {demoteTarget && (
        <DemoteModal
          target={demoteTarget}
          onClose={() => setDemoteTarget(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
