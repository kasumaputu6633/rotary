"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export type DashboardStat = {
  total: number;
  thisMonth: number;
  lastMonth: number;
};

export type DashboardActivity = {
  id: string;
  type: "listing" | "deal" | "user";
  name: string;
  detail: string;
  createdAt: Date;
};

export type DashboardWasteLocation = {
  id: string;
  namaUsaha: string;
  type: string;
  jenisCount: number;
  isActive: boolean;
};

export type AdminDashboardData = {
  users: DashboardStat;
  sellers: DashboardStat;
  listings: DashboardStat & { active: number };
  deals: DashboardStat & { completed: number };
  wasteLocationsTotal: number;
  trend: { day: string; count: number }[];
  activities: DashboardActivity[];
  wasteLocations: DashboardWasteLocation[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await requireRole("admin");

  const [
    usersRow,
    sellersRow,
    listingsRow,
    dealsRow,
    wasteCountRow,
    trendRows,
    recentListings,
    recentDeals,
    recentUsers,
    wasteRows,
  ] = await Promise.all([
    // Users: total + bulan ini + bulan lalu
    db.execute<{ total: number; this_month: number; last_month: number }>(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS this_month,
        count(*) FILTER (
          WHERE created_at >= date_trunc('month', now()) - interval '1 month'
            AND created_at < date_trunc('month', now())
        )::int AS last_month
      FROM users
    `),
    // Sellers: penjual unik berdasarkan listing
    db.execute<{ total: number; this_month: number; last_month: number }>(sql`
      WITH first_listing AS (
        SELECT seller_id, min(created_at) AS first_at
        FROM listings GROUP BY seller_id
      )
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE first_at >= date_trunc('month', now()))::int AS this_month,
        count(*) FILTER (
          WHERE first_at >= date_trunc('month', now()) - interval '1 month'
            AND first_at < date_trunc('month', now())
        )::int AS last_month
      FROM first_listing
    `),
    // Listings: total + aktif + bulan ini/lalu
    db.execute<{
      total: number;
      active: number;
      this_month: number;
      last_month: number;
    }>(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status = 'active')::int AS active,
        count(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS this_month,
        count(*) FILTER (
          WHERE created_at >= date_trunc('month', now()) - interval '1 month'
            AND created_at < date_trunc('month', now())
        )::int AS last_month
      FROM listings
    `),
    // Deals/transaksi: total + selesai + bulan ini/lalu
    db.execute<{
      total: number;
      completed: number;
      this_month: number;
      last_month: number;
    }>(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status = 'completed')::int AS completed,
        count(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS this_month,
        count(*) FILTER (
          WHERE created_at >= date_trunc('month', now()) - interval '1 month'
            AND created_at < date_trunc('month', now())
        )::int AS last_month
      FROM listing_deals
    `),
    db.execute<{ total: number }>(
      sql`SELECT count(*)::int AS total FROM waste_locations`,
    ),
    // Tren listing baru 7 hari terakhir (data riil, termasuk hari kosong)
    db.execute<{ day: string; count: number }>(sql`
      SELECT to_char(gs.day, 'YYYY-MM-DD') AS day, count(l.id)::int AS count
      FROM generate_series(
        date_trunc('day', now()) - interval '6 days',
        date_trunc('day', now()),
        interval '1 day'
      ) AS gs(day)
      LEFT JOIN listings l ON date_trunc('day', l.created_at) = gs.day
      GROUP BY gs.day
      ORDER BY gs.day
    `),
    db.execute<{
      id: string;
      title: string;
      seller_name: string | null;
      created_at: Date;
    }>(sql`
      SELECT l.id, l.title, coalesce(u.shop_name, u.full_name) AS seller_name, l.created_at
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      ORDER BY l.created_at DESC
      LIMIT 5
    `),
    db.execute<{
      id: string;
      title: string;
      status: string;
      created_at: Date;
    }>(sql`
      SELECT d.id, l.title, d.status, d.created_at
      FROM listing_deals d
      JOIN listings l ON l.id = d.listing_id
      ORDER BY d.created_at DESC
      LIMIT 5
    `),
    db.execute<{ id: string; name: string | null; created_at: Date }>(sql`
      SELECT id, coalesce(shop_name, full_name, email) AS name, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `),
    db.execute<{
      id: string;
      nama_usaha: string;
      type: string;
      jenis_count: number;
      is_active: boolean;
    }>(sql`
      SELECT id, nama_usaha, type,
        coalesce(array_length(jenis_sampah_diterima, 1), 0)::int AS jenis_count,
        is_active
      FROM waste_locations
      ORDER BY created_at DESC
      LIMIT 4
    `),
  ]);

  const u = usersRow[0] ?? { total: 0, this_month: 0, last_month: 0 };
  const s = sellersRow[0] ?? { total: 0, this_month: 0, last_month: 0 };
  const l = listingsRow[0] ?? {
    total: 0,
    active: 0,
    this_month: 0,
    last_month: 0,
  };
  const d = dealsRow[0] ?? {
    total: 0,
    completed: 0,
    this_month: 0,
    last_month: 0,
  };

  const activities: DashboardActivity[] = [
    ...recentListings.map((r) => ({
      id: `listing-${r.id}`,
      type: "listing" as const,
      name: r.seller_name ?? "Pengguna",
      detail: r.title,
      createdAt: new Date(r.created_at),
    })),
    ...recentDeals.map((r) => ({
      id: `deal-${r.id}`,
      type: "deal" as const,
      name: r.title,
      detail:
        r.status === "completed"
          ? "transaksi selesai"
          : r.status === "cancelled"
            ? "transaksi dibatalkan"
            : "transaksi berjalan",
      createdAt: new Date(r.created_at),
    })),
    ...recentUsers.map((r) => ({
      id: `user-${r.id}`,
      type: "user" as const,
      name: r.name ?? "Pengguna baru",
      detail: "mendaftar sebagai pengguna",
      createdAt: new Date(r.created_at),
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return {
    users: { total: u.total, thisMonth: u.this_month, lastMonth: u.last_month },
    sellers: {
      total: s.total,
      thisMonth: s.this_month,
      lastMonth: s.last_month,
    },
    listings: {
      total: l.total,
      active: l.active,
      thisMonth: l.this_month,
      lastMonth: l.last_month,
    },
    deals: {
      total: d.total,
      completed: d.completed,
      thisMonth: d.this_month,
      lastMonth: d.last_month,
    },
    wasteLocationsTotal: wasteCountRow[0]?.total ?? 0,
    trend: trendRows.map((r) => ({ day: r.day, count: r.count })),
    activities,
    wasteLocations: wasteRows.map((r) => ({
      id: r.id,
      namaUsaha: r.nama_usaha,
      type: r.type,
      jenisCount: r.jenis_count,
      isActive: r.is_active,
    })),
  };
}
