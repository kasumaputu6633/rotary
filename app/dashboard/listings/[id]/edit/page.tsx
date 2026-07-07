import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getListingImages, getSellerListingById } from "@/lib/listings";
import { getActiveCategories } from "@/lib/categories";
import { updateListingAction } from "@/app/dashboard/actions";
import { Badge, PageHeader, StatusBadge } from "@/app/dashboard/_components/SellerCenterUi";
import { ListingForm } from "@/app/dashboard/listings/_components/ListingForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const user = await requireRole("user");
  const [listing, images, activeCategories] = await Promise.all([
    getSellerListingById(id, user.id),
    getListingImages(id),
    getActiveCategories(),
  ]);

  if (!listing) notFound();

  // Kategori listing bisa saja sudah dinonaktifkan/di-rename admin. Sisipkan
  // kategori saat ini bila hilang dari daftar aktif agar pilihan tidak berubah
  // diam-diam saat form dibuka.
  const categories = activeCategories.some((c) => c.name === listing.category)
    ? activeCategories
    : [
        {
          name: listing.category,
          icon: "lucide:tag",
          subcategories: listing.subcategory ? [listing.subcategory] : [],
        },
        ...activeCategories,
      ];

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
            <StatusBadge status={listing.status} mode={listing.mode} />
            <Badge tone="neutral">{listing.category}</Badge>
          </>
        }
      />

      <ListingForm
        action={boundAction}
        categories={categories}
        images={images}
        values={listing}
        submitTitle="Simpan perubahan"
        submitDescription={
          listing.status === "active"
            ? "Listing aktif. Perubahan langsung tampil di marketplace."
            : listing.status === "reserved"
              ? "Listing sedang dipesan dan tetap terlihat publik. Perubahan detail tidak mengaktifkan kontak baru."
              : listing.status === "completed"
                ? "Listing sudah selesai dan tidak tampil publik. Gunakan aksi Tawarkan Lagi jika barang kembali tersedia."
                : listing.status === "inactive"
                  ? "Simpan perubahan tanpa menampilkan listing, atau aktifkan lagi ke marketplace."
                  : "Simpan draft atau terbitkan ke marketplace sekarang."
        }
      />
    </div>
  );
}
