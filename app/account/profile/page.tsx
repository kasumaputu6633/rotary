import { redirect } from "next/navigation";

export default async function AccountProfilePage() {
  redirect("/account/settings?tab=profile");
}
