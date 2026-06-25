"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthIllustration from "../_components/AuthIllustration";
import AuthCard from "../_components/AuthCard";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import AuthMethodTabs, { type AuthMethod } from "../_components/AuthMethodTabs";
import AuthPhoneInput, {
  getFullPhoneNumber,
  validateIndonesianPhone,
} from "../_components/AuthPhoneInput";
import { registerAction } from "../actions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPhoneValid = validateIndonesianPhone(phone);
  const isContactValid = method === "email" ? isEmailValid : isPhoneValid;
  const isFormValid = isContactValid && agreed;

  function handleMethodChange(next: AuthMethod) {
    setMethod(next);
    setError("");
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const contact = method === "email"
        ? email.trim()
        : getFullPhoneNumber(phone);
      const result = await registerAction(contact);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <div className="flex gap-[60px] items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/illustration-register.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Daftar
        </h1>

        <div className="flex flex-col gap-[10px] items-start pt-[25px] pb-[42px] w-full">
          <AuthMethodTabs value={method} onChange={handleMethodChange} />

          {method === "email" ? (
            <AuthInput
              id="email"
              label="Email"
              type="email"
              placeholder="email@contoh.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={
                email && !isEmailValid
                  ? "Format email tidak valid."
                  : error || undefined
              }
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

          <label className="flex items-start gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-[3px] shrink-0 accent-[#17458f] w-4 h-4 cursor-pointer"
            />
            <span className="font-poppins text-[14px] text-black leading-relaxed">
              Dengan melanjutkan, anda menyetujui{" "}
              <Link href="/terms" className="text-[#17458f] underline">Ketentuan Penggunaan</Link>
              {" "}dan{" "}
              <Link href="/privacy" className="text-[#17458f] underline">Pemberitahuan Privasi</Link>
              {" "}Kami.
            </span>
          </label>

          <Link href="/help" className="font-poppins text-[14px] text-[#17458f] underline">
            Perlu Bantuan?
          </Link>
        </div>

        <AuthButton onClick={handleSubmit} disabled={!isFormValid} pending={isPending}>
          Lanjut
        </AuthButton>

        <p className="font-poppins text-[13px] text-[#505050] mt-5">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#17458f] underline font-semibold">Masuk</Link>
        </p>
      </AuthCard>
    </div>
  );
}
