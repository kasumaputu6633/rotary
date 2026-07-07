"use client";

import { Icon } from "@iconify/react";

export default function AdminStatCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: number | string;
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
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
      </div>
    </div>
  );
}
