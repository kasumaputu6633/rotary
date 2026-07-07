"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAccountProfileAction } from "../../actions";
import { AvatarCropModal } from "./AvatarCropModal";

type CropSource = {
  file: File;
  url: string;
};

export function AccountProfileForm({
  defaultAvatarUrl,
  defaultFullName,
}: {
  defaultAvatarUrl: string | null;
  defaultFullName: string;
}) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(defaultAvatarUrl);
  const [croppedAvatarFile, setCroppedAvatarFile] = useState<File | null>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  const [fullName, setFullName] = useState(defaultFullName);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarChanged = removeAvatar || Boolean(croppedAvatarFile);
  const hasChanges = avatarChanged || fullName !== defaultFullName;

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (cropSource) {
        URL.revokeObjectURL(cropSource.url);
      }
    };
  }, [cropSource]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Format foto harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Mohon unggah foto yang berukuran kurang dari 2 MB.");
      event.target.value = "";
      return;
    }

    setCropSource({ file, url: URL.createObjectURL(file) });
    event.target.value = "";
  }

  function handleCancelCrop() {
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setCropSource(null);
  }

  function handleConfirmCrop(file: File) {
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setCroppedAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setCropSource(null);
    setAvatarError(null);
  }

  function handleRemoveAvatar() {
    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setCroppedAvatarFile(null);
    setCropSource(null);
    setAvatarPreviewUrl(null);
    setRemoveAvatar(Boolean(defaultAvatarUrl));
    setAvatarError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.delete("avatar");
    if (croppedAvatarFile) {
      formData.set("avatar", croppedAvatarFile);
    }
    startTransition(async () => {
      try {
        await updateAccountProfileAction(formData);
        setRemoveAvatar(false);
        setCroppedAvatarFile(null);
        toast.success("Profil akun berhasil disimpan.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan profil akun.");
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid gap-5 p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
            <label className="grid gap-1.5">
              <span className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-semibold text-[var(--seller-ink)]">Nama lengkap</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--seller-muted)]">
                  <Icon icon="lucide:lock-keyhole" width={12} height={12} aria-hidden="true" />
                  Privat
                </span>
              </span>
              <input
                name="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                minLength={2}
                maxLength={120}
                required
                autoComplete="name"
                placeholder="Nama lengkap sesuai identitas"
                className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-white px-3 text-[13px] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
              />
              <span className="text-[11px] leading-relaxed text-[var(--seller-muted)]">
                Dipakai sebagai identitas akun dan tidak ditampilkan sebagai nama lapak.
              </span>
            </label>

            <div className="grid justify-items-center gap-3 border-t border-[var(--seller-rule)] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              {avatarError && (
                <p className="max-w-[180px] text-center text-[11px] font-semibold leading-normal text-[var(--seller-danger)]">
                  {avatarError}
                </p>
              )}
              <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--seller-rule-strong)] bg-[var(--seller-brand)] text-[24px] font-semibold text-white">
                {avatarPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreviewUrl} alt="Preview foto akun" className="h-full w-full object-cover" />
                ) : (
                  <Icon icon="lucide:user-round" width={34} height={34} aria-hidden="true" />
                )}
              </span>
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
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[7px] border border-[var(--seller-rule-strong)] bg-white px-3 text-[11px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
                >
                  <Icon icon="lucide:image-up" width={13} height={13} aria-hidden="true" />
                  {avatarPreviewUrl ? "Ganti foto" : "Pilih foto"}
                </button>
                {avatarPreviewUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-[7px] px-2.5 text-[11px] font-semibold text-[var(--seller-danger)] transition-colors hover:bg-[var(--seller-danger-soft)]"
                  >
                    <Icon icon="lucide:trash-2" width={13} height={13} aria-hidden="true" />
                    Hapus
                  </button>
                ) : null}
              </div>
              <p className="text-center text-[10px] leading-relaxed text-[var(--seller-muted)]">
                JPG, PNG, atau WEBP. Maksimal 2MB. Foto ini juga tampil sebagai foto pemilik listing.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--seller-rule)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              <Icon icon="lucide:info" width={14} height={14} className="mt-0.5 shrink-0 text-[var(--seller-brand)]" aria-hidden="true" />
              Nama lapak tetap diatur melalui Seller Center.
            </p>
            <button
              type="submit"
              disabled={!hasChanges || isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-5 text-[12px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                icon={isPending ? "lucide:loader-circle" : "lucide:save"}
                width={15}
                height={15}
                className={isPending ? "animate-spin" : ""}
                aria-hidden="true"
              />
              {isPending ? "Menyimpan..." : hasChanges ? "Simpan perubahan" : "Sudah tersimpan"}
            </button>
          </div>
        </div>
      </form>

      {cropSource ? (
        <AvatarCropModal
          source={cropSource}
          onCancel={handleCancelCrop}
          onConfirm={handleConfirmCrop}
        />
      ) : null}
    </>
  );
}
