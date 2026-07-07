import { requireRole } from "@/lib/auth";
import { Icon } from "@iconify/react";
import AdminStatCard from "../_components/AdminStatCard";
import { getModerationData } from "./actions";
import ModerationQueues from "./_components/ModerationQueues";

export const metadata = {
  title: "Moderasi Konten — Rotary Admin",
  description:
    "Antrean review listing dan lokasi limbah sebelum tampil ke publik.",
};

export default async function AdminModerationPage() {
  await requireRole("admin");

  const data = await getModerationData();

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
        <span className="font-semibold text-[#17458f]">Moderasi</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-open-sauce text-2xl font-bold text-gray-900">
            Moderasi Konten
          </h1>
          <p className="mt-0.5 font-open-sauce text-sm text-gray-500">
            Tinjau listing yang dilaporkan dan lokasi limbah agar konten tetap
            aman.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Listing Menunggu"
          value={data.stats.pendingListings}
          icon="lucide:hourglass"
          iconBg="from-blue-500 to-blue-600"
        />
        <AdminStatCard
          label="Listing Diblokir"
          value={data.stats.blockedListings}
          icon="lucide:shield-alert"
          iconBg="from-red-500 to-rose-600"
        />
        <AdminStatCard
          label="Lokasi Limbah"
          value={data.stats.wasteLocations}
          icon="lucide:recycle"
          iconBg="from-[#f7a81b] to-[#e89a14]"
        />
        <AdminStatCard
          label="Selesai Bulan Ini"
          value={data.stats.resolvedThisMonth}
          icon="lucide:circle-check"
          iconBg="from-emerald-500 to-emerald-600"
        />
      </div>

      <ModerationQueues
        flaggedListings={data.flaggedListings}
        wasteLocations={data.wasteLocations}
      />
    </div>
  );
}
