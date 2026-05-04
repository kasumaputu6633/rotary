import Link from "next/link";
import { Icon } from "@iconify/react";
import AuthIllustration from "../_components/AuthIllustration";
import AuthCard from "../_components/AuthCard";

export default function UnauthorizedPage() {
  return (
    <div className="flex gap-15 items-center justify-center w-full max-w-5xl py-10">
      <AuthIllustration src="/auth/resetpass.png" />

      <AuthCard>
        <div className="flex flex-col items-center text-center gap-4 py-8 w-full">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Icon icon="lucide:circle-x" width={28} height={28} className="text-red-500" aria-hidden="true" />
          </div>
          <h1 className="font-roboto-serif font-semibold text-[22px] text-black">
            Akses Ditolak
          </h1>
          <p className="font-poppins text-[14px] text-[#555] leading-relaxed max-w-70">
            Anda tidak memiliki izin untuk mengakses halaman ini. Silakan masuk dengan akun yang sesuai.
          </p>
          <Link
            href="/login"
            className="mt-2 font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] px-8 py-2.5 hover:bg-[#e09918] transition-colors"
          >
            Kembali ke Masuk
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
