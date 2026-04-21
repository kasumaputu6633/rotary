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
    <div className="flex gap-[60px] items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/forgotpass.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Lupa Kata Sandi
        </h1>

        <div className="flex flex-col gap-[10px] items-start pt-[45px] pb-[42px] w-full">
          <p className="font-poppins text-[14px] text-black leading-relaxed">
            Masukkan No.Telp atau Email yang terdaftar. Kami akan mengirimkan kode verifikasi untuk mereset kata sandi Anda.
          </p>

          <AuthInput
            id="contact"
            label="No.Telp atau Email"
            type="text"
            placeholder="No. Telepon atau Email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            error={error || undefined}
          />

          <Link href="/help" className="font-poppins text-[14px] text-[#17458f] underline">
            Perlu Bantuan?
          </Link>
        </div>

        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
          Kirim Kode
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
