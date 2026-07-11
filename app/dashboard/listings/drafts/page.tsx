import { requireNonAdmin } from "@/lib/auth";
import { getSellerListings } from "@/lib/listings";
import { EmptyState, ListingThumb, ModeBadge, PageHeader, Panel, PrimaryLink } from "../../_components/SellerCenterUi";
import { ListingLifecycleActions } from "../_components/ListingLifecycleActions";

export default async function DraftListingsPage() {
  const user = await requireNonAdmin();
  const drafts = await getSellerListings(user.id, "draft");

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:file"
        kicker="Listing Saya"
        title="Draft Listing"
        description="Barang yang belum diterbitkan ke marketplace dan masih bisa kamu lengkapi."
        actions={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Buat Listing</PrimaryLink>}
      />

      <Panel>
        {drafts.length > 0 ? (
          <div className="divide-y divide-[var(--seller-rule)]">
            {drafts.map((listing) => (
              <article key={listing.id} className="grid gap-3 px-4 py-4 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center">
                <ListingThumb imageUrl={listing.imageUrl} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.category} - Diperbarui {listing.updatedAt.toLocaleDateString("id-ID")}</p>
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
        ) : (
          <EmptyState
            icon="lucide:file"
            title="Belum ada draft"
            description="Simpan listing sebagai draft kalau datanya belum lengkap."
            action={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Buat Listing</PrimaryLink>}
          />
        )}
      </Panel>
    </div>
  );
}
