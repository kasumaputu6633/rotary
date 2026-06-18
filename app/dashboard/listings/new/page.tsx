import { createListingAction } from "../../actions";
import { Badge, PageHeader, Panel } from "../../_components/SellerCenterUi";
import { ListingCategoryPicker } from "./_components/ListingCategoryPicker";
import { ListingImagePicker } from "./_components/ListingImagePicker";
import { ListingSubmitButtons } from "./_components/ListingSubmitButtons";

const conditionOptions = ["Baru dibuka", "Sangat baik", "Bekas layak pakai", "Perlu perbaikan ringan"];
const deliveryOptions = ["Ambil di tempat", "Titik temu", "Bisa dikirim manual"];
const fieldClass =
  "h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]";
const labelClass = "grid gap-2";
const labelTextClass = "text-[12px] font-semibold text-[var(--seller-ink)]";

export default function NewListingPage() {
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

      <form action={createListingAction} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_332px]">
        <div className="grid gap-4">
          <Panel title="Kategori Barang" description="Kategori induk menentukan pilihan subkategori yang tersedia.">
            <ListingCategoryPicker />
          </Panel>

          <Panel title="Detail Barang" description="Tulis informasi yang membantu calon pembeli memahami kondisi barang.">
            <div className="grid gap-4 p-4">
              <label className={labelClass}>
                <span className={labelTextClass}>Judul Listing</span>
                <input name="title" required maxLength={180} className={fieldClass} placeholder="Contoh: Rak Buku Kayu Minimalis" />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Deskripsi</span>
                <textarea
                  name="description"
                  className="min-h-32 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 py-3 text-[13px] outline-none transition focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
                  placeholder="Ceritakan kondisi barang, kelengkapan, ukuran, dan catatan penting."
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className={labelClass}>
                  <span className={labelTextClass}>Mode Listing</span>
                  <select name="mode" className={fieldClass}>
                    <option value="sale">Dijual</option>
                    <option value="donation">Didonasi</option>
                  </select>
                </label>
                <label className={labelClass}>
                  <span className={labelTextClass}>Harga jika dijual</span>
                  <input name="price" inputMode="numeric" className={fieldClass} placeholder="180000" />
                </label>
                <label className={labelClass}>
                  <span className={labelTextClass}>Kondisi</span>
                  <select name="condition" required className={fieldClass}>
                    {conditionOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={labelClass}>
                <span className={labelTextClass}>Lokasi Barang</span>
                <input name="location" required maxLength={160} className={fieldClass} placeholder="Contoh: Denpasar Barat, Bali" />
              </label>
            </div>
          </Panel>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] p-4 shadow-[var(--seller-shadow)]">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Foto Barang</h2>
            <p className="mt-1 text-[12px] text-[var(--seller-muted)]">Upload maksimal 4 foto. JPG, PNG, atau WEBP.</p>
            <ListingImagePicker />
          </section>

          <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] p-4 shadow-[var(--seller-shadow)]">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Serah Terima</h2>
            <div className="mt-3 grid gap-2">
              {deliveryOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 py-2 text-[12px] text-[var(--seller-ink)]">
                  <input name="handoverOptions" type="checkbox" value={option} defaultChecked={option === "Ambil di tempat"} className="accent-[var(--seller-brand)]" />
                  {option}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] p-4">
            <h2 className="text-[15px] font-semibold text-[var(--seller-brand)]">Terbitkan listing</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
              Simpan draft kalau belum lengkap, atau terbitkan agar langsung tampil di marketplace.
            </p>
            <ListingSubmitButtons />
          </section>
        </aside>
      </form>
    </div>
  );
}
