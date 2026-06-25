import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthIllustration from "../../_components/AuthIllustration";
import AuthCard from "../../_components/AuthCard";
import OtpForm from "./_components/OtpForm";
import { maskContact } from "@/lib/phone";

export default async function RegisterVerifyPage() {
  const cookieStore = await cookies();
  const contact = cookieStore.get("pending_contact")?.value;

  if (!contact) redirect("/register");

  return (
    <div className="flex gap-[60px] items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/otp.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Verifikasi
        </h1>

        <div className="flex flex-col gap-[10px] items-center pt-[45px] pb-[42px] w-full">
          <p className="font-poppins text-[14px] text-black text-center">
            Masukkan kode 6 digit yang telah dikirim melalui{" "}
            {contact.includes("@") ? "email" : "WhatsApp"} ke
          </p>
          <p className="font-poppins font-semibold text-[14px] text-[#17458f]">
            {maskContact(contact)}
          </p>

          <OtpForm />
        </div>
      </AuthCard>
    </div>
  );
}
