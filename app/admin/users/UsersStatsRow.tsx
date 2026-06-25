"use client";

import { Icon } from "@iconify/react";

interface StatCardProps {
    label: string;
    value: number;
    icon: string;
    iconBg: string;
    iconColor: string;
}

function StatCard({ label, value, icon, iconBg, iconColor }: StatCardProps) {
    return (
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg}`}
            >
                <Icon icon={icon} width={20} height={20} className={iconColor} />
            </div>
            <div>
                <p className="font-poppins text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                    {label}
                </p>
                <p className="font-poppins text-[22px] font-bold leading-tight text-gray-900">
                    {value.toLocaleString("id-ID")}
                </p>
            </div>
        </div>
    );
}

export default function UsersStatsRow({
    total,
    totalRegularUsers,
    totalAdmins,
    totalVerified,
}: {
    total: number;
    totalRegularUsers: number;
    totalAdmins: number;
    totalVerified: number;
}) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
                label="Total Pengguna"
                value={total}
                icon="lucide:users"
                iconBg="from-[#17458f] to-[#1a5cbf]"
                iconColor="text-white"
            />
            <StatCard
                label="User Biasa"
                value={totalRegularUsers}
                icon="lucide:user"
                iconBg="from-[#f7a81b] to-[#e89a14]"
                iconColor="text-white"
            />
            <StatCard
                label="Admin"
                value={totalAdmins}
                icon="lucide:shield-check"
                iconBg="from-emerald-500 to-emerald-600"
                iconColor="text-white"
            />
            <StatCard
                label="Terverifikasi"
                value={totalVerified}
                icon="lucide:badge-check"
                iconBg="from-violet-500 to-violet-600"
                iconColor="text-white"
            />
        </div>
    );
}
