import Link from "next/link";
import { Icon } from "@iconify/react";
import AuthCard from "../../_components/AuthCard";
import AuthIllustration from "../../_components/AuthIllustration";

export default function ForgotPasswordSentPage() {
  return (
    <div className="flex gap-15 items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/linksend.png" />

      <AuthCard>
        <div className="flex flex-col items-center text-center w-full gap-3 py-6">
          <div className="w-14 h-14 rounded-full bg-[#fff8ec] flex items-center justify-center mb-1">
            <Icon icon="lucide:mail-check" width={28} height={28} className="text-[#f7a81b]" aria-hidden="true" />
          </div>

          <h1 className="font-open-sauce font-semibold text-[24px] text-black">
            Cek Email Anda
          </h1>

          <p className="font-open-sauce text-[14px] text-[#555] leading-relaxed">
            Jika email terdaftar dan telah diverifikasi, kami akan mengirimkan link reset kata sandi. Silakan cek inbox dan folder spam.
          </p>

          <p className="font-open-sauce text-[12px] text-[#968e8e] leading-relaxed">
            Link berlaku selama <span className="font-semibold text-[#555]">30 menit</span>. Periksa juga folder spam.
          </p>

          <Link
            href="/login"
            className="mt-3 bg-[#ffb81d] border border-[#979797] flex items-center justify-center h-8 rounded-[9px] w-full px-2.5 hover:brightness-95 transition-all"
          >
            <span className="font-open-sauce text-[14px] text-black">Kembali ke Login</span>
          </Link>

          <p className="font-open-sauce text-[13px] text-[#505050]">
            Tidak menerima email?{" "}
            <Link href="/forgot-password" className="text-[#17458f] underline font-semibold">
              Coba lagi
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}
