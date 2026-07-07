import { requireRole } from "@/lib/auth";
import { getAdminDashboardData } from "./actions";
import DashboardClient from "./_components/DashboardClient";

export const metadata = {
  title: "Dashboard — Rotary Admin",
  description: "Ringkasan data platform Rotary.",
};

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const data = await getAdminDashboardData();

  return <DashboardClient data={data} />;
}
