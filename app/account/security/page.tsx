import { redirect } from "next/navigation";

export default async function AccountSecurityPage() {
  redirect("/account/settings?tab=contact");
}
