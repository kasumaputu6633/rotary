"use client";

import { Icon } from "@iconify/react";

function StatCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg}`}
      >
        <Icon icon={icon} width={20} height={20} className="text-white" />
      </div>
      <div>
        <p className="font-open-sauce text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="font-open-sauce text-[22px] font-bold leading-tight text-gray-900">
          {value.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}

export default function ListingsStatsRow({
  total,
  active,
  draft,
  inactive,
  blocked,
}: {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  blocked: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label="Total Listing"
        value={total}
        icon="lucide:layout-grid"
        iconBg="from-[#17458f] to-[#1a5cbf]"
      />
      <StatCard
        label="Aktif"
        value={active}
        icon="lucide:circle-check"
        iconBg="from-emerald-500 to-emerald-600"
      />
      <StatCard
        label="Draft"
        value={draft}
        icon="lucide:file-pen"
        iconBg="from-violet-500 to-violet-600"
      />
      <StatCard
        label="Nonaktif"
        value={inactive}
        icon="lucide:circle-pause"
        iconBg="from-[#f7a81b] to-[#e89a14]"
      />
      <StatCard
        label="Diblokir"
        value={blocked}
        icon="lucide:shield-alert"
        iconBg="from-red-500 to-rose-600"
      />
    </div>
  );
}
