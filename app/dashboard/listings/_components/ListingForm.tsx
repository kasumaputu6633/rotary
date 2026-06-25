import type { ListingMode, ListingStatus } from "@/lib/listing-format";
import { ListingCategoryPicker } from "../new/_components/ListingCategoryPicker";
import { ListingDescriptionField } from "../new/_components/ListingDescriptionField";
import { ListingHandoverOptions } from "../new/_components/ListingHandoverOptions";
import { ListingImagePicker } from "../new/_components/ListingImagePicker";
import { ListingLocationPickerLazy as ListingLocationPicker } from "../new/_components/ListingLocationPickerLazy";
import { ListingModePriceFields } from "../new/_components/ListingModePriceFields";
import { ListingSubmitButtons } from "../new/_components/ListingSubmitButtons";
import { Panel } from "../../_components/SellerCenterUi";
import { SellerSelect } from "../../_components/SellerSelect";

const conditionOptions = ["Baru dibuka", "Sangat baik", "Bekas layak pakai", "Perlu perbaikan ringan"];
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
  if (status === "active" || status === "reserved" || status === "completed") {
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

            <ListingDescriptionField
              defaultValue={values.description}
              labelClass={labelClass}
              labelTextClass={labelTextClass}
            />

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

            <div className="grid items-start gap-4 md:grid-cols-3">
              <ListingModePriceFields
                defaultMode={values.mode}
                defaultPrice={values.price}
                fieldClass={fieldClass}
                labelClass={labelClass}
                labelTextClass={labelTextClass}
              />
              <div className={labelClass}>
                <span className={labelTextClass}>Kondisi</span>
                <SellerSelect
                  ariaLabel="Kondisi"
                  name="condition"
                  defaultValue={values.condition ?? conditionOptions[0]}
                  dropdownDirection="up"
                  className={fieldClass}
                  options={conditionOptions.map((option) => ({ value: option, label: option }))}
                />
              </div>
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
          <p className="mt-1 text-[12px] text-[var(--seller-muted)]">Pilih minimal 1 cara serah terima.</p>
          <ListingHandoverOptions defaultValue={values.handoverOptions} />
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
