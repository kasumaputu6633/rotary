import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getListingImages, getSellerListingById } from "@/lib/listings";
import { updateListingAction } from "@/app/dashboard/actions";
import { Badge, PageHeader } from "@/app/dashboard/_components/SellerCenterUi";
import { ListingForm } from "@/app/dashboard/listings/_components/ListingForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const user = await requireRole("user");
  const [listing, images] = await Promise.all([
    getSellerListingById(id, user.id),
    getListingImages(id),
  ]);

  if (!listing) notFound();

  const boundAction = updateListingAction.bind(null, listing.id);

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:pencil"
        kicker="Edit Listing"
        title={listing.title}
        description="Perbarui detail listing barang kamu. Perubahan langsung berlaku setelah disimpan."
        meta={
          <>
            <Badge tone={listing.status === "active" ? "success" : listing.status === "draft" ? "accent" : "neutral"}>
              {listing.status === "active" ? "Aktif" : listing.status === "draft" ? "Draft" : "Nonaktif"}
            </Badge>
            <Badge tone="neutral">{listing.category}</Badge>
          </>
        }
      />

      <ListingForm
        action={boundAction}
        images={images}
        values={listing}
        submitTitle="Simpan perubahan"
        submitDescription={
          listing.status === "active"
            ? "Listing aktif. Perubahan langsung tampil di marketplace."
            : listing.status === "inactive"
              ? "Simpan perubahan tanpa menampilkan listing, atau aktifkan lagi ke marketplace."
              : "Simpan draft atau terbitkan ke marketplace sekarang."
        }
      />
    </div>
  );
}
