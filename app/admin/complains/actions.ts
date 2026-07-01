"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { complaints, listings, users, wasteLocations } from "@/db/schema";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import type {
  ComplaintPriority,
  ComplaintStatus,
  ComplaintTargetType,
} from "@/lib/moderation-format";

export type AdminComplaintRow = {
  id: string;
  seq: number;
  reporterName: string | null;
  targetType: ComplaintTargetType;
  targetLabel: string;
  targetSlug: string | null;
  category: string;
  description: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  resolutionNote: string | null;
  createdAt: Date;
};

export type AdminComplaintStats = {
  total: number;
  newCount: number;
  reviewing: number;
  highPriority: number;
  resolvedThisMonth: number;
};

export async function getAdminComplaints({
  search = "",
  status,
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  status?: ComplaintStatus;
  page?: number;
  pageSize?: number;
}): Promise<{
  complaints: AdminComplaintRow[];
  total: number;
  stats: AdminComplaintStats;
}> {
  await requireRole("admin");

  const offset = (page - 1) * pageSize;
  const reporter = alias(users, "reporter");
  const targetUser = alias(users, "target_user");
  const assignee = alias(users, "assignee");

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(complaints.category, `%${search}%`),
        ilike(reporter.fullName, `%${search}%`),
        ilike(reporter.shopName, `%${search}%`),
        ilike(listings.title, `%${search}%`),
      ),
    );
  }
  if (status) conditions.push(eq(complaints.status, status));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows, statsRows] = await Promise.all([
    db
      .select({
        id: complaints.id,
        seq: complaints.seq,
        reporterName: sql<
          string | null
        >`coalesce(${reporter.shopName}, ${reporter.fullName})`,
        targetType: complaints.targetType,
        listingTitle: listings.title,
        listingSlug: listings.slug,
        targetUserName: sql<
          string | null
        >`coalesce(${targetUser.shopName}, ${targetUser.fullName})`,
        targetDealId: complaints.targetDealId,
        wasteLocationName: wasteLocations.namaUsaha,
        category: complaints.category,
        description: complaints.description,
        status: complaints.status,
        priority: complaints.priority,
        assigneeId: complaints.assigneeId,
        assigneeName: sql<
          string | null
        >`coalesce(${assignee.shopName}, ${assignee.fullName})`,
        resolutionNote: complaints.resolutionNote,
        createdAt: complaints.createdAt,
      })
      .from(complaints)
      .leftJoin(reporter, eq(reporter.id, complaints.reporterId))
      .leftJoin(listings, eq(listings.id, complaints.targetListingId))
      .leftJoin(targetUser, eq(targetUser.id, complaints.targetUserId))
      .leftJoin(
        wasteLocations,
        eq(wasteLocations.id, complaints.targetWasteLocationId),
      )
      .leftJoin(assignee, eq(assignee.id, complaints.assigneeId))
      .where(whereClause)
      .orderBy(desc(complaints.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count(complaints.id) })
      .from(complaints)
      .leftJoin(reporter, eq(reporter.id, complaints.reporterId))
      .leftJoin(listings, eq(listings.id, complaints.targetListingId))
      .where(whereClause),

    db
      .select({
        total: count(complaints.id),
        newCount: sql<number>`count(*) filter (where ${complaints.status} = 'new')::int`,
        reviewing: sql<number>`count(*) filter (where ${complaints.status} = 'reviewing')::int`,
        highPriority: sql<number>`count(*) filter (where ${complaints.priority} = 'high' and ${complaints.status} in ('new','reviewing'))::int`,
        resolvedThisMonth: sql<number>`count(*) filter (where ${complaints.status} = 'resolved' and ${complaints.resolvedAt} >= date_trunc('month', now()))::int`,
      })
      .from(complaints),
  ]);

  const s = statsRows[0] ?? {
    total: 0,
    newCount: 0,
    reviewing: 0,
    highPriority: 0,
    resolvedThisMonth: 0,
  };

  return {
    complaints: rows.map((r) => {
      let targetLabel = "—";
      let targetSlug: string | null = null;
      if (r.targetType === "listing") {
        targetLabel = r.listingTitle ?? "Listing dihapus";
        targetSlug = r.listingSlug;
      } else if (r.targetType === "user") {
        targetLabel = r.targetUserName ?? "Pengguna dihapus";
      } else if (r.targetType === "deal") {
        targetLabel = r.targetDealId ? `Deal #${r.targetDealId.slice(0, 8)}` : "Transaksi dihapus";
      } else if (r.targetType === "waste_location") {
        targetLabel = r.wasteLocationName ?? "Lokasi limbah dihapus";
      }
      return {
        id: r.id,
        seq: r.seq,
        reporterName: r.reporterName,
        targetType: r.targetType,
        targetLabel,
        targetSlug,
        category: r.category,
        description: r.description,
        status: r.status,
        priority: r.priority,
        assigneeId: r.assigneeId,
        assigneeName: r.assigneeName,
        resolutionNote: r.resolutionNote,
        createdAt: r.createdAt,
      };
    }),
    total: Number(countRows[0]?.total ?? 0),
    stats: {
      total: Number(s.total),
      newCount: Number(s.newCount),
      reviewing: Number(s.reviewing),
      highPriority: Number(s.highPriority),
      resolvedThisMonth: Number(s.resolvedThisMonth),
    },
  };
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  resolutionNote?: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole("admin");

  const isTerminal = status === "resolved" || status === "rejected";
  const trimmed = resolutionNote?.trim();

  try {
    await db
      .update(complaints)
      .set({
        status,
        handledById: admin.id,
        resolutionNote: isTerminal ? trimmed || null : null,
        resolvedAt: isTerminal ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id));
    revalidatePath("/admin/complains");
    return { success: true };
  } catch (err) {
    console.error("[updateComplaintStatus]", err);
    return { success: false, error: "Gagal memperbarui status komplain." };
  }
}

export async function updateComplaintPriority(
  id: string,
  priority: ComplaintPriority,
): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  try {
    await db
      .update(complaints)
      .set({ priority, updatedAt: new Date() })
      .where(eq(complaints.id, id));
    revalidatePath("/admin/complains");
    return { success: true };
  } catch (err) {
    console.error("[updateComplaintPriority]", err);
    return { success: false, error: "Gagal memperbarui prioritas." };
  }
}

export async function assignComplaintToSelf(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole("admin");

  try {
    await db
      .update(complaints)
      .set({ assigneeId: admin.id, updatedAt: new Date() })
      .where(eq(complaints.id, id));
    revalidatePath("/admin/complains");
    return { success: true };
  } catch (err) {
    console.error("[assignComplaintToSelf]", err);
    return { success: false, error: "Gagal menugaskan komplain." };
  }
}
