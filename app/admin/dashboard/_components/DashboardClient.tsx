"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { AdminDashboardData, DashboardActivity } from "../actions";

// Hitung pertumbuhan persentase bulan ini terhadap bulan lalu.
function computeGrowth(thisMonth: number, lastMonth: number): number {
  if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10;
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari yang lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

const ACTIVITY_CONFIG: Record<
  DashboardActivity["type"],
  { icon: string; badge: string; badgeColor: string }
> = {
  listing: {
    icon: "lucide:clipboard-list",
    badge: "Listing",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  deal: {
    icon: "lucide:arrow-left-right",
    badge: "Transaksi",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
  },
  user: {
    icon: "lucide:user-plus",
    badge: "Pengguna",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
  },
};

function StatCard({
  title,
  value,
  thisMonth,
  lastMonth,
  icon,
  color,
  bgLight,
}: {
  title: string;
  value: number;
  thisMonth: number;
  lastMonth: number;
  icon: string;
  color: string;
  bgLight: string;
}) {
  const growth = computeGrowth(thisMonth, lastMonth);
  const trendUp = growth >= 0;
  return (
    <div className="group relative rounded-2xl border border-white bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ring-1 ring-slate-100/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-open-sauce text-xs font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="font-open-sauce text-3xl font-bold text-gray-900 mt-2 tracking-tight">
            {value.toLocaleString("id-ID")}
          </h3>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgLight} transition-transform duration-300 group-hover:scale-110 shadow-sm`}
        >
          <Icon icon={icon} width={22} height={22} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs font-open-sauce text-gray-500">
        <span
          className={`inline-flex items-center gap-0.5 font-semibold ${
            trendUp ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          <Icon
            icon={trendUp ? "lucide:trending-up" : "lucide:trending-down"}
            width={12}
            height={12}
          />
          {trendUp ? "+" : ""}
          {growth}%
        </span>
        <span>Bulan ini: {thisMonth.toLocaleString("id-ID")}</span>
      </div>

      <div
        className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
      />
    </div>
  );
}

function TrendChart({ trend }: { trend: AdminDashboardData["trend"] }) {
  const counts = trend.map((t) => t.count);
  const max = Math.max(1, ...counts);
  const totalWeek = counts.reduce((a, b) => a + b, 0);

  // Bangun titik untuk polyline pada viewBox 500x200 (40px padding atas/bawah).
  const stepX = trend.length > 1 ? 500 / (trend.length - 1) : 0;
  const points = trend.map((t, i) => {
    const x = i * stepX;
    const y = 170 - (t.count / max) * 130;
    return { x, y, ...t };
  });
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L 500 200 L 0 200 Z`;

  return (
    <div className="lg:col-span-2 rounded-2xl border border-white bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-open-sauce text-base font-bold text-gray-900">
            Listing Baru (7 Hari Terakhir)
          </h3>
          <p className="font-open-sauce text-xs text-gray-400">
            Total {totalWeek.toLocaleString("id-ID")} listing dibuat minggu ini
          </p>
        </div>
      </div>

      <div className="relative h-64 w-full flex flex-col justify-end">
        <svg
          viewBox="0 0 500 200"
          className="w-full h-full text-[#f7a81b] overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7a81b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f7a81b" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="40"
            x2="500"
            y2="40"
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="105"
            x2="500"
            y2="105"
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="170"
            x2="500"
            y2="170"
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />

          {trend.length > 0 && (
            <>
              <path d={areaPath} fill="url(#chartGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="#f7a81b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p) => (
                <circle
                  key={p.day}
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#f7a81b"
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-md"
                >
                  <title>{`${p.count} listing`}</title>
                </circle>
              ))}
            </>
          )}
        </svg>

        <div className="flex justify-between items-center px-1 pt-3 border-t border-gray-100 font-open-sauce text-[10px] font-semibold text-gray-400">
          {trend.map((t) => {
            const label = DAY_LABELS[new Date(t.day + "T00:00:00").getDay()];
            return <span key={t.day}>{label}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  data,
}: {
  data: AdminDashboardData;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-open-sauce text-2xl font-bold text-gray-900 md:text-3xl">
            Admin Overview
          </h1>
          <p className="font-open-sauce text-sm text-gray-500 mt-1">
            Ringkasan data pengguna, penjualan barang bekas, dan koordinasi
            pengangkutan sampah.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-open-sauce text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Icon
              icon="lucide:calendar"
              width={16}
              height={16}
              className="text-[#f7a81b]"
            />
            <span>{today}</span>
            <Icon
              icon="lucide:chevron-down"
              width={14}
              height={14}
              className="text-gray-400"
            />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 z-10 w-64 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Rentang Waktu
              </p>
              <p className="font-open-sauce text-xs text-gray-500 px-1">
                Statistik dihitung berdasarkan bulan berjalan dibandingkan bulan
                lalu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pengguna"
          value={data.users.total}
          thisMonth={data.users.thisMonth}
          lastMonth={data.users.lastMonth}
          icon="lucide:users"
          color="from-blue-500 to-indigo-600"
          bgLight="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Penjual"
          value={data.sellers.total}
          thisMonth={data.sellers.thisMonth}
          lastMonth={data.sellers.lastMonth}
          icon="lucide:store"
          color="from-amber-500 to-[#f7a81b]"
          bgLight="bg-amber-50 text-[#f7a81b]"
        />
        <StatCard
          title="Total Listing"
          value={data.listings.total}
          thisMonth={data.listings.thisMonth}
          lastMonth={data.listings.lastMonth}
          icon="lucide:clipboard-list"
          color="from-emerald-500 to-teal-600"
          bgLight="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Transaksi"
          value={data.deals.total}
          thisMonth={data.deals.thisMonth}
          lastMonth={data.deals.lastMonth}
          icon="lucide:arrow-left-right"
          color="from-rose-500 to-pink-600"
          bgLight="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Charts & Waste */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <TrendChart trend={data.trend} />

        <div className="rounded-2xl border border-white bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-open-sauce text-base font-bold text-gray-900">
                Lokasi Limbah
              </h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {data.wasteLocationsTotal} Lokasi
              </span>
            </div>

            <p className="font-open-sauce text-xs text-gray-400 mb-4">
              Lokasi penampung limbah terbaru yang terdaftar di platform.
            </p>

            <div className="space-y-3">
              {data.wasteLocations.length === 0 ? (
                <p className="font-open-sauce text-xs text-gray-400 py-4 text-center">
                  Belum ada lokasi limbah.
                </p>
              ) : (
                data.wasteLocations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-open-sauce text-xs font-bold text-gray-800 truncate">
                        {item.namaUsaha}
                      </p>
                      <p className="font-open-sauce text-[10px] text-gray-500 uppercase">
                        {item.type} • {item.jenisCount} jenis sampah
                      </p>
                    </div>
                    <span
                      className={`font-open-sauce text-[9px] font-semibold px-2 py-1 rounded-md shrink-0 ${
                        item.isActive
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/waste-locations"
            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 px-4 py-2.5 text-center font-open-sauce text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span>Kelola Lokasi Limbah</span>
            <Icon icon="lucide:arrow-right" width={14} height={14} />
          </Link>
        </div>
      </div>

      {/* Activities & Quick Actions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-open-sauce text-base font-bold text-gray-900">
              Aktivitas Terbaru
            </h3>
          </div>

          {data.activities.length === 0 ? (
            <p className="font-open-sauce text-sm text-gray-400 py-8 text-center">
              Belum ada aktivitas.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.activities.map((act) => {
                const conf = ACTIVITY_CONFIG[act.type];
                return (
                  <div
                    key={act.id}
                    className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                        <Icon icon={conf.icon} width={16} height={16} />
                      </div>
                      <div>
                        <p className="font-open-sauce text-xs text-gray-800">
                          <span className="font-semibold text-gray-950">
                            {act.name}
                          </span>{" "}
                          {act.type === "listing"
                            ? "menambahkan listing "
                            : `${act.detail} `}
                          {act.type === "listing" && (
                            <span className="font-semibold text-[#17458f]">
                              {act.detail}
                            </span>
                          )}
                        </p>
                        <p className="font-open-sauce text-[10px] text-gray-400 mt-1">
                          {formatRelative(act.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-open-sauce text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${conf.badgeColor}`}
                    >
                      {conf.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white bg-white p-6 shadow-sm">
          <h3 className="font-open-sauce text-base font-bold text-gray-900 mb-5">
            Tindakan Cepat
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Kelola User",
                icon: "lucide:user-check",
                href: "/admin/users",
                bg: "bg-blue-50 text-blue-600 hover:bg-blue-100",
              },
              {
                label: "Kelola Listing",
                icon: "lucide:clipboard-list",
                href: "/admin/listings",
                bg: "bg-rose-50 text-rose-600 hover:bg-rose-100",
              },
              {
                label: "Tambah Lokasi",
                icon: "lucide:plus-circle",
                href: "/admin/waste-locations/add",
                bg: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
              },
              {
                label: "Lokasi Limbah",
                icon: "lucide:recycle",
                href: "/admin/waste-locations",
                bg: "bg-amber-50 text-[#f7a81b] hover:bg-amber-100",
              },
            ].map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 text-center font-open-sauce transition-all group ${shortcut.bg}`}
              >
                <Icon
                  icon={shortcut.icon}
                  width={24}
                  height={24}
                  className="mb-2 transition-transform group-hover:scale-110"
                />
                <span className="text-[11px] font-semibold">
                  {shortcut.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
