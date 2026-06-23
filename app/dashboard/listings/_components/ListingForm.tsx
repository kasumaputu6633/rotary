import type { ListingMode, ListingStatus } from "@/lib/listing-format";
import { ListingCategoryPicker } from "../new/_components/ListingCategoryPicker";
import { ListingImagePicker } from "../new/_components/ListingImagePicker";
import { ListingLocationPickerLazy as ListingLocationPicker } from "../new/_components/ListingLocationPickerLazy";
import { ListingModePriceFields } from "../new/_components/ListingModePriceFields";
import { ListingSubmitButtons } from "../new/_components/ListingSubmitButtons";
import { Panel } from "../../_components/SellerCenterUi";

const conditionOptions = ["Baru dibuka", "Sangat baik", "Bekas layak pakai", "Perlu perbaikan ringan"];
const deliveryOptions = ["Ambil di tempat", "Titik temu", "Bisa dikirim manual"];
const fieldClass =
  "h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]";
const labelClass = "grid gap-2";
const labelTextClass = "text-[12px] font-semibold text-[var(--seller-ink)]";

export type ListingFormValues = {
  category?: string;
  condition?: string;
  description?: string | null;
  handoverOptions?: string[] | null;
  latitude?: number | null;
  location?: string;
  longitude?: number | null;
  mode?: ListingMode;
  price?: number | null;
  status?: ListingStatus;
  subcategory?: string | null;
  title?: string;
};

type ListingFormImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type ListingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  images?: ListingFormImage[];
  submitDescription: string;
  submitTitle: string;
  values?: ListingFormValues;
};

function getSubmitLabels(status?: ListingStatus) {
  if (status === "active") {
    return {
      draftLabel: "Simpan Draft",
      publishLabel: "Simpan Perubahan",
      showDraftButton: false,
    };
  }

  if (status === "inactive") {
    return {
      draftLabel: "Simpan Perubahan",
      publishLabel: "Aktifkan Listing",
      showDraftButton: true,
    };
  }

  return {
    draftLabel: "Simpan Draft",
    publishLabel: "Terbitkan Listing",
    showDraftButton: true,
  };
}

export function ListingForm({
  action,
  images = [],
  submitDescription,
  submitTitle,
  values = {},
}: ListingFormProps) {
  const submitLabels = getSubmitLabels(values.status);

  return (
    <form action={action} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_332px]">
      <div className="grid gap-4">
        <Panel title="Kategori Barang" description="Kategori induk menentukan pilihan subkategori yang tersedia.">
          <ListingCategoryPicker
            defaultCategory={values.category}
            defaultSubcategory={values.subcategory ?? undefined}
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
                defaultValue={values.title ?? ""}
                className={fieldClass}
                placeholder="Contoh: Rak Buku Kayu Minimalis"
              />
            </label>

            <label className={labelClass}>
              <span className={labelTextClass}>Deskripsi</span>
              <textarea
                name="description"
                defaultValue={values.description ?? ""}
                className="min-h-32 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 py-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
                placeholder="Ceritakan kondisi barang, kelengkapan, ukuran, dan catatan penting."
              />
            </label>

            <div className={labelClass}>
              <span className={labelTextClass}>Lokasi Barang</span>
              <p className="text-[11px] leading-relaxed text-[var(--seller-muted)]">
                Yang tampil di marketplace hanya kota/kabupaten. Alamat detail bisa dibahas saat chat, pengiriman, atau penjemputan.
              </p>
              <ListingLocationPicker
                defaultLocation={values.location}
                defaultLatitude={values.latitude}
                defaultLongitude={values.longitude}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ListingModePriceFields
                defaultMode={values.mode}
                defaultPrice={values.price}
                fieldClass={fieldClass}
                labelClass={labelClass}
                labelTextClass={labelTextClass}
              />
              <label className={labelClass}>
                <span className={labelTextClass}>Kondisi</span>
                <select name="condition" required defaultValue={values.condition} className={fieldClass}>
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
                  defaultChecked={values.handoverOptions?.includes(option) ?? option === "Ambil di tempat"}
                  className="accent-[var(--seller-brand)]"
                />
                {option}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] p-4">
          <h2 className="text-[15px] font-semibold text-[var(--seller-brand)]">{submitTitle}</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">{submitDescription}</p>
          <ListingSubmitButtons {...submitLabels} />
        </section>
      </aside>
    </form>
  );
}
