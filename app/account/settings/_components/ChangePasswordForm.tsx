"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import PasswordRequirements from "@/app/(auth)/_components/PasswordRequirements";
import { passwordValid } from "@/lib/password";
import { changeAccountPasswordAction } from "../actions";

function PasswordField({
  autoComplete,
  label,
  onChange,
  value,
}: {
  autoComplete: "current-password" | "new-password";
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-[var(--seller-ink)]">{label}</span>
      <span className="relative">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={128}
          className="min-h-11 w-full rounded-[8px] border border-[var(--seller-rule-strong)] bg-white px-3 pr-11 text-[13px] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--seller-muted)] transition-colors hover:text-[var(--seller-brand)]"
          aria-label={visible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
        >
          <Icon icon={visible ? "lucide:eye-off" : "lucide:eye"} width={16} height={16} aria-hidden="true" />
        </button>
      </span>
    </label>
  );
}

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    (!hasPassword || currentPassword.length > 0)
    && passwordValid(newPassword)
    && newPassword === confirmPassword;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await changeAccountPasswordAction(currentPassword, newPassword);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(result?.message ?? (hasPassword ? "Kata sandi berhasil diubah." : "Kata sandi berhasil dibuat."));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid max-w-2xl gap-4">
          {hasPassword ? (
            <PasswordField
              autoComplete="current-password"
              label="Kata sandi saat ini"
              value={currentPassword}
              onChange={(value) => {
                setCurrentPassword(value);
                setError("");
              }}
            />
          ) : (
            <p className="flex items-start gap-2 rounded-[8px] bg-[var(--seller-accent-soft)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--seller-brand)]">
              <Icon icon="lucide:info" width={14} height={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Akun ini belum memiliki kata sandi. Buat kata sandi untuk menambahkan metode login setelah email terverifikasi.
            </p>
          )}

          <div className="grid gap-2">
            <PasswordField
              autoComplete="new-password"
              label="Kata sandi baru"
              value={newPassword}
              onChange={(value) => {
                setNewPassword(value);
                setError("");
              }}
            />
            <PasswordRequirements password={newPassword} />
          </div>

          <div className="grid gap-1.5">
            <PasswordField
              autoComplete="new-password"
              label="Konfirmasi kata sandi baru"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setError("");
              }}
            />
            {passwordMismatch ? (
              <p className="text-[11px] font-medium text-[var(--seller-danger)]">Konfirmasi kata sandi tidak cocok.</p>
            ) : null}
          </div>

          {error ? (
            <p className="flex items-start gap-2 rounded-[8px] bg-[var(--seller-danger-soft)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--seller-danger)]">
              <Icon icon="lucide:circle-alert" width={14} height={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--seller-rule)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            {hasPassword ? (
              <Link href="/forgot-password" className="text-[11px] font-semibold text-[var(--seller-brand)] hover:underline">
                Lupa kata sandi saat ini?
              </Link>
            ) : <span />}
            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-5 text-[12px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                icon={isPending ? "lucide:loader-circle" : "lucide:key-round"}
                width={15}
                height={15}
                className={isPending ? "animate-spin" : ""}
                aria-hidden="true"
              />
              {isPending ? "Menyimpan..." : hasPassword ? "Ubah kata sandi" : "Buat kata sandi"}
            </button>
          </div>
        </div>

        <aside className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
            <Icon icon="lucide:shield-check" width={19} height={19} aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-[13px] font-semibold text-[var(--seller-ink)]">
            {hasPassword ? "Setelah kata sandi diubah" : "Setelah kata sandi dibuat"}
          </h3>
          <ul className="mt-3 grid gap-2.5 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            <li className="flex gap-2">
              <Icon icon="lucide:check" width={13} height={13} className="mt-0.5 shrink-0 text-[var(--seller-success)]" aria-hidden="true" />
              Sesi pada perangkat ini tetap aktif.
            </li>
            <li className="flex gap-2">
              <Icon icon="lucide:check" width={13} height={13} className="mt-0.5 shrink-0 text-[var(--seller-success)]" aria-hidden="true" />
              Sesi lain dan semua perangkat terpercaya akan direset.
            </li>
            <li className="flex gap-2">
              <Icon icon="lucide:check" width={13} height={13} className="mt-0.5 shrink-0 text-[var(--seller-success)]" aria-hidden="true" />
              Login berikutnya akan kembali meminta verifikasi OTP.
            </li>
          </ul>
        </aside>
      </div>
    </form>
  );
}
