import { getAccountVerificationStatus } from "@/lib/account-verification";
import { getCurrentAccountSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export type Role = "user" | "admin" | "super_admin";

// Hierarki akses: super_admin ⊇ admin ⊇ user.
// Role dengan rank lebih tinggi otomatis memenuhi syarat role di bawahnya.
const ROLE_RANK: Record<Role, number> = {
  user: 0,
  admin: 1,
  super_admin: 2,
};

export function roleRank(role: string | null | undefined): number {
  return ROLE_RANK[(role as Role) ?? "user"] ?? 0;
}

export function hasRole(
  role: string | null | undefined,
  minimum: Role,
): boolean {
  return roleRank(role) >= ROLE_RANK[minimum];
}

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

// Memenuhi syarat jika rank role user >= rank minimum yang diminta.
// Contoh: requireRole("admin") meloloskan admin DAN super_admin.
export async function requireRole(minimum: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasRole(user.role, minimum)) redirect("/unauthorized");
  return user;
}

export async function requireSellerReady() {
  const user = await requireRole("user");
  const verification = getAccountVerificationStatus(user);

  if (!verification.sellerReady) {
    throw new Error(
      "Verifikasi email dan nomor HP diperlukan untuk mengelola listing.",
    );
  }

  return user;
}
