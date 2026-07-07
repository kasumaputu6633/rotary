"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "../../actions";

type DefaultValues = {
  bio?: string | null;
  phoneVerified: boolean;
  shopName?: string | null;
  whatsappContactEnabled: boolean;
};

const fieldClass =
  "min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]";

function FieldHeader({
  children,
  visibility,
}: {
  children: React.ReactNode;
  visibility: "public" | "private" | "future";
}) {
  const isPublic = visibility === "public";
  const icon = isPublic ? "lucide:eye" : visibility === "private" ? "lucide:lock-keyhole" : "lucide:clock-3";
  const label = isPublic ? "Tampil publik" : visibility === "private" ? "Privat" : "Disiapkan";

  return (
    <span className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-semibold text-[var(--seller-ink)]">{children}</span>
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
        isPublic ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"
      }`}>
        <Icon icon={icon} width={12} height={12} aria-hidden="true" />
        {label}
      </span>
    </span>
  );
}

export function ProfileForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bio, setBio] = useState(defaultValues.bio ?? "");
  const [shopName, setShopName] = useState(defaultValues.shopName ?? "");
  const [whatsappContactEnabled, setWhatsappContactEnabled] = useState(
    defaultValues.whatsappContactEnabled,
  );
  const hasChanges =
    shopName !== (defaultValues.shopName ?? "")
    || bio !== (defaultValues.bio ?? "")
    || whatsappContactEnabled !== defaultValues.whatsappContactEnabled;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Profil lapak berhasil disimpan.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan profil. Coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-0">
      <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:p-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Identitas lapak</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Nama lapak membantu calon peminat mengenali siapa yang memasang barang.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid max-w-2xl gap-1.5">
            <FieldHeader visibility="public">Nama lapak</FieldHeader>
            <input
              name="shopName"
              type="text"
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              placeholder="Contoh: Lapak Putu"
              minLength={2}
              maxLength={80}
              required
              className={fieldClass}
            />
            <span className="text-[11px] text-[var(--seller-muted)]">Dipakai di navbar dan sebagai nama lapak pada listing.</span>
          </label>
        </div>
      </section>

      <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:p-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Cara dihubungi</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Pilih apakah calon peminat boleh menghubungimu langsung melalui WhatsApp.
          </p>
        </div>

        <div className={`rounded-[9px] border p-4 ${
          whatsappContactEnabled
            ? "border-[var(--seller-success)]/35 bg-[var(--seller-success-soft)]"
            : "border-[var(--seller-rule)] bg-[var(--seller-surface-2)]"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${
                whatsappContactEnabled
                  ? "bg-white text-[var(--seller-success)]"
                  : "bg-white text-[var(--seller-muted)]"
              }`}>
                <Icon icon="ic:baseline-whatsapp" width={20} height={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--seller-ink)]">
                  Tampilkan tombol WhatsApp
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                  {defaultValues.phoneVerified
                    ? whatsappContactEnabled
                      ? "Tombol WhatsApp tampil pada semua listing aktif milikmu."
                      : "Peminat akan diarahkan menggunakan chat Rotary tanpa tombol WhatsApp."
                    : "Verifikasi nomor HP dahulu jika ingin menyediakan WhatsApp sebagai pilihan tambahan."}
                </p>
              </div>
            </div>

            <input
              type="hidden"
              name="whatsappContactEnabled"
              value={whatsappContactEnabled ? "on" : "off"}
            />
            <button
              type="button"
              role="switch"
              aria-checked={whatsappContactEnabled}
              aria-label="Tampilkan tombol WhatsApp pada listing"
              disabled={!defaultValues.phoneVerified}
              onClick={() => setWhatsappContactEnabled((enabled) => !enabled)}
              className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] ${
                whatsappContactEnabled
                  ? "border-[var(--seller-success)] bg-[var(--seller-success)]"
                  : "border-[var(--seller-rule-strong)] bg-[var(--seller-paper-2)]"
              } ${
              defaultValues.phoneVerified ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{
                  transform: whatsappContactEnabled ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </button>
          </div>

          {!defaultValues.phoneVerified ? (
            <Link
              href="/account/settings?tab=contact"
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-[7px] border border-[var(--seller-rule-strong)] bg-white px-3 text-[11px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
            >
              Verifikasi nomor HP
              <Icon icon="lucide:arrow-right" width={12} height={12} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 p-4 sm:p-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Tentang lapak</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Bio disimpan sekarang dan akan dipakai saat halaman profil publik dibuat.
          </p>
        </div>

        <label className="grid gap-1.5">
          <FieldHeader visibility="future">Bio lapak</FieldHeader>
          <textarea
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Ceritakan jenis barang yang biasa kamu jual atau donasikan."
            maxLength={280}
            rows={4}
            className={`${fieldClass} resize-y py-3 leading-relaxed`}
          />
          <span className="flex items-center justify-between gap-3 text-[11px] text-[var(--seller-muted)]">
            <span>Belum tampil di halaman barang saat ini.</span>
            <span className="tabular-nums">{bio.length}/280</span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--seller-rule)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            <Icon icon="lucide:circle-user-round" width={14} height={14} className="mt-0.5 shrink-0 text-[var(--seller-brand)]" aria-hidden="true" />
            Identitas pribadi, foto akun, dan keamanan dikelola melalui Pengaturan Akun.
          </p>
          <button
            type="submit"
            disabled={isPending || !hasChanges}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-[var(--seller-accent)] px-5 text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon={isPending ? "lucide:loader-circle" : "lucide:save"} width={15} height={15} className={isPending ? "animate-spin" : ""} aria-hidden="true" />
            {isPending ? "Menyimpan..." : hasChanges ? "Simpan Perubahan" : "Sudah Tersimpan"}
          </button>
        </div>
      </section>
    </form>
  );
}
