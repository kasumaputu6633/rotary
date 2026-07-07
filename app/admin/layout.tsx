import { requireRole } from "@/lib/auth";
import AdminLayoutClient from "./_components/AdminLayoutClient";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireRole("admin");

    return (
        <AdminLayoutClient
            user={{
                id: user.id,
                fullName: user.fullName ?? null,
                email: user.email ?? null,
                avatarUrl: user.avatarUrl ?? null,
                role: user.role,
            }}
        >
            {children}
        </AdminLayoutClient>
    );
}