import { cookies } from "next/headers";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";
import AuthCard from "../../_components/AuthCard";
import AuthIllustration from "../../_components/AuthIllustration";
import { maskContact } from "@/lib/phone";
import PasswordResetOtpForm from "./_components/PasswordResetOtpForm";

export default async function ForgotPasswordVerifyPage() {
  const contact = (await cookies()).get("pending_password_reset_contact")?.value;
  if (!contact) redirect("/forgot-password");

  return (
    <div className="flex w-full max-w-5xl items-center justify-center gap-[60px] py-10">
      <AuthIllustration src="/auth/otp.png" />

      <AuthCard>
        <h1 className="font-roboto-serif text-[24px] font-semibold text-black">
          Verifikasi WhatsApp
        </h1>

        <div className="flex w-full flex-col items-center gap-[10px] pb-[42px] pt-[45px]">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff8ec]">
            <Icon
              icon="lucide:message-circle-check"
              width={24}
              height={24}
              className="text-[#f7a81b]"
              aria-hidden="true"
            />
          </div>
          <p className="text-center font-poppins text-[14px] text-black">
            Jika nomor terdaftar dan terverifikasi, kode 6 digit telah dikirim ke
          </p>
          <p className="font-poppins text-[14px] font-semibold text-[#17458f]">
            {maskContact(contact)}
          </p>

          <PasswordResetOtpForm />
        </div>
      </AuthCard>
    </div>
  );
}
