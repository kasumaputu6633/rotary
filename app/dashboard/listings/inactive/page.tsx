import { requireNonAdmin } from "@/lib/auth";
import { getSellerListings } from "@/lib/listings";
import { EmptyState, ListingThumb, ModeBadge, PageHeader, Panel, PrimaryLink, SecondaryLink } from "../../_components/SellerCenterUi";
import { ListingLifecycleActions } from "../_components/ListingLifecycleActions";

export default async function InactiveListingsPage() {
  const user = await requireNonAdmin();
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
            action={<SecondaryLink href="/dashboard/listings" icon="lucide:list">Buka Semua Listing</SecondaryLink>}
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
                <ListingLifecycleActions
                  density="comfortable"
                  listingId={listing.id}
                  mode={listing.mode}
                  status={listing.status}
                  title={listing.title}
                />
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
