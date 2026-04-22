"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuthIllustration from "../_components/AuthIllustration";
import AuthCard from "../_components/AuthCard";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const isValid = contact.trim() !== "" && password.trim() !== "" && agreed;

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await loginAction(contact.trim(), password);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex gap-[60px] items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/illustration-register.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Masuk
        </h1>

        <div className="flex flex-col gap-[10px] items-start pt-[45px] pb-[42px] w-full">
          <AuthInput
            id="contact"
            label="No.Telp atau Email"
            type="text"
            placeholder="No. Telepon atau Email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <AuthInput
            id="password"
            label="Kata Sandi"
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || undefined}
          />

          <Link
            href="/forgot-password"
            className="font-poppins text-[14px] text-[#17458f] underline self-end"
          >
            Lupa Kata Sandi?
          </Link>

          <label className="flex items-start gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.75 shrink-0 accent-[#17458f] w-4 h-4 cursor-pointer"
            />
            <span className="font-poppins text-[14px] text-black leading-relaxed">
              Dengan masuk, anda menyetujui{" "}
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

        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
          Masuk
        </AuthButton>

        <p className="font-poppins text-[13px] text-[#505050] mt-5">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#17458f] underline font-semibold">Daftar</Link>
        </p>
      </AuthCard>
    </div>
  );
}
