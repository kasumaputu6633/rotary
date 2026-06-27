import { requireRole } from "@/lib/auth";
import { getAdminUsers } from "./actions";
import UsersTable from "./UsersTable";
import UsersStatsRow from "./UsersStatsRow";
import { Icon } from "@iconify/react";

export const metadata = {
    title: "Users Overview — Rotary Admin",
    description: "Kelola semua pengguna terdaftar di platform Rotary.",
};

interface PageProps {
    searchParams: Promise<{
        search?: string;
        role?: string;
        page?: string;
    }>;
}

const PAGE_SIZE = 10;

export default async function AdminUsersPage({ searchParams }: PageProps) {
    await requireRole("admin");

    const params = await searchParams;
    const search = params.search ?? "";
    const role = (params.role === "user" || params.role === "admin") ? params.role : undefined;
    const page = Math.max(1, Number(params.page) || 1);

    // Fetch paginated users for the table + global stats simultaneously
    const [tableData, allData] = await Promise.all([
        getAdminUsers({ search, role, page, pageSize: PAGE_SIZE }),
        getAdminUsers({ pageSize: 99999 }),
    ]);

    const globalAdmins = allData.users.filter((u) => u.role === "admin").length;
    const globalUsers = allData.users.filter((u) => u.role === "user").length;
    const globalVerified = allData.users.filter((u) => u.isVerified).length;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 font-open-sauce text-[12px] text-gray-400">
                <span>Dashboard</span>
                <Icon icon="lucide:chevron-right" width={12} height={12} className="text-gray-300" />
                <span className="font-semibold text-[#17458f]">Users</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-open-sauce text-2xl font-bold text-gray-900">
                        Users Overview
                    </h1>
                    <p className="mt-0.5 font-open-sauce text-sm text-gray-500">
                        Kelola semua anggota, peran, dan data pengguna platform.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <UsersStatsRow
                total={allData.total}
                totalRegularUsers={globalUsers}
                totalAdmins={globalAdmins}
                totalVerified={globalVerified}
            />

            {/* Table Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <UsersTable
                    users={tableData.users}
                    total={tableData.total}
                    page={page}
                    pageSize={PAGE_SIZE}
                    search={search}
                    role={params.role ?? ""}
                />
            </div>
        </div>
    );
}
