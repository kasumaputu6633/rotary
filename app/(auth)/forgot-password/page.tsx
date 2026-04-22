"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuthIllustration from "../_components/AuthIllustration";
import AuthCard from "../_components/AuthCard";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import { forgotPasswordAction } from "../actions";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const isValid = contact.trim() !== "";

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await forgotPasswordAction(contact.trim());
      if (result?.error) setError(result.error);
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
            Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset kata sandi Anda.
          </p>

          <AuthInput
            id="contact"
            label="Email"
            type="text"
            placeholder="Alamat email Anda"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            error={error || undefined}
          />

          <Link href="/help" className="font-poppins text-[14px] text-[#17458f] underline">
            Perlu Bantuan?
          </Link>
        </div>

        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
          Kirim Link Reset
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
