import { cookies } from "next/headers";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";
import AuthIllustration from "../../_components/AuthIllustration";
import AuthCard from "../../_components/AuthCard";
import LoginOtpForm from "./_components/LoginOtpForm";
import { maskContact } from "@/lib/phone";

export default async function LoginVerifyPage() {
  const cookieStore = await cookies();
  const contact = cookieStore.get("pending_contact")?.value;
  const userId = cookieStore.get("pending_login_user_id")?.value;
  const reason = cookieStore.get("pending_login_reason")?.value;

  if (!contact || !userId) redirect("/login");
  const isTwoFactor = reason === "two_factor";

  return (
    <div className="flex flex-col md:flex-row gap-12 lg:gap-[60px] items-center justify-center w-full max-w-5xl py-6 lg:py-10">
      <AuthIllustration src="/auth/otp.png" />

      <AuthCard>
        <h1 className="font-open-sauce font-semibold text-[24px] text-black">
          {isTwoFactor ? "Verifikasi Dua Langkah" : "Verifikasi Perangkat"}
        </h1>

        <div className="flex flex-col gap-[10px] items-center pt-4 pb-6 lg:pt-[45px] lg:pb-[42px] w-full">
          <div className="w-12 h-12 rounded-full bg-[#fff8ec] flex items-center justify-center mb-2">
            <Icon icon="lucide:shield-check" width={24} height={24} className="text-[#f7a81b]" aria-hidden="true" />
          </div>

          <p className="font-open-sauce text-[14px] text-black text-center">
            {isTwoFactor
              ? `Masukkan kode keamanan yang telah dikirim melalui ${contact.includes("@") ? "email" : "WhatsApp"} ke`
              : `Kami mendeteksi masuk dari perangkat baru. Kode dikirim melalui ${contact.includes("@") ? "email" : "WhatsApp"} ke`}
          </p>
          <p className="font-open-sauce font-semibold text-[14px] text-[#17458f]">
            {maskContact(contact)}
          </p>

          <LoginOtpForm allowRecoveryCode={isTwoFactor} />
        </div>
      </AuthCard>
    </div>
  );
}
