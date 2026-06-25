"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { requestEmailOtpAction, verifyEmailOtpAction } from "../actions";

type Step = "input-email" | "input-otp";

const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerificationModal({
  defaultEmail,
  onClose,
  onVerified,
}: {
  defaultEmail: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [step, setStep] = useState<Step>("input-email");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendSeconds, setResendSeconds] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => emailInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPending, onClose]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < otp.length - 1) otpInputs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = Array(6).fill("");
    digits.split("").forEach((digit, index) => { next[index] = digit; });
    setOtp(next);
    otpInputs.current[Math.min(digits.length, 5)]?.focus();
  }

  function sendCode() {
    setError("");
    startTransition(async () => {
      const result = await requestEmailOtpAction(email);
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast.success(result?.message ?? "Kode verifikasi sudah dikirim.");
      setStep("input-otp");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      window.setTimeout(() => otpInputs.current[0]?.focus(), 50);
    });
  }

  function resendCode() {
    if (resendSeconds > 0) return;
    setOtp(Array(6).fill(""));
    sendCode();
  }

  function verifyCode() {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Lengkapi kode verifikasi 6 digit.");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await verifyEmailOtpAction(email, code);
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast.success(result?.message ?? "Email berhasil diverifikasi.");
      onVerified();
      onClose();
    });
  }

  const normalizedEmail = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const otpComplete = otp.every(Boolean);

  return (
    <div
      className="modal-backdrop-enter fixed inset-0 z-[10050] flex items-end justify-center bg-[var(--color-overlay)] p-3 font-poppins sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-verification-title"
        className="modal-panel-enter w-full max-w-[440px] overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_48px_rgb(15_23_42_/_0.22)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Icon
              icon={step === "input-email" ? "lucide:mail" : "lucide:shield-check"}
              width={20}
              height={20}
              className="shrink-0 text-[var(--color-brand)]"
              aria-hidden="true"
            />
            <h2 id="email-verification-title" className="text-[15px] font-semibold text-[var(--color-text)]">
              {step === "input-email" ? "Verifikasi Email" : "Masukkan Kode Verifikasi"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:opacity-40"
          >
            <Icon icon="lucide:x" width={16} height={16} aria-hidden="true" />
          </button>
        </header>

        <div className="px-5 py-5">
          {step === "input-email" ? (
            <div className="grid gap-4">
              <p className="text-[12px] leading-relaxed text-[var(--color-muted)]">
                Kami akan mengirim kode 6 digit untuk memastikan email ini benar-benar milikmu.
              </p>
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-[var(--color-text)]">Alamat email</span>
                <input
                  ref={emailInputRef}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="nama@email.com"
                  className="h-11 rounded-[8px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[13px] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-focus)]"
                />
              </label>

              {error ? <p className="text-[12px] text-[var(--color-danger)]">{error}</p> : null}

              <button
                type="button"
                onClick={sendCode}
                disabled={!emailValid || isPending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-[var(--color-brand)] shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  icon={isPending ? "lucide:loader-circle" : "lucide:send"}
                  width={16}
                  height={16}
                  className={isPending ? "animate-spin" : ""}
                  aria-hidden="true"
                />
                {isPending ? "Mengirim..." : "Kirim Kode Verifikasi"}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <p className="text-[12px] leading-relaxed text-[var(--color-muted)]">
                Kode verifikasi telah dikirim ke{" "}
                <strong className="font-semibold text-[var(--color-text)]">{normalizedEmail}</strong>.
              </p>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => { otpInputs.current[index] = element; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    aria-label={`Digit kode ${index + 1}`}
                    className={`h-12 w-12 rounded-[8px] border text-center text-[18px] font-semibold outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-focus)] ${
                      digit
                        ? "border-[var(--color-brand)] bg-[var(--color-surface)]"
                        : "border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]"
                    }`}
                  />
                ))}
              </div>

              {error ? <p className="text-center text-[12px] text-[var(--color-danger)]">{error}</p> : null}

              <div className="flex items-center justify-center gap-1 text-[12px] text-[var(--color-muted)]">
                <span>Tidak menerima kode?</span>
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendSeconds > 0 || isPending}
                  className="font-semibold text-[var(--color-brand)] underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                >
                  {resendSeconds > 0 ? `Kirim ulang (${resendSeconds}s)` : "Kirim ulang"}
                </button>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("input-email");
                    setOtp(Array(6).fill(""));
                    setError("");
                  }}
                  disabled={isPending}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[8px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[12px] font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                >
                  <Icon icon="lucide:chevron-left" width={14} height={14} aria-hidden="true" />
                  Ubah Email
                </button>
                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={!otpComplete || isPending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-[var(--color-brand)] shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon
                    icon={isPending ? "lucide:loader-circle" : "lucide:shield-check"}
                    width={16}
                    height={16}
                    className={isPending ? "animate-spin" : ""}
                    aria-hidden="true"
                  />
                  {isPending ? "Memverifikasi..." : "Verifikasi Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
