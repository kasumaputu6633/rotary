import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSellerListings } from "@/lib/listings";
import { EmptyState, ListingThumb, ModeBadge, PageHeader, Panel, PrimaryLink } from "../../_components/SellerCenterUi";
import { ListingStatusButton } from "../_components/ListingStatusButton";
import { DeleteListingButton } from "../_components/DeleteListingButton";

export default async function InactiveListingsPage() {
  const user = await requireRole("user");
  const inactiveListings = await getSellerListings(user.id, "inactive");

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:archive"
        kicker="Listing Saya"
        title="Listing Nonaktif"
        description="Barang yang disembunyikan dari marketplace publik dan bisa kamu aktifkan lagi."
        actions={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Barang</PrimaryLink>}
      />

      <Panel>
        {inactiveListings.length === 0 ? (
          <EmptyState
            icon="lucide:archive"
            title="Belum ada listing nonaktif"
            description="Listing yang kamu sembunyikan dari marketplace akan muncul di sini."
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {inactiveListings.map((listing) => (
              <article key={listing.id} className="grid gap-3 px-4 py-4 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center">
                <ListingThumb imageUrl={listing.imageUrl} muted />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.category} - {listing.location} - Diperbarui {listing.updatedAt.toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]"
                  >
                    Edit
                  </Link>
                  <ListingStatusButton
                    listingId={listing.id}
                    newStatus="active"
                    icon="lucide:rotate-ccw"
                    label="Aktifkan"
                    successMessage="Listing berhasil diaktifkan."
                    className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--seller-accent)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]"
                  />
                  <DeleteListingButton
                    listingId={listing.id}
                    title={listing.title}
                    className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--seller-danger)] px-3 text-[12px] font-semibold text-[var(--seller-danger)] hover:bg-[#fff0f0]"
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
