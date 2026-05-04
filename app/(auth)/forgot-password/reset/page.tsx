import Link from "next/link";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";
import AuthIllustration from "../../_components/AuthIllustration";
import AuthCard from "../../_components/AuthCard";
import ResetPasswordForm from "./_components/ResetPasswordForm";
import { validateResetToken } from "../../actions";

export default async function ForgotPasswordResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) redirect("/forgot-password");

  const record = await validateResetToken(token);

  if (!record) {
    return (
      <div className="flex gap-15 items-center justify-center w-full max-w-5xl py-10">
        <AuthIllustration src="/auth/resetpass.png" />
        <AuthCard>
          <div className="flex flex-col items-center text-center gap-4 py-8 w-full">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <Icon icon="lucide:circle-x" width={28} height={28} className="text-red-500" aria-hidden="true" />
            </div>
            <h1 className="font-roboto-serif font-semibold text-[22px] text-black">
              Link Tidak Valid
            </h1>
            <p className="font-poppins text-[14px] text-[#555] leading-relaxed max-w-70">
              Link reset kata sandi sudah kedaluarsa atau tidak valid.
            </p>
            <Link
              href="/forgot-password"
              className="mt-2 font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] px-8 py-2.5 hover:bg-[#e09918] transition-colors"
            >
              Minta Link Baru
            </Link>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex gap-15 items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/resetpass.png" />
      <AuthCard>
        <h1 className="font-roboto-serif font-semibold text-[24px] text-black">
          Buat Kata Sandi Baru
        </h1>
        <ResetPasswordForm token={token} />
      </AuthCard>
    </div>
  );
}
