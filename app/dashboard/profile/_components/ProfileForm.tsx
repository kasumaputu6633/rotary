"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "../../actions";
import { EmailVerificationCard } from "./EmailVerificationCard";
import { PhoneVerificationCard } from "./PhoneVerificationCard";

type DefaultValues = {
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  fullName?: string | null;
  shopName?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
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
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(defaultValues.avatarUrl ?? null);
  const [bio, setBio] = useState(defaultValues.bio ?? "");
  const [shopName, setShopName] = useState(defaultValues.shopName ?? defaultValues.fullName ?? "");
  const [fullName, setFullName] = useState(defaultValues.fullName ?? "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarChanged = removeAvatar || Boolean(avatarPreviewUrl?.startsWith("blob:"));
  const hasChanges =
    avatarChanged
    || fullName !== (defaultValues.fullName ?? "")
    || shopName !== (defaultValues.shopName ?? defaultValues.fullName ?? "")
    || bio !== (defaultValues.bio ?? "");

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB.");
      event.target.value = "";
      return;
    }

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
        setRemoveAvatar(false);
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
          <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Identitas pemilik</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Nama dan foto membantu calon peminat mengenali siapa yang memasang barang.
          </p>
        </div>

        <div className="grid gap-4 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-4 sm:grid-cols-[80px_minmax(0,1fr)] sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--seller-rule)] bg-[var(--seller-brand)] text-[20px] font-semibold text-white">
            {avatarPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreviewUrl} alt="Preview foto profil" className="h-full w-full object-cover" />
            ) : (
              <Icon icon="lucide:user-round" width={28} height={28} aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-[var(--seller-ink)]">Foto profil</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--seller-success)]">
                <Icon icon="lucide:eye" width={12} height={12} aria-hidden="true" />
                Tampil publik
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              JPG, PNG, atau WEBP dengan ukuran maksimal 5MB.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                ref={avatarInputRef}
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                aria-hidden="true"
                tabIndex={-1}
                className="sr-only"
              />
              <input type="hidden" name="removeAvatar" value={removeAvatar ? "1" : "0"} />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
              >
                <Icon icon="lucide:image-up" width={14} height={14} aria-hidden="true" />
                {avatarPreviewUrl ? "Ganti foto" : "Pilih foto"}
              </button>
              {avatarPreviewUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--seller-danger)] px-3 text-[12px] font-semibold text-[var(--seller-danger)] transition-colors hover:bg-[var(--seller-danger-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
                >
                  <Icon icon="lucide:trash-2" width={14} height={14} aria-hidden="true" />
                  Hapus
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <FieldHeader visibility="private">Nama lengkap</FieldHeader>
            <input
              name="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nama lengkap sesuai identitas"
              minLength={2}
              maxLength={120}
              required
              autoComplete="name"
              className={fieldClass}
            />
            <span className="text-[11px] text-[var(--seller-muted)]">Disimpan sebagai identitas akun dan tidak tampil di marketplace.</span>
          </label>

          <label className="grid gap-1.5">
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

      <EmailVerificationCard
        email={defaultValues.email ?? null}
        verified={defaultValues.emailVerified ?? false}
      />

      <PhoneVerificationCard
        phone={defaultValues.phone ?? null}
        verified={defaultValues.phoneVerified ?? false}
      />

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
            <Icon icon="lucide:shield-check" width={14} height={14} className="mt-0.5 shrink-0 text-[var(--seller-brand)]" aria-hidden="true" />
            Email dan telepon akun tidak ikut ditampilkan.
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
