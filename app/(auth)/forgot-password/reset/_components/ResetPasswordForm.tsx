"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuthInput from "../../../_components/AuthInput";
import AuthButton from "../../../_components/AuthButton";
import PasswordRequirements, { passwordValid } from "../../../_components/PasswordRequirements";
import { resetPasswordAction } from "../../../actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordMismatch = confirmPassword !== "" && password !== confirmPassword;
  const isValid = passwordValid(password) && password === confirmPassword;

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2.5 items-start pt-11.25 pb-10.5 w-full">
      <p className="font-poppins text-[14px] text-black leading-relaxed">
        Kata sandi baru harus berbeda dari kata sandi sebelumnya.
      </p>

      <AuthInput
        id="password"
        label="Kata Sandi Baru"
        type="password"
        placeholder="Buat kata sandi baru"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <PasswordRequirements password={password} />

      <AuthInput
        id="confirmPassword"
        label="Konfirmasi Kata Sandi"
        type="password"
        placeholder="Ulangi kata sandi baru"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={passwordMismatch ? "Kata sandi tidak cocok" : error || undefined}
      />

      <div className="w-full mt-2">
        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
          Simpan Kata Sandi
        </AuthButton>
      </div>

      <p className="font-poppins text-[13px] text-[#505050]">
        <Link href="/login" className="text-[#17458f] underline">
          ← Kembali ke Login
        </Link>
      </p>
    </div>
  );
}
