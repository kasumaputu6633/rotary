import type { ReactNode } from "react";
import { isEmailVerified, isPhoneVerified } from "@/lib/account-verification";
import { requireRole } from "@/lib/auth";
import { SellerVerificationGate } from "./SellerVerificationGate";

export async function VerifiedSellerArea({ children }: { children: ReactNode }) {
  const user = await requireRole("user");
  const emailVerified = isEmailVerified(user);
  const phoneVerified = isPhoneVerified(user);

  if (emailVerified && phoneVerified) return children;

  return (
    <SellerVerificationGate
      emailVerified={emailVerified}
      phoneVerified={phoneVerified}
    >
      {children}
    </SellerVerificationGate>
  );
}
