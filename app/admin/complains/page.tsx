import { requireRole } from "@/lib/auth";
import { Icon } from "@iconify/react";
import AdminStatCard from "../_components/AdminStatCard";
import { getAdminComplaints } from "./actions";
import ComplaintsTable from "./_components/ComplaintsTable";
import type { ComplaintStatus } from "@/lib/moderation-format";

export const metadata = {
  title: "Komplain User — Rotary Admin",
  description: "Laporan dan keluhan yang dikirim pengguna Rotary.",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

const VALID_STATUSES: ComplaintStatus[] = [
  "new",
  "reviewing",
  "resolved",
  "rejected",
];

export default async function AdminComplainsPage({ searchParams }: PageProps) {
  await requireRole("admin");

  const params = await searchParams;
  const search = params.search ?? "";
  const status = VALID_STATUSES.includes(params.status as ComplaintStatus)
    ? (params.status as ComplaintStatus)
    : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const data = await getAdminComplaints({
    search,
    status,
    page,
    pageSize: PAGE_SIZE,
  });

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
        <span className="font-semibold text-[#17458f]">Komplain User</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-open-sauce text-2xl font-bold text-gray-900">
            Komplain User
          </h1>
          <p className="mt-0.5 font-open-sauce text-sm text-gray-500">
            Laporan yang masuk dari pengguna. Tinjau, tangani, lalu selesaikan
            atau tolak.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <AdminStatCard
          label="Komplain Baru"
          value={data.stats.newCount}
          icon="lucide:inbox"
          iconBg="from-blue-500 to-blue-600"
        />
        <AdminStatCard
          label="Sedang Ditinjau"
          value={data.stats.reviewing}
          icon="lucide:search"
          iconBg="from-[#f7a81b] to-[#e89a14]"
        />
        <AdminStatCard
          label="Prioritas Tinggi"
          value={data.stats.highPriority}
          icon="lucide:flame"
          iconBg="from-red-500 to-rose-600"
        />
        <AdminStatCard
          label="Selesai Bulan Ini"
          value={data.stats.resolvedThisMonth}
          icon="lucide:circle-check"
          iconBg="from-emerald-500 to-emerald-600"
        />
        <AdminStatCard
          label="Total Komplain"
          value={data.stats.total}
          icon="lucide:message-square-warning"
          iconBg="from-[#17458f] to-[#1a5cbf]"
        />
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ComplaintsTable
          complaints={data.complaints}
          total={data.total}
          page={page}
          pageSize={PAGE_SIZE}
          search={search}
          status={params.status ?? ""}
        />
      </div>
    </div>
  );
}
