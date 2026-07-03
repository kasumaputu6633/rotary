import { createListingAction } from "../../actions";
import { Badge, PageHeader } from "../../_components/SellerCenterUi";
import { ListingForm } from "../_components/ListingForm";
import { requireRole } from "@/lib/auth";
import { getActiveCategories } from "@/lib/categories";

export default async function NewListingPage() {
  await requireRole("user");
  const categories = await getActiveCategories();

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:package-plus"
        kicker="Tambah Barang"
        title="Buat Listing Baru"
        description="Unggah barang bekas layak pakai untuk dijual atau didonasikan. Listing aktif akan langsung tampil di marketplace."
        meta={
          <>
            <Badge tone="brand">Barang reusable</Badge>
            <Badge tone="accent">Jual atau donasi</Badge>
          </>
        }
      />

      <ListingForm
        action={createListingAction}
        categories={categories}
        submitTitle="Terbitkan listing"
        submitDescription="Simpan draft kalau belum lengkap, atau terbitkan agar langsung tampil di marketplace."
      />
    </div>
  );
}
