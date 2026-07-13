import "server-only";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, listings } from "@/db/schema";
import { listingCategoryGroups } from "@/lib/listing-taxonomy";

export type CategoryGroup = {
  name: string;
  icon: string;
  subcategories: string[];
};

export type AdminCategory = {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  sortOrder: number;
  active: boolean;
  usageCount: number;
};

const FALLBACK_GROUPS: CategoryGroup[] = listingCategoryGroups.map((group) => ({
  name: group.name,
  icon: group.icon,
  subcategories: [...group.subcategories],
}));

/**
 * Kategori aktif untuk halaman publik (homepage, picker, filter).
 * Fallback ke taksonomi hardcoded bila tabel masih kosong / belum di-seed,
 * agar halaman user tidak rusak sebelum migrasi dijalankan.
 */
export async function getActiveCategories(): Promise<CategoryGroup[]> {
  const rows = await db
    .select({
      name: categories.name,
      icon: categories.icon,
      subcategories: categories.subcategories,
    })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  if (rows.length === 0) return FALLBACK_GROUPS;
  return rows.map((row) => ({
    name: row.name,
    icon: row.icon,
    subcategories: row.subcategories ?? [],
  }));
}

/** Semua kategori (aktif + nonaktif) plus jumlah listing terkait, untuk admin. */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  if (rows.length === 0) return [];

  // Hanya hitung listing aktif/reserved agar angka ini konsisten dengan
  // guard di toggleCategoryAction / deleteCategoryAction.
  const counts = await db
    .select({
      category: listings.category,
      count: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(
      and(
        inArray(
          listings.category,
          rows.map((r) => r.name),
        ),
        inArray(listings.status, ["active", "reserved"]),
      ),
    )
    .groupBy(listings.category);

  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    subcategories: row.subcategories ?? [],
    sortOrder: row.sortOrder,
    active: row.active,
    usageCount: countMap.get(row.name) ?? 0,
  }));
}

/**
 * Isi tabel kategori dari taksonomi hardcoded. Idempotent: hanya menambahkan
 * kategori yang belum ada berdasarkan nama, tidak menimpa yang sudah diedit.
 */
export async function seedCategoriesFromTaxonomy(): Promise<number> {
  const existing = await db.select({ name: categories.name }).from(categories);
  const existingNames = new Set(existing.map((e) => e.name));

  const toInsert = listingCategoryGroups
    .map((group, index) => ({
      name: group.name,
      icon: group.icon,
      subcategories: [...group.subcategories],
      sortOrder: index + 1,
      active: true,
    }))
    .filter((c) => !existingNames.has(c.name));

  if (toInsert.length === 0) return 0;
  await db.insert(categories).values(toInsert);
  return toInsert.length;
}
