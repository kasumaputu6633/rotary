"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import AuthButton from "../../../_components/AuthButton";
import {
  resendPasswordResetOtpAction,
  verifyPasswordResetOtpAction,
} from "../../../actions";
import { useOtpInput } from "../../../_hooks/useOtpInput";

const RESEND_COOLDOWN_SECONDS = 60;

export default function PasswordResetOtpForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const { otp, inputs, handleChange, handleKeyDown, handlePaste, isComplete, code, reset } =
    useOtpInput();

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function handleVerify() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await verifyPasswordResetOtpAction(code);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    });
  }

  function handleResend() {
    if (resendSeconds > 0) return;
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await resendPasswordResetOtpAction();
      if (result?.error) {
        setError(result.error);
        return;
      }
      reset();
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setMessage(result?.message ?? "Kode baru telah dikirim.");
    });
  }

  return (
    <>
      <div className="mt-4 flex justify-center gap-2 lg:gap-3 w-full">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { inputs.current[index] = element; }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            aria-label={`Digit kode ${index + 1}`}
            className={`h-10 w-10 lg:h-12 lg:w-12 rounded-[9px] border text-center font-open-sauce text-[18px] lg:text-[20px] font-semibold outline-none transition-colors hover:border-[#17458f] hover:bg-white focus:border-[#17458f] focus:bg-white ${
              digit
                ? "border-[#17458f] bg-white"
                : "border-[#979797] bg-[rgba(130,130,130,0.27)]"
            }`}
          />
        ))}
      </div>

      {error ? <p className="mt-2 font-open-sauce text-[12px] text-red-500">{error}</p> : null}
      {message ? <p className="mt-2 font-open-sauce text-[12px] text-green-600">{message}</p> : null}

      <p className="mt-3 font-open-sauce text-[13px] text-[#505050]">
        Tidak menerima kode?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendSeconds > 0 || isPending}
          className="cursor-pointer text-[#17458f] underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {resendSeconds > 0 ? `Kirim ulang (${resendSeconds}s)` : "Kirim ulang"}
        </button>
      </p>

      <div className="mt-4 w-full">
        <AuthButton onClick={handleVerify} disabled={!isComplete} pending={isPending}>
          Verifikasi Kode
        </AuthButton>
      </div>

      <p className="mt-5 font-open-sauce text-[13px] text-[#505050]">
        <Link href="/forgot-password" className="text-[#17458f] underline">
          ← Gunakan kontak lain
        </Link>
      </p>
    </>
  );
}
