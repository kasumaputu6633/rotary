"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuthIllustration from "../_components/AuthIllustration";
import AuthCard from "../_components/AuthCard";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import AuthMethodTabs, { type AuthMethod } from "../_components/AuthMethodTabs";
import AuthPhoneInput, {
  getFullPhoneNumber,
  validateIndonesianPhone,
} from "../_components/AuthPhoneInput";
import { forgotPasswordAction } from "../actions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const isValid = method === "email"
    ? EMAIL_REGEX.test(email.trim())
    : validateIndonesianPhone(phone);

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const contact = method === "email" ? email.trim() : getFullPhoneNumber(phone);
      const result = await forgotPasswordAction(contact);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    });
  }

  return (
    <div className="flex gap-15 items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/forgotpass.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Lupa Kata Sandi
        </h1>

        <div className="flex flex-col gap-2.5 items-start pt-11.25 pb-10.5 w-full">
          <p className="font-poppins text-[14px] text-black leading-relaxed">
            Pilih kontak akun untuk menerima panduan reset kata sandi.
          </p>

          <AuthMethodTabs
            value={method}
            onChange={(next) => {
              setMethod(next);
              setError("");
            }}
          />

          {method === "email" ? (
            <AuthInput
              id="email"
              label="Email"
              type="email"
              placeholder="Alamat email Anda"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={error || undefined}
            />
          ) : (
            <AuthPhoneInput
              id="phone"
              label="Nomor HP WhatsApp"
              value={phone}
              onChange={setPhone}
              error={error || undefined}
            />
          )}

          <p className="font-poppins text-[12px] text-[#6b7280] leading-relaxed">
            {method === "email"
              ? "Link reset akan dikirim ke email terverifikasi."
              : "Kode OTP 6 digit akan dikirim ke WhatsApp terverifikasi."}
          </p>

          <Link href="/help" className="font-poppins text-[14px] text-[#17458f] underline">
            Perlu Bantuan?
          </Link>
        </div>

        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
          {method === "email" ? "Kirim Link Reset" : "Kirim Kode WhatsApp"}
        </AuthButton>

        <p className="font-poppins text-[13px] text-[#505050] mt-5">
          <Link href="/login" className="text-[#17458f] underline">
            ← Kembali ke Masuk
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
