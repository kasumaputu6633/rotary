"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuthIllustration from "../../_components/AuthIllustration";
import AuthCard from "../../_components/AuthCard";
import AuthInput from "../../_components/AuthInput";
import AuthButton from "../../_components/AuthButton";
import { updateProfileAction } from "../../actions";

export default function RegisterProfilePage() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordMismatch = confirmPassword !== "" && password !== confirmPassword;
  const isValid = name.trim() !== "" && password.length >= 8 && password === confirmPassword;

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await updateProfileAction(name.trim(), password);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex gap-[60px] items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/form.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Lengkapi Profil
        </h1>

        <div className="flex flex-col gap-[10px] items-start pt-[45px] pb-[42px] w-full">
          <AuthInput
            id="name"
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <AuthInput
            id="password"
            label="Kata Sandi"
            type="password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AuthInput
            id="confirmPassword"
            label="Konfirmasi Kata Sandi"
            type="password"
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordMismatch ? "Kata sandi tidak cocok" : error || undefined}
          />
        </div>

        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
          Daftar Sekarang
        </AuthButton>

        <p className="font-poppins text-[13px] text-[#505050] mt-5">
          <Link href="/register/verify" className="text-[#17458f] underline">
            ← Kembali
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
