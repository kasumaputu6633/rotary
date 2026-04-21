"use client";

import Link from "next/link";
import { useState, useRef, useTransition } from "react";
import AuthButton from "../../../_components/AuthButton";
import { resendRegisterOtpAction, verifyRegisterOtpAction } from "../../../actions";

export default function OtpForm({ type }: { type: "register" | "forgot_password" }) {
  const [isPending, startTransition] = useTransition();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = otp.every((d) => d !== "");
  const code = otp.join("");

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handleVerify() {
    setError("");
    startTransition(async () => {
      const action = type === "register" ? verifyRegisterOtpAction : verifyRegisterOtpAction;
      const result = await action(code);
      if (result?.error) setError(result.error);
    });
  }

  function handleResend() {
    setResent(false);
    startTransition(async () => {
      await resendRegisterOtpAction();
      setOtp(["", "", "", "", "", ""]);
      setResent(true);
      inputs.current[0]?.focus();
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
            className={`w-[48px] h-[48px] text-center text-[20px] font-poppins font-semibold border rounded-[9px] outline-none hover:bg-white hover:border-[#17458f] focus:bg-white focus:border-[#17458f] transition-colors ${
              digit ? "bg-white border-[#17458f]" : "bg-[rgba(130,130,130,0.27)] border-[#979797]"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="font-poppins text-[12px] text-red-500 mt-2">
          {error}
        </p>
      )}

      {resent && (
        <p className="font-poppins text-[12px] text-green-600 mt-2">
          Kode baru telah dikirim.
        </p>
      )}

      <p className="font-poppins text-[13px] text-[#505050] mt-3">
        Tidak menerima kode?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="text-[#17458f] underline cursor-pointer disabled:opacity-50"
        >
          Kirim ulang
        </button>
      </p>

      <div className="w-full mt-4">
        <AuthButton onClick={handleVerify} disabled={!isComplete} pending={isPending}>
          Verifikasi
        </AuthButton>
      </div>

      <p className="font-poppins text-[13px] text-[#505050] mt-5">
        <Link href="/register" className="text-[#17458f] underline">
          ← Kembali
        </Link>
      </p>
    </>
  );
}
