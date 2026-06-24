import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatListingMode, formatListingStatus, formatPrice, type ListingMode, type ListingStatus } from "@/lib/listing-format";
import { getSellerListings, getSellerListingStats } from "@/lib/listings";
import {
  Badge,
  EmptyState,
  ListingStatsPills,
  ListingThumb,
  ModeBadge,
  PageHeader,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "../_components/SellerCenterUi";
import { ListingLifecycleActions } from "./_components/ListingLifecycleActions";

type SellerListingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ListingStatusFilter = ListingStatus | "all";
type ListingModeFilter = ListingMode | "all";
type ListingIssueFilter = "all" | "missing-photo" | "missing-location" | "missing-handover";
type SellerListingSort = "updated-desc" | "updated-asc" | "views-desc" | "favorites-desc" | "title-asc";

const statusOptions: { value: ListingStatusFilter; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "active", label: "Aktif" },
  { value: "reserved", label: "Dipesan" },
  { value: "completed", label: "Selesai" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Nonaktif" },
];

const modeOptions: { value: ListingModeFilter; label: string }[] = [
  { value: "all", label: "Semua mode" },
  { value: "sale", label: "Dijual" },
  { value: "donation", label: "Didonasi" },
];

const issueOptions: { value: ListingIssueFilter; label: string }[] = [
  { value: "all", label: "Semua kondisi" },
  { value: "missing-photo", label: "Butuh foto" },
  { value: "missing-location", label: "Lokasi belum presisi" },
  { value: "missing-handover", label: "Serah terima kosong" },
];

const sortOptions: { value: SellerListingSort; label: string }[] = [
  { value: "updated-desc", label: "Terbaru diperbarui" },
  { value: "updated-asc", label: "Paling lama dicek" },
  { value: "views-desc", label: "Paling dilihat" },
  { value: "favorites-desc", label: "Paling disimpan" },
  { value: "title-asc", label: "Judul A-Z" },
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeStatus(value: string | undefined): ListingStatusFilter {
  return value === "active"
    || value === "reserved"
    || value === "completed"
    || value === "draft"
    || value === "inactive"
    ? value
    : "all";
}

function normalizeMode(value: string | undefined): ListingModeFilter {
  return value === "sale" || value === "donation" ? value : "all";
}

function normalizeIssue(value: string | undefined): ListingIssueFilter {
  return value === "missing-photo" || value === "missing-location" || value === "missing-handover" ? value : "all";
}

function normalizeSort(value: string | undefined): SellerListingSort {
  return sortOptions.some((option) => option.value === value) ? (value as SellerListingSort) : "updated-desc";
}

function buildListingsHref(
  current: {
    q: string;
    status: ListingStatusFilter;
    mode: ListingModeFilter;
    issue: ListingIssueFilter;
    sort: SellerListingSort;
  },
  patch: Partial<Record<"q" | "status" | "mode" | "issue" | "sort", string | null>>,
) {
  const params = new URLSearchParams();
  const next = { ...current, ...patch };

  if (next.q) params.set("q", String(next.q));
  if (next.status && next.status !== "all") params.set("status", String(next.status));
  if (next.mode && next.mode !== "all") params.set("mode", String(next.mode));
  if (next.issue && next.issue !== "all") params.set("issue", String(next.issue));
  if (next.sort && next.sort !== "updated-desc") params.set("sort", String(next.sort));

  const query = params.toString();
  return query ? `/dashboard/listings?${query}` : "/dashboard/listings";
}

function matchesIssue(
  listing: Awaited<ReturnType<typeof getSellerListings>>[number],
  issue: ListingIssueFilter,
) {
  if (issue === "missing-photo") return !listing.imageUrl;
  if (issue === "missing-location") return listing.latitude === null || listing.longitude === null;
  if (issue === "missing-handover") return !listing.handoverOptions || listing.handoverOptions.length === 0;
  return true;
}

export default async function SellerListingsPage({ searchParams }: SellerListingsPageProps) {
  const params = await searchParams;
  const user = await requireRole("user");
  const [sellerListings, listingStats] = await Promise.all([
    getSellerListings(user.id),
    getSellerListingStats(user.id),
  ]);
  const q = firstParam(params.q)?.trim() ?? "";
  const status = normalizeStatus(firstParam(params.status));
  const mode = normalizeMode(firstParam(params.mode));
  const issue = normalizeIssue(firstParam(params.issue));
  const sort = normalizeSort(firstParam(params.sort));
  const current = { q, status, mode, issue, sort };
  const activeCount = sellerListings.filter((listing) => listing.status === "active").length;
  const reservedCount = sellerListings.filter((listing) => listing.status === "reserved").length;
  const completedCount = sellerListings.filter((listing) => listing.status === "completed").length;
  const draftCount = sellerListings.filter((listing) => listing.status === "draft").length;
  const inactiveCount = sellerListings.filter((listing) => listing.status === "inactive").length;
  const keyword = q.toLowerCase();
  const filteredListings = sellerListings
    .filter((listing) => {
      if (status !== "all" && listing.status !== status) return false;
      if (mode !== "all" && listing.mode !== mode) return false;
      if (!matchesIssue(listing, issue)) return false;
      if (!keyword) return true;

      return [
        listing.title,
        listing.category,
        listing.subcategory,
        listing.location,
        listing.condition,
      ].some((value) => value?.toLowerCase().includes(keyword));
    })
    .sort((a, b) => {
      if (sort === "updated-asc") return a.updatedAt.getTime() - b.updatedAt.getTime();
      if (sort === "views-desc") {
        return (listingStats[b.id]?.viewCount ?? 0) - (listingStats[a.id]?.viewCount ?? 0)
          || b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      if (sort === "favorites-desc") {
        return (listingStats[b.id]?.favoriteCount ?? 0) - (listingStats[a.id]?.favoriteCount ?? 0)
          || b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      if (sort === "title-asc") return a.title.localeCompare(b.title, "id-ID");
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  const hasActiveFilters = Boolean(q) || status !== "all" || mode !== "all" || issue !== "all" || sort !== "updated-desc";

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:list"
        kicker="Listing Saya"
        title="Semua Listing"
        description="Kelola barang bekas layak pakai yang dijual atau didonasikan lewat marketplace Rotary."
        meta={
          <>
            <Badge tone="success">{activeCount} aktif</Badge>
            <Badge tone="brand">{reservedCount} dipesan</Badge>
            <Badge tone="success">{completedCount} selesai</Badge>
            <Badge tone="accent">{draftCount} draft</Badge>
            <Badge tone="neutral">{inactiveCount} nonaktif</Badge>
          </>
        }
        actions={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Listing</PrimaryLink>}
      />

      <Panel
        title="Filter listing"
        description="Cari barang, cek status, dan urutkan listing yang perlu diprioritaskan."
        actions={<Badge tone="brand">{filteredListings.length} dari {sellerListings.length}</Badge>}
      >
        <form action="/dashboard/listings" method="get" className="grid gap-3 p-4 lg:grid-cols-[minmax(180px,1fr)_150px_150px_190px_180px_auto] lg:items-end">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Cari</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Judul, kategori, lokasi..."
              className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Status</span>
            <select name="status" defaultValue={status} className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[12px] outline-none focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Mode</span>
            <select name="mode" defaultValue={mode} className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[12px] outline-none focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]">
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Perlu Dicek</span>
            <select name="issue" defaultValue={issue} className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[12px] outline-none focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]">
              {issueOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Urutkan</span>
            <select name="sort" defaultValue={sort} className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[12px] outline-none focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button type="submit" className="min-h-11 rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]">
            Terapkan
          </button>
        </form>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--seller-rule)] px-4 py-3">
            {q ? <Badge tone="neutral">Cari: {q}</Badge> : null}
            {status !== "all" ? <Badge tone="neutral">Status: {formatListingStatus(status)}</Badge> : null}
            {mode !== "all" ? <Badge tone="neutral">Mode: {formatListingMode(mode)}</Badge> : null}
            {issue !== "all" ? <Badge tone="neutral">{issueOptions.find((option) => option.value === issue)?.label}</Badge> : null}
            {sort !== "updated-desc" ? <Badge tone="neutral">{sortOptions.find((option) => option.value === sort)?.label}</Badge> : null}
            <Link href="/dashboard/listings" className="ml-auto text-[12px] font-semibold text-[var(--seller-brand)] hover:text-[var(--seller-accent)]">
              Reset filter
            </Link>
          </div>
        ) : null}
      </Panel>

      <Panel>
        {sellerListings.length === 0 ? (
          <EmptyState
            icon="lucide:package-plus"
            title="Belum ada listing"
            description="Mulai unggah barang bekas layak pakai pertama kamu."
            action={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Buat Listing</PrimaryLink>}
          />
        ) : filteredListings.length === 0 ? (
          <EmptyState
            icon="lucide:search-x"
            title="Listing tidak ditemukan"
            description="Tidak ada listing yang cocok dengan filter saat ini."
            action={<Link href={buildListingsHref(current, { q: null, status: "all", mode: "all", issue: "all", sort: "updated-desc" })} className="inline-flex min-h-11 items-center rounded-[8px] border border-[var(--seller-rule-strong)] px-4 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]">Reset filter</Link>}
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {filteredListings.map((listing) => (
              <article
                key={listing.id}
                className="grid gap-3 px-4 py-4 transition-colors hover:bg-[var(--seller-surface-2)] lg:grid-cols-[56px_minmax(0,1.4fr)_190px_auto] lg:items-center"
              >
                <ListingThumb imageUrl={listing.imageUrl} muted={listing.status === "inactive" || listing.status === "completed"} />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <StatusBadge status={listing.status} mode={listing.mode} />
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.category} - {listing.condition}</p>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.location} - Diperbarui {listing.updatedAt.toLocaleDateString("id-ID")}</p>
                  <ListingStatsPills
                    className="mt-2 max-w-[230px]"
                    viewCount={listingStats[listing.id]?.viewCount ?? 0}
                    favoriteCount={listingStats[listing.id]?.favoriteCount ?? 0}
                  />
                </div>

                <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 py-2">
                  <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{formatPrice(listing.price, listing.mode)}</p>
                  <p className="mt-1 text-[11px] text-[var(--seller-muted)]">
                    {listing.status === "active"
                      ? "Tampil publik dan dapat dihubungi"
                      : listing.status === "reserved"
                        ? "Tampil publik, kontak dijeda"
                        : listing.status === "draft"
                          ? "Belum tampil publik"
                          : listing.status === "completed"
                            ? "Selesai dan tidak tampil publik"
                            : "Disembunyikan"}
                  </p>
                </div>

                <div className="lg:flex lg:justify-end">
                  <ListingLifecycleActions
                    listingId={listing.id}
                    mode={listing.mode}
                    status={listing.status}
                    title={listing.title}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
