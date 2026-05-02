import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function JualPage() {
  const user = await getCurrentUser();
  
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="font-roboto-serif font-semibold text-[32px] text-black mb-4">
          Halaman Jual Barang
        </h1>
        <p className="font-poppins text-[16px] text-[#555] mb-8">
          Fitur ini sedang dalam pengembangan.
        </p>
        <a
          href="/"
          className="font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] px-8 py-3 hover:bg-[#e09918] transition-colors inline-block"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
