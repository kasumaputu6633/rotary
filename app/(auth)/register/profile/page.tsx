"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuthIllustration from "../../_components/AuthIllustration";
import AuthCard from "../../_components/AuthCard";
import AuthInput from "../../_components/AuthInput";
import AuthButton from "../../_components/AuthButton";
import PasswordRequirements, { passwordValid } from "../../_components/PasswordRequirements";
import { updateProfileAction } from "../../actions";

export default function RegisterProfilePage() {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordMismatch = confirmPassword !== "" && password !== confirmPassword;
  const isValid =
    fullName.trim().length >= 2
    && shopName.trim().length >= 2
    && passwordValid(password)
    && password === confirmPassword;

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await updateProfileAction(fullName.trim(), shopName.trim(), password);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    });
  }

  return (
    <div className="flex gap-15 items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/form.png" />

      <AuthCard>
        <h1 className="font-open-sauce font-semibold text-[24px] text-black">
          Lengkapi Profil
        </h1>

        <div className="flex flex-col gap-2.5 items-start pt-11.25 pb-10.5 w-full">
          <AuthInput
            id="fullName"
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <AuthInput
            id="shopName"
            label="Nama Lapak"
            type="text"
            placeholder="Nama lapak di marketplace"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />

          <AuthInput
            id="password"
            label="Kata Sandi"
            type="password"
            placeholder="Buat kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordRequirements password={password} />

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

        <p className="font-open-sauce text-[13px] text-[#505050] mt-5">
          <Link href="/register/verify" className="text-[#17458f] underline">
            ← Kembali
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
