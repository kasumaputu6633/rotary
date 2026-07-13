"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import AuthButton from "../../../_components/AuthButton";
import {
  resendLoginOtpAction,
  verifyLoginOtpAction,
  verifyLoginRecoveryCodeAction,
} from "../../../actions";
import { useOtpInput } from "../../../_hooks/useOtpInput";

export default function LoginOtpForm({ allowRecoveryCode }: { allowRecoveryCode: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
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
      const result = useRecoveryCode
        ? await verifyLoginRecoveryCodeAction(recoveryCode)
        : await verifyLoginOtpAction(code);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    });
  }

  function handleResend() {
    if (resendSeconds > 0) return;
    setResent(false);
    setError("");
    startTransition(async () => {
      const result = await resendLoginOtpAction();
      if (result?.error) { setError(result.error); return; }
      reset();
      setResent(true);
      setResendSeconds(60);
    });
  }

  return (
    <>
      {useRecoveryCode ? (
        <label className="mt-4 grid w-full gap-1.5">
          <span className="font-open-sauce text-[12px] font-semibold text-black">Recovery code</span>
          <input
            type="text"
            value={recoveryCode}
            maxLength={9}
            autoComplete="one-time-code"
            onChange={(event) => {
              setRecoveryCode(event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""));
              setError("");
            }}
            placeholder="XXXX-XXXX"
            className="h-12 w-full rounded-[9px] border border-[#979797] bg-white px-4 text-center font-mono text-[18px] font-semibold uppercase tracking-[0.12em] outline-none transition-colors focus:border-[#17458f]"
          />
        </label>
      ) : (
        <div className="flex justify-center gap-2 lg:gap-3 mt-4 w-full">
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
              className={`w-10 h-10 lg:w-12 lg:h-12 text-center text-[18px] lg:text-[20px] font-open-sauce font-semibold border rounded-[9px] outline-none hover:bg-white hover:border-[#17458f] focus:bg-white focus:border-[#17458f] transition-colors ${
                digit ? "bg-white border-[#17458f]" : "bg-[rgba(130,130,130,0.27)] border-[#979797]"
              }`}
            />
          ))}
        </div>
      )}

      {error && <p className="font-open-sauce text-[12px] text-red-500 mt-2">{error}</p>}
      {resent && <p className="font-open-sauce text-[12px] text-green-600 mt-2">Kode baru telah dikirim.</p>}

      {!useRecoveryCode ? (
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
      ) : null}

      <div className="w-full mt-4">
        <AuthButton
          onClick={handleVerify}
          disabled={useRecoveryCode ? recoveryCode.replace("-", "").length !== 8 : !isComplete}
          pending={isPending}
        >
          Verifikasi &amp; Masuk
        </AuthButton>
      </div>

      {allowRecoveryCode ? (
        <button
          type="button"
          onClick={() => {
            setUseRecoveryCode((current) => !current);
            setRecoveryCode("");
            setError("");
            setResent(false);
            reset();
          }}
          className="mt-4 font-open-sauce text-[13px] font-semibold text-[#17458f] underline"
        >
          {useRecoveryCode ? "Gunakan kode verifikasi" : "Gunakan recovery code"}
        </button>
      ) : null}

      <p className="font-open-sauce text-[13px] text-[#505050] mt-5">
        <Link href="/login" className="text-[#17458f] underline">← Kembali ke Login</Link>
      </p>
    </>
  );
}
