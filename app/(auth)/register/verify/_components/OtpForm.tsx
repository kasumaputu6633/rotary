"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "../../../_components/AuthButton";
import { resendRegisterOtpAction, verifyRegisterOtpAction } from "../../../actions";
import { useOtpInput } from "../../../_hooks/useOtpInput";

export default function OtpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
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
    startTransition(async () => {
      const result = await verifyRegisterOtpAction(code);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  function handleResend() {
    if (resendSeconds > 0) return;
    setResent(false);
    setError("");
    startTransition(async () => {
      const result = await resendRegisterOtpAction();
      if (result?.error) { setError(result.error); return; }
      reset();
      setResent(true);
      setResendSeconds(60);
    });
  }

  return (
    <>
      <div className="flex gap-3 mt-4">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-12 h-12 text-center text-[20px] font-open-sauce font-semibold border rounded-[9px] outline-none hover:bg-white hover:border-[#17458f] focus:bg-white focus:border-[#17458f] transition-colors ${
              digit ? "bg-white border-[#17458f]" : "bg-[rgba(130,130,130,0.27)] border-[#979797]"
            }`}
          />
        ))}
      </div>

      {error && <p className="font-open-sauce text-[12px] text-red-500 mt-2">{error}</p>}
      {resent && <p className="font-open-sauce text-[12px] text-green-600 mt-2">Kode baru telah dikirim.</p>}

      <p className="font-open-sauce text-[13px] text-[#505050] mt-3">
        Tidak menerima kode?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending || resendSeconds > 0}
          className="text-[#17458f] underline cursor-pointer disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {resendSeconds > 0 ? `Kirim ulang (${resendSeconds}s)` : "Kirim ulang"}
        </button>
      </p>

      <div className="w-full mt-4">
        <AuthButton onClick={handleVerify} disabled={!isComplete} pending={isPending}>
          Verifikasi
        </AuthButton>
      </div>

      <p className="font-open-sauce text-[13px] text-[#505050] mt-5">
        <Link href="/register" className="text-[#17458f] underline">← Kembali</Link>
      </p>
    </>
  );
}
