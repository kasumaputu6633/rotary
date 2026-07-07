import { requireRole } from "@/lib/auth";
import { Icon } from "@iconify/react";
import { getAdminListings } from "./actions";
import ListingsStatsRow from "./_components/ListingsStatsRow";
import ListingsTable from "./_components/ListingsTable";
import type { ListingMode, ListingStatus } from "@/lib/listing-format";

export const metadata = {
  title: "Kelola Listing — Rotary Admin",
  description: "Moderasi listing barang marketplace Rotary.",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    mode?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

const VALID_STATUSES: ListingStatus[] = [
  "draft",
  "active",
  "reserved",
  "completed",
  "inactive",
  "blocked",
];

export default async function AdminListingsPage({ searchParams }: PageProps) {
  await requireRole("admin");

  const params = await searchParams;
  const search = params.search ?? "";
  const status = VALID_STATUSES.includes(params.status as ListingStatus)
    ? (params.status as ListingStatus)
    : undefined;
  const mode =
    params.mode === "sale" || params.mode === "donation"
      ? (params.mode as ListingMode)
      : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const data = await getAdminListings({
    search,
    status,
    mode,
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
        <span className="font-semibold text-[#17458f]">Listing</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-open-sauce text-2xl font-bold text-gray-900">
            Kelola Listing
          </h1>
          <p className="mt-0.5 font-open-sauce text-sm text-gray-500">
            Moderasi listing barang marketplace agar tetap relevan dan aman.
          </p>
        </div>
      </div>

      {/* Stats */}
      <ListingsStatsRow
        total={data.stats.total}
        active={data.stats.active}
        draft={data.stats.draft}
        inactive={data.stats.inactive}
        blocked={data.stats.blocked}
      />

      {/* Table Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ListingsTable
          listings={data.listings}
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
