"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  confirmTwoFactorSetupAction,
  disableTwoFactorAction,
  regenerateRecoveryCodesAction,
  requestTwoFactorSetupAction,
} from "../security-actions";
import { RecoveryCodesPanel } from "./RecoveryCodesPanel";

function PasswordPrompt({
  buttonLabel,
  danger = false,
  description,
  onSubmit,
}: {
  buttonLabel: string;
  danger?: boolean;
  description: string;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => onSubmit(password));
      }}
    >
      <p className="text-[11px] leading-relaxed text-[var(--seller-muted)]">{description}</p>
      <label className="grid max-w-md gap-1.5">
        <span className="text-[11px] font-semibold text-[var(--seller-ink)]">Konfirmasi kata sandi</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          maxLength={128}
          className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-white px-3 text-[13px] outline-none focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
      </label>
      <button
        type="submit"
        disabled={!password || isPending}
        className={`inline-flex min-h-11 w-fit items-center gap-2 rounded-[8px] px-4 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
          danger ? "bg-[var(--seller-danger)]" : "bg-[var(--seller-brand)]"
        }`}
      >
        <Icon icon={isPending ? "lucide:loader-circle" : "lucide:shield-check"} width={15} height={15} className={isPending ? "animate-spin" : ""} aria-hidden="true" />
        {isPending ? "Memproses..." : buttonLabel}
      </button>
    </form>
  );
}

export function TwoFactorSettings({
  email,
  enabled,
  hasPassword,
  recoveryCodeCount,
}: {
  email: string | null;
  enabled: boolean;
  hasPassword: boolean;
  recoveryCodeCount: number;
}) {
  const router = useRouter();
  const [activationStarted, setActivationStarted] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isConfirming, startConfirmTransition] = useTransition();

  async function requestSetup(password: string) {
    const result = await requestTwoFactorSetupAction(password);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setActivationStarted(true);
    toast.success(result.message);
  }

  function confirmSetup() {
    startConfirmTransition(async () => {
      const result = await confirmTwoFactorSetupAction(activationCode);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRecoveryCodes(result.recoveryCodes ?? []);
      setActivationStarted(false);
      setActivationCode("");
      toast.success(result.message);
      router.refresh();
    });
  }

  async function disable(password: string) {
    const result = await disableTwoFactorAction(password);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  async function regenerate(password: string) {
    const result = await regenerateRecoveryCodesAction(password);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRecoveryCodes(result.recoveryCodes ?? []);
    toast.success(result.message);
    router.refresh();
  }

  return (
    <div className="grid gap-5 p-4 sm:p-5">
      <section className="grid gap-4 rounded-[10px] border border-[var(--seller-rule)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] ${
            enabled
              ? "bg-[var(--seller-success-soft)] text-[var(--seller-success)]"
              : "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]"
          }`}>
            <Icon icon={enabled ? "lucide:shield-check" : "lucide:shield-alert"} width={21} height={21} aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">Verifikasi dua langkah via email</h3>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                enabled
                  ? "bg-[var(--seller-success-soft)] text-[var(--seller-success)]"
                  : "bg-[var(--seller-surface-2)] text-[var(--seller-muted)]"
              }`}>
                {enabled ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Ketika aktif, kode keamanan akan diminta pada setiap login meskipun perangkat sudah dikenal.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-[var(--seller-ink)]">{email ?? "Email belum tersedia"}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--seller-surface-2)] px-2 py-1 text-[9px] font-semibold text-[var(--seller-muted)]">
          <Icon icon="lucide:message-circle-more" width={11} height={11} aria-hidden="true" />
          WhatsApp setelah WAHA aktif
        </span>
      </section>

      {recoveryCodes.length > 0 ? (
        <RecoveryCodesPanel codes={recoveryCodes} onClose={() => setRecoveryCodes([])} />
      ) : null}

      {!hasPassword ? (
        <div className="rounded-[8px] border border-[var(--seller-accent)] bg-[var(--seller-accent-soft)] p-4 text-[11px] leading-relaxed text-[var(--seller-brand)]">
          Buat kata sandi terlebih dahulu pada menu Kata Sandi sebelum mengaktifkan verifikasi dua langkah.
        </div>
      ) : enabled ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[8px] border border-[var(--seller-rule)] p-4">
            <h3 className="text-[13px] font-semibold text-[var(--seller-ink)]">Recovery code</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Tersisa <strong className="text-[var(--seller-ink)]">{recoveryCodeCount}</strong> kode yang belum digunakan.
            </p>
            <div className="mt-4">
              <PasswordPrompt
                buttonLabel="Buat kode baru"
                description="Membuat recovery code baru akan membuat seluruh kode lama tidak berlaku."
                onSubmit={regenerate}
              />
            </div>
          </div>
          <div className="rounded-[8px] border border-[var(--seller-danger)]/30 p-4">
            <h3 className="text-[13px] font-semibold text-[var(--seller-danger)]">Nonaktifkan perlindungan</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Sesi lain akan dikeluarkan dan recovery code akan dihapus.
            </p>
            <div className="mt-4">
              <PasswordPrompt
                buttonLabel="Nonaktifkan 2FA"
                danger
                description="Masukkan kata sandi untuk memastikan perubahan ini dilakukan olehmu."
                onSubmit={disable}
              />
            </div>
          </div>
        </div>
      ) : activationStarted ? (
        <div className="grid gap-3 rounded-[8px] border border-[var(--seller-accent)] bg-[var(--seller-accent-soft)] p-4">
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--seller-ink)]">Masukkan kode aktivasi</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Kode 6 digit telah dikirim ke email terverifikasi dan berlaku selama 5 menit.
            </p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={activationCode}
            onChange={(event) => setActivationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-12 max-w-xs rounded-[8px] border border-[var(--seller-rule-strong)] bg-white px-4 text-center text-[18px] font-semibold tracking-[0.3em] outline-none focus:border-[var(--seller-brand)]"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmSetup}
              disabled={activationCode.length !== 6 || isConfirming}
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              <Icon icon={isConfirming ? "lucide:loader-circle" : "lucide:shield-check"} width={15} height={15} className={isConfirming ? "animate-spin" : ""} aria-hidden="true" />
              {isConfirming ? "Mengaktifkan..." : "Aktifkan 2FA"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActivationStarted(false);
                setActivationCode("");
              }}
              className="min-h-11 px-3 text-[11px] font-semibold text-[var(--seller-muted)]"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <PasswordPrompt
          buttonLabel="Kirim kode aktivasi"
          description="Untuk keamanan, konfirmasi kata sandi terlebih dahulu. Kode aktivasi akan dikirim ke email terverifikasi."
          onSubmit={requestSetup}
        />
      )}
    </div>
  );
}

