"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "../../actions";

type DefaultValues = {
  name?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-[var(--seller-ink)]">
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-[var(--seller-muted)]">{children}</p>;
}

export function ProfileForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(defaultValues.avatarUrl ?? null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setAvatarPreviewUrl(null);
    setRemoveAvatar(Boolean(defaultValues.avatarUrl));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Profil berhasil disimpan.");
        router.refresh();
      } catch {
        toast.error("Gagal menyimpan profil. Coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 p-4">
      <div className="grid gap-3 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[12px] bg-[var(--seller-brand)] text-[20px] font-semibold text-white">
          {avatarPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreviewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon icon="lucide:user-round" width={28} height={28} aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--seller-ink)]">Foto profil lapak</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Tampil di Seller Center dan halaman produk. Gunakan foto wajah atau identitas lapak yang jelas.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              ref={avatarInputRef}
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="sr-only"
            />
            <input type="hidden" name="removeAvatar" value={removeAvatar ? "1" : "0"} />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition hover:bg-[var(--seller-brand-soft)]"
            >
              <Icon icon="lucide:image-up" width={14} height={14} aria-hidden="true" />
              {avatarPreviewUrl ? "Ganti foto" : "Pilih foto"}
            </button>
            {avatarPreviewUrl ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--seller-danger)] px-3 text-[12px] font-semibold text-[var(--seller-danger)] transition hover:bg-[var(--seller-danger-soft)]"
              >
                <Icon icon="lucide:trash-2" width={14} height={14} aria-hidden="true" />
                Hapus
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-[var(--seller-muted)]">JPG, PNG, atau WEBP. Maksimal 5MB.</p>
        </div>
      </div>

      <div className="grid gap-1.5">
        <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultValues.name ?? ""}
          placeholder="Nama kamu"
          maxLength={255}
          className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <FieldHint>Ditampilkan sebagai nama pemilik listing di marketplace.</FieldHint>
      </div>

      <div className="grid gap-1.5">
        <FieldLabel htmlFor="whatsapp">Nomor WhatsApp publik</FieldLabel>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          defaultValue={defaultValues.whatsapp ?? ""}
          placeholder="Contoh: 08123456789"
          maxLength={20}
          className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <FieldHint>Opsional dan tampil publik di halaman produk. Nomor telepon akun tetap tersimpan terpisah untuk kebutuhan login.</FieldHint>
      </div>

      <div className="grid gap-1.5">
        <FieldLabel htmlFor="bio">Bio lapak</FieldLabel>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultValues.bio ?? ""}
          placeholder="Ceritakan sedikit tentang barang yang kamu jual atau donasikan…"
          maxLength={280}
          rows={4}
          className="resize-none rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 py-2.5 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <FieldHint>Maks. 280 karakter. Tampil di halaman profil lapakmu.</FieldHint>
      </div>

      <div className="flex justify-end border-t border-[var(--seller-rule)] pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--seller-accent)] px-5 text-[13px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
