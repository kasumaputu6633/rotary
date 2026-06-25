import { getAccountVerificationStatus } from "@/lib/account-verification";
import { getCurrentAccountSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export async function getSessionUserId(): Promise<string | null> {
  const current = await getCurrentAccountSession();
  return current?.user.id ?? null;
}

export async function getCurrentUser() {
  const current = await getCurrentAccountSession();
  return current?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: "user" | "admin") {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect("/unauthorized");
  return user;
}

export async function requireSellerReady() {
  const user = await requireRole("user");
  const verification = getAccountVerificationStatus(user);

  if (!verification.sellerReady) {
    throw new Error("Verifikasi email dan nomor HP diperlukan untuk mengelola listing.");
  }

  return user;
}
