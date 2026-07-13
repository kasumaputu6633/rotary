import type { Metadata } from "next";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import { SellerToaster } from "@/app/dashboard/_components/SellerToaster";
import { requireRole } from "@/lib/auth";
import { isEmailVerified, isPhoneVerified } from "@/lib/account-verification";
import { resolveShopName } from "@/lib/profile";
import { AccountShell } from "./_components/AccountShell";

export const metadata: Metadata = {
  title: "Akun Saya | Rotary",
  description: "Kelola identitas, keamanan, dan favorit akun Rotary.",
};

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole("user");

  return (
    <>
      <Navbar />
      <AccountShell
        avatarUrl={user.avatarUrl}
        emailVerified={isEmailVerified(user)}
        name={user.fullName?.trim() || resolveShopName(user)}
        phoneVerified={isPhoneVerified(user)}
        userRole={user.role}
      >
        {children}
      </AccountShell>
      <Footer />
      <SellerToaster />
    </>
  );
}
