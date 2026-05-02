"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthIllustration from "../_components/AuthIllustration";
import AuthCard from "../_components/AuthCard";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import { registerAction } from "../actions";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [contact, setContact] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const isValid = contact.trim() !== "" && agreed;

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await registerAction(contact.trim());
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

        <div className="flex flex-col gap-[10px] items-start pt-[45px] pb-[42px] w-full">
          <AuthInput
            id="contact"
            label="Masukkan No.Telp atau Email"
            type="text"
            placeholder="No. Telepon atau Email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            error={error}
          />

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

        <AuthButton onClick={handleSubmit} disabled={!isValid} pending={isPending}>
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
