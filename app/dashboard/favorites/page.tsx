import { redirect } from "next/navigation";

export default async function FavoriteListingsPage() {
  redirect("/account/favorites");
}
