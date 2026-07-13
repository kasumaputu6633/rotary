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
import { loginAction } from "../actions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPhoneValid = validateIndonesianPhone(phone);
  const isContactValid = method === "email" ? isEmailValid : isPhoneValid;
  const isFormValid = isContactValid && password.trim() !== "";

  function getSafeRedirect() {
    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    if (!redirectTo?.startsWith("/") || redirectTo.startsWith("//")) return null;
    if (redirectTo.startsWith("/admin")) return null;
    return redirectTo;
  }

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
      const result = await loginAction(contact, password, getSafeRedirect());
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-12 lg:gap-[60px] items-center justify-center w-full max-w-5xl py-6 lg:py-10">
      <AuthIllustration src="/auth/illustration-register.png" />

      <AuthCard>
        <h1 className="font-open-sauce font-semibold text-[24px] text-black">
          Masuk
        </h1>

        <div className="flex flex-col gap-[10px] items-start pt-4 pb-6 lg:pt-[25px] lg:pb-[42px] w-full">
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
                error={email && !isEmailValid ? "Format email tidak valid." : undefined}
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

          <AuthInput
            id="password"
            label="Kata Sandi"
            type="password"
            placeholder="Kata Sandi"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={method === "email" ? error || undefined : undefined}
          />

          <Link
            href="/forgot-password"
            className="font-open-sauce text-[14px] text-[#17458f] underline self-end"
          >
            Lupa Kata Sandi?
          </Link>

          <Link href="/help" className="font-open-sauce text-[14px] text-[#17458f] underline">
            Perlu Bantuan?
          </Link>
        </div>

        <AuthButton onClick={handleSubmit} disabled={!isFormValid} pending={isPending}>
          Masuk
        </AuthButton>

        <p className="font-open-sauce text-[13px] text-[#505050] mt-5">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#17458f] underline font-semibold">Daftar</Link>
        </p>
      </AuthCard>
    </div>
  );
}
