"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { requestPhoneOtpAction, verifyPhoneOtpAction } from "../actions";

type Step = "input-phone" | "input-otp";

type PhoneVerificationModalProps = {
  onClose: () => void;
  onVerified: () => void;
};

const RESEND_COOLDOWN_SECONDS = 60;

export function PhoneVerificationModal({ onClose, onVerified }: PhoneVerificationModalProps) {
  const [step, setStep] = useState<Step>("input-phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendSeconds, setResendSeconds] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus pertama kali mount
  useEffect(() => {
    const t = window.setTimeout(() => phoneInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, []);

  // Lock body scroll + ESC handler
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isPending, onClose]);

  // Countdown timer resend
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function handlePhoneChange(value: string) {
    // Buang non-digit & leading zero
    const cleaned = value.replace(/\D/g, "").replace(/^0+/, "");
    setPhone(cleaned);
    setError("");
  }

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
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpInputs.current[Math.min(digits.length, 5)]?.focus();
  }

  function handleSendOtp() {
    setError("");
    startTransition(async () => {
      const result = await requestPhoneOtpAction(phone);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.message) toast.info(result.message);
      setStep("input-otp");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => otpInputs.current[0]?.focus(), 50);
    });
  }

  function handleResend() {
    if (resendSeconds > 0) return;
    setError("");
    startTransition(async () => {
      const result = await requestPhoneOtpAction(phone);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.message) toast.info(result.message);
      setOtp(Array(6).fill(""));
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      otpInputs.current[0]?.focus();
    });
  }

  function handleVerify() {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Lengkapi kode OTP 6 digit.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await verifyPhoneOtpAction(phone, code);
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast.success(result?.message ?? "Nomor HP berhasil diverifikasi.");
      onVerified();
      onClose();
    });
  }

  const isPhoneValid = phone.length >= 9 && phone.length <= 13;
  const isOtpComplete = otp.every((d) => d !== "");

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
        aria-labelledby="phone-verify-title"
        className="modal-panel-enter w-full max-w-[440px] overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_48px_rgb(15_23_42_/_0.22)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Icon
              icon={step === "input-phone" ? "lucide:smartphone" : "lucide:shield-check"}
              width={20}
              height={20}
              className="shrink-0 text-[var(--color-brand)]"
              aria-hidden="true"
            />
            <h2 id="phone-verify-title" className="text-[15px] font-semibold text-[var(--color-text)]">
              {step === "input-phone" ? "Verifikasi Nomor HP" : "Masukkan Kode OTP"}
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
          {step === "input-phone" ? (
            <div className="grid gap-4">
              <p className="text-[12px] leading-relaxed text-[var(--color-muted)]">
                Kami akan mengirim kode OTP ke nomor WhatsApp ini. Nomor disimpan privat untuk keamanan akun.
              </p>

              <div className="grid gap-1.5">
                <label htmlFor="phone-input" className="text-[12px] font-semibold text-[var(--color-text)]">
                  Nomor HP
                </label>
                <div className="flex gap-2">
                  <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-[8px] border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-3 text-[13px] font-medium text-[var(--color-text)]">
                    <span aria-hidden="true">🇮🇩</span>
                    +62
                  </div>
                  <input
                    ref={phoneInputRef}
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(event) => handlePhoneChange(event.target.value)}
                    placeholder="81234567890"
                    className="h-11 flex-1 rounded-[8px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[13px] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-focus)]"
                  />
                </div>
                <p className="text-[11px] text-[var(--color-muted)]">
                  Tanpa angka 0 di depan. Contoh: 81234567890
                </p>
              </div>

              {error ? <p className="text-[12px] text-[var(--color-danger)]">{error}</p> : null}

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!isPhoneValid || isPending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-[var(--color-brand)] shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <Icon icon="lucide:loader-circle" width={16} height={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Icon icon="lucide:send" width={16} height={16} aria-hidden="true" />
                )}
                {isPending ? "Mengirim..." : "Kirim Kode OTP"}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <p className="text-[12px] leading-relaxed text-[var(--color-muted)]">
                Kode OTP 6 digit telah dikirim ke{" "}
                <strong className="font-semibold text-[var(--color-text)]">+62{phone}</strong>.
              </p>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
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
                  onClick={handleResend}
                  disabled={resendSeconds > 0 || isPending}
                  className="font-semibold text-[var(--color-brand)] underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                >
                  {resendSeconds > 0 ? `Kirim ulang (${resendSeconds}s)` : "Kirim ulang"}
                </button>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-2">
                <button
                  type="button"
                  onClick={() => setStep("input-phone")}
                  disabled={isPending}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[8px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[12px] font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                >
                  <Icon icon="lucide:chevron-left" width={14} height={14} aria-hidden="true" />
                  Ubah Nomor
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!isOtpComplete || isPending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-[var(--color-brand)] shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <Icon icon="lucide:loader-circle" width={16} height={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon icon="lucide:shield-check" width={16} height={16} aria-hidden="true" />
                  )}
                  {isPending ? "Memverifikasi..." : "Verifikasi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
