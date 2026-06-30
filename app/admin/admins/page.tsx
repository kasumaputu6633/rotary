import { requireRole } from "@/lib/auth";
import { getAdmins } from "./actions";
import AdminsClient from "./_components/AdminsClient";

export const metadata = {
  title: "Manajemen Admin — Rotary Admin",
  description: "Kelola admin dan super admin platform Rotary.",
};

export default async function AdminAdminsPage() {
  // Hanya super admin yang boleh mengelola admin.
  const currentUser = await requireRole("super_admin");
  const { admins, totalAdmins, totalSuperAdmins } = await getAdmins();

  return (
    <AdminsClient
      admins={admins}
      totalAdmins={totalAdmins}
      totalSuperAdmins={totalSuperAdmins}
      currentUserId={currentUser.id}
    />
  );
}
