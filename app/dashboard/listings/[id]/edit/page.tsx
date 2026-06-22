import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getListingImages, getSellerListingById } from "@/lib/listings";
import { updateListingAction } from "@/app/dashboard/actions";
import { Badge, PageHeader, Panel } from "@/app/dashboard/_components/SellerCenterUi";
import { ListingCategoryPicker } from "@/app/dashboard/listings/new/_components/ListingCategoryPicker";
import { ListingImagePicker } from "@/app/dashboard/listings/new/_components/ListingImagePicker";
import { ListingLocationPickerLazy as ListingLocationPicker } from "@/app/dashboard/listings/new/_components/ListingLocationPickerLazy";
import { ListingModePriceFields } from "@/app/dashboard/listings/new/_components/ListingModePriceFields";
import { ListingSubmitButtons } from "@/app/dashboard/listings/new/_components/ListingSubmitButtons";

type Props = {
  params: Promise<{ id: string }>;
};

const conditionOptions = ["Baru dibuka", "Sangat baik", "Bekas layak pakai", "Perlu perbaikan ringan"];
const deliveryOptions = ["Ambil di tempat", "Titik temu", "Bisa dikirim manual"];
const fieldClass =
  "h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]";
const labelClass = "grid gap-2";
const labelTextClass = "text-[12px] font-semibold text-[var(--seller-ink)]";

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

      <form action={boundAction} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_332px]">
        <div className="grid gap-4">
          <Panel title="Kategori Barang" description="Kategori induk menentukan pilihan subkategori yang tersedia.">
            <ListingCategoryPicker
              defaultCategory={listing.category}
              defaultSubcategory={listing.subcategory ?? undefined}
            />
          </Panel>

          <Panel title="Detail Barang" description="Tulis informasi yang membantu calon pembeli memahami kondisi barang.">
            <div className="grid gap-4 p-4">
              <label className={labelClass}>
                <span className={labelTextClass}>Judul Listing</span>
                <input
                  name="title"
                  required
                  maxLength={180}
                  defaultValue={listing.title}
                  className={fieldClass}
                  placeholder="Contoh: Rak Buku Kayu Minimalis"
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Deskripsi</span>
                <textarea
                  name="description"
                  defaultValue={listing.description ?? ""}
                  className="min-h-32 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 py-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
                  placeholder="Ceritakan kondisi barang, kelengkapan, ukuran, dan catatan penting."
                />
              </label>

              <div className={labelClass}>
                <span className={labelTextClass}>Lokasi Barang</span>
                <ListingLocationPicker
                  defaultLocation={listing.location}
                  defaultLatitude={listing.latitude}
                  defaultLongitude={listing.longitude}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <ListingModePriceFields
                  defaultMode={listing.mode}
                  defaultPrice={listing.price}
                  fieldClass={fieldClass}
                  labelClass={labelClass}
                  labelTextClass={labelTextClass}
                />
                <label className={labelClass}>
                  <span className={labelTextClass}>Kondisi</span>
                  <select name="condition" required defaultValue={listing.condition} className={fieldClass}>
                    {conditionOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </Panel>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] p-4 shadow-[var(--seller-shadow)]">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Foto Barang</h2>
            <p className="mt-1 text-[12px] text-[var(--seller-muted)]">
              {images.length > 0
                ? `${images.length} foto tersimpan. Hapus atau tambah foto baru.`
                : "Upload maksimal 4 foto. JPG, PNG, atau WEBP."}
            </p>
            <ListingImagePicker existingImages={images} />
          </section>

          <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] p-4 shadow-[var(--seller-shadow)]">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Serah Terima</h2>
            <div className="mt-3 grid gap-2">
              {deliveryOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 py-2 text-[12px] text-[var(--seller-ink)]">
                  <input
                    name="handoverOptions"
                    type="checkbox"
                    value={option}
                    defaultChecked={listing.handoverOptions?.includes(option) ?? option === "Ambil di tempat"}
                    className="accent-[var(--seller-brand)]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] p-4">
            <h2 className="text-[15px] font-semibold text-[var(--seller-brand)]">Simpan perubahan</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
              {listing.status === "active"
                ? "Listing aktif. Perubahan langsung tampil di marketplace."
                : listing.status === "inactive"
                  ? "Simpan perubahan tanpa menampilkan listing, atau aktifkan lagi ke marketplace."
                  : "Simpan draft atau terbitkan ke marketplace sekarang."}
            </p>
            <ListingSubmitButtons
              publishLabel={listing.status === "inactive" ? "Aktifkan Listing" : listing.status === "active" ? "Simpan Perubahan" : "Terbitkan Listing"}
              draftLabel={listing.status === "inactive" ? "Simpan Perubahan" : "Simpan Draft"}
              showDraftButton={listing.status !== "active"}
            />
          </section>
        </aside>
      </form>
    </div>
  );
}
