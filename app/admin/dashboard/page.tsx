"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

// Mock data for the dashboard stats
const stats = [
  {
    title: "Total User",
    value: "300",
    lastMonth: "223",
    percentage: "+34.5%",
    trend: "up",
    icon: "lucide:users",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50 text-blue-600",
  },
  {
    title: "Total Vendor",
    value: "40",
    lastMonth: "34",
    percentage: "+17.6%",
    trend: "up",
    icon: "lucide:store",
    color: "from-amber-500 to-[#f7a81b]",
    bgLight: "bg-amber-50 text-[#f7a81b]",
  },
  {
    title: "Total Listing",
    value: "3.230",
    lastMonth: "2.222",
    percentage: "+45.3%",
    trend: "up",
    icon: "lucide:clipboard-list",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Total Transaksi",
    value: "245",
    lastMonth: "182",
    percentage: "+34.6%",
    trend: "up",
    icon: "lucide:arrow-left-right",
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50 text-rose-600",
  },
];

const recentActivities = [
  {
    id: 1,
    user: "Kadek Leon",
    action: "menambahkan listing baru",
    target: "Kulkas Mini Bekas Polytron",
    time: "5 menit yang lalu",
    badge: "Listing",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    id: 2,
    user: "Ayu Lestari",
    action: "mengajukan verifikasi vendor",
    target: "Limbah Plastik Bali",
    time: "25 menit yang lalu",
    badge: "Vendor",
    badgeColor: "bg-amber-50 text-[#f7a81b] border-amber-100",
  },
  {
    id: 3,
    user: "Made Wira",
    action: "melaporkan komplain transaksi",
    target: "Transaksi #TX-9028",
    time: "1 jam yang lalu",
    badge: "Komplain",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
  },
];

const wasteSummary = [
  { type: "Minyak Jelantah", quantity: "120 Liter", points: "2.400 pts", status: "Sudah Diambil" },
  { type: "Kertas & Kardus", quantity: "85 Kg", points: "850 pts", status: "Menunggu Penjemputan" },
  { type: "Limbah Elektronik", quantity: "12 Unit", points: "6.000 pts", status: "Sudah Diambil" },
];

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState("This Week");
  const [showDatePicker, setShowDatePicker] = useState(false);
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-900 md:text-3xl">
            Admin Overview
          </h1>
          <p className="font-poppins text-sm text-gray-500 mt-1">
            Ringkasan data pengguna, penjualan barang bekas, dan koordinasi pengangkutan sampah.
          </p>
        </div>

        {/* Date Filter Component */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Icon icon="lucide:calendar" width={16} height={16} className="text-[#f7a81b]" />
            <span>10 April, 2026 - 10 Mei, 2026</span>
            <Icon icon="lucide:chevron-down" width={14} height={14} className="text-gray-400" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 z-10 w-64 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Pilih Rentang Waktu</p>
              <div className="space-y-1">
                {["Hari Ini", "Minggu Ini", "Bulan Ini", "Kustom Tanggal"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setShowDatePicker(false)}
                    className="w-full text-left font-poppins text-xs px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-[#f7a81b] text-gray-700 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group relative rounded-2xl border border-white bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ring-1 ring-slate-100/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-poppins text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="font-poppins text-3xl font-bold text-gray-900 mt-2 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgLight} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                <Icon icon={stat.icon} width={22} height={22} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs font-poppins text-gray-500">
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
                <Icon icon="lucide:trending-up" width={12} height={12} />
                {stat.percentage}
              </span>
              <span>Bulan lalu: {stat.lastMonth}</span>
            </div>

            {/* Subtle bottom border highlight on hover */}
            <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
          </div>
        ))}
      </div>

      {/* Charts & Analytics Sections */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Revenue Analytics Chart Card */}
        <div className="lg:col-span-2 rounded-2xl border border-white bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-poppins text-base font-bold text-gray-900">
                Analisis Pendapatan & Jasa
              </h3>
              <p className="font-poppins text-xs text-gray-400">Total komisi penjualan & iuran vendor</p>
            </div>
            <div className="flex gap-2">
              {["This Week", "This Month"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`font-poppins text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${timeframe === tf
                      ? "border-[#f7a81b] bg-[#fff9f0] text-[#f7a81b] shadow-sm"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {tf === "This Week" ? "Minggu Ini" : "Bulan Ini"}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Vector Chart Representation */}
          <div className="relative h-64 w-full flex flex-col justify-end">
            <svg viewBox="0 0 500 200" className="w-full h-full text-[#f7a81b] overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f7a81b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f7a81b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Path Area */}
              <path
                d="M 0 160 Q 80 110 160 130 T 320 80 T 450 50 L 500 50 L 500 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              {/* Line path */}
              <path
                d="M 0 160 Q 80 110 160 130 T 320 80 T 450 50 L 500 50"
                fill="none"
                stroke="#f7a81b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Dots */}
              <circle cx="160" cy="130" r="5" fill="#f7a81b" stroke="white" strokeWidth="2" className="drop-shadow-md cursor-pointer hover:scale-150 transition-all" />
              <circle cx="320" cy="80" r="5" fill="#17458f" stroke="white" strokeWidth="2" className="drop-shadow-md cursor-pointer hover:scale-150 transition-all" />
              <circle cx="450" cy="50" r="5" fill="#f7a81b" stroke="white" strokeWidth="2" className="drop-shadow-md cursor-pointer hover:scale-150 transition-all" />
            </svg>

            {/* Chart X Labels */}
            <div className="flex justify-between items-center px-2 pt-3 border-t border-gray-100 font-poppins text-[10px] font-semibold text-gray-400">
              <span>Senin</span>
              <span>Selasa</span>
              <span>Rabu</span>
              <span>Kamis</span>
              <span>Jumat</span>
              <span>Sabtu</span>
              <span>Minggu</span>
            </div>
          </div>
        </div>

        {/* Waste Management Integration Info */}
        <div className="rounded-2xl border border-white bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins text-base font-bold text-gray-900">
                Penyetoran Limbah
              </h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Aktif
              </span>
            </div>

            <p className="font-poppins text-xs text-gray-400 mb-4">
              Data transaksi pengangkutan sampah daur ulang terbaru hari ini.
            </p>

            <div className="space-y-3">
              {wasteSummary.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <p className="font-poppins text-xs font-bold text-gray-800">{item.type}</p>
                    <p className="font-poppins text-[10px] text-gray-500">{item.quantity} • {item.points}</p>
                  </div>
                  <span className={`font-poppins text-[9px] font-semibold px-2 py-1 rounded-md ${item.status === "Sudah Diambil" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-[#f7a81b]"
                    }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <a href="/admin/waste-locations" className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 px-4 py-2.5 text-center font-poppins text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            <span>Kelola Lokasi Limbah</span>
            <Icon icon="lucide:arrow-right" width={14} height={14} />
          </a>
        </div>
      </div>

      {/* Second Row: Recent Activities & Fast Actions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 rounded-2xl border border-white bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-poppins text-base font-bold text-gray-900">
              Aktivitas Terbaru
            </h3>
            <button className="font-poppins text-xs font-bold text-[#17458f] hover:text-[#f7a81b] transition-colors">
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                    <Icon icon="lucide:activity" width={16} height={16} />
                  </div>
                  <div>
                    <p className="font-poppins text-xs text-gray-800">
                      <span className="font-semibold text-gray-950">{act.user}</span> {act.action}{" "}
                      <span className="font-semibold text-[#17458f]">{act.target}</span>
                    </p>
                    <p className="font-poppins text-[10px] text-gray-400 mt-1">{act.time}</p>
                  </div>
                </div>
                <span className={`font-poppins text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Shortcuts / Action Panel */}
        <div className="rounded-2xl border border-white bg-white p-6 shadow-sm">
          <h3 className="font-poppins text-base font-bold text-gray-900 mb-5">
            Tindakan Cepat
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Verifikasi User", icon: "lucide:user-check", href: "/admin/users", bg: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
              { label: "Moderasi Item", icon: "lucide:shield-alert", href: "/admin/moderation", bg: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
              { label: "Tambah Lokasi", icon: "lucide:plus-circle", href: "/admin/waste-locations", bg: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
              { label: "Analisis Data", icon: "lucide:bar-chart-3", href: "/admin/dashboard", bg: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
            ].map((shortcut, idx) => (
              <a
                key={idx}
                href={shortcut.href}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 text-center font-poppins transition-all group ${shortcut.bg}`}
              >
                <Icon
                  icon={shortcut.icon}
                  width={24}
                  height={24}
                  className="mb-2 transition-transform group-hover:scale-110"
                />
                <span className="text-[11px] font-semibold">{shortcut.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}