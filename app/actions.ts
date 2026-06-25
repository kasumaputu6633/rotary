"use server";

import { revokeCurrentSession } from "@/lib/auth-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await revokeCurrentSession();
  const cookieStore = await cookies();
  cookieStore.delete("pending_contact");
  cookieStore.delete("pending_login_user_id");
  cookieStore.delete("pending_login_redirect");
  cookieStore.delete("pending_login_reason");
  redirect("/login");
}
