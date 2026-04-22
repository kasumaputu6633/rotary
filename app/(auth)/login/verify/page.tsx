import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthIllustration from "../../_components/AuthIllustration";
import AuthCard from "../../_components/AuthCard";
import LoginOtpForm from "./_components/LoginOtpForm";

function maskContact(contact: string): string {
  if (contact.includes("@")) {
    const [local, domain] = contact.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  }
  return contact.slice(0, 4) + "****" + contact.slice(-3);
}

export default async function LoginVerifyPage() {
  const cookieStore = await cookies();
  const contact = cookieStore.get("pending_contact")?.value;
  const userId = cookieStore.get("pending_login_user_id")?.value;

  if (!contact || !userId) redirect("/login");

  return (
    <div className="flex gap-[60px] items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/otp.png" />

      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Verifikasi Perangkat
        </h1>

        <div className="flex flex-col gap-[10px] items-center pt-[45px] pb-[42px] w-full">
          <div className="w-12 h-12 rounded-full bg-[#fff8ec] flex items-center justify-center mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="#f7a81b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="font-poppins text-[14px] text-black text-center">
            Kami mendeteksi masuk dari perangkat baru. Kode verifikasi telah dikirim ke
          </p>
          <p className="font-poppins font-semibold text-[14px] text-[#17458f]">
            {maskContact(contact)}
          </p>

          <LoginOtpForm />
        </div>
      </AuthCard>
    </div>
  );
}
