"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user_id");
  cookieStore.delete("session_role");
  cookieStore.delete("pending_contact");
  redirect("/login");
}
