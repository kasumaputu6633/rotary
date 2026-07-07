"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { categories, listings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { seedCategoriesFromTaxonomy } from "@/lib/categories";

function parseSubcategories(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidateCategoryConsumers() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/dashboard/listings/new");
}

/** Isi tabel dari taksonomi hardcoded (dipanggil dari tombol di admin). */
export async function seedCategoriesAction() {
  await requireRole("admin");
  const inserted = await seedCategoriesFromTaxonomy();
  revalidateCategoryConsumers();
  return { inserted };
}

export async function createCategoryAction(formData: FormData) {
  await requireRole("admin");

  const name = (formData.get("name") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim() || "lucide:tag";
  const subcategories = parseSubcategories(formData.get("subcategories") as string);

  if (!name) throw new Error("Nama kategori harus diisi.");

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name));
  if (existing.length > 0) throw new Error("Kategori dengan nama ini sudah ada.");

  const [maxRow] = await db
    .select({ max: sql<number>`coalesce(max(${categories.sortOrder}), 0)::int` })
    .from(categories);

  await db.insert(categories).values({
    name,
    icon,
    subcategories,
    sortOrder: (maxRow?.max ?? 0) + 1,
    active: true,
  });

  revalidateCategoryConsumers();
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireRole("admin");

  const name = (formData.get("name") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim() || "lucide:tag";
  const subcategories = parseSubcategories(formData.get("subcategories") as string);

  if (!name) throw new Error("Nama kategori harus diisi.");

  const [current] = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, id));
  if (!current) throw new Error("Kategori tidak ditemukan.");

  // Cegah bentrok nama dengan kategori lain.
  const clash = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name));
  if (clash.some((c) => c.id !== id)) {
    throw new Error("Kategori dengan nama ini sudah ada.");
  }

  await db
    .update(categories)
    .set({ name, icon, subcategories, updatedAt: new Date() })
    .where(eq(categories.id, id));

  // Backfill: listing lama menyimpan nama kategori sebagai string, jadi rename
  // harus ikut memperbarui listing agar tidak "yatim" di filter produk.
  if (current.name !== name) {
    await db
      .update(listings)
      .set({ category: name })
      .where(eq(listings.category, current.name));
  }

  revalidateCategoryConsumers();
}

export async function toggleCategoryAction(id: string, active: boolean) {
  await requireRole("admin");
  await db
    .update(categories)
    .set({ active, updatedAt: new Date() })
    .where(eq(categories.id, id));
  revalidateCategoryConsumers();
}

export async function deleteCategoryAction(id: string) {
  await requireRole("admin");

  const [current] = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, id));
  if (!current) throw new Error("Kategori tidak ditemukan.");

  const [usage] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.category, current.name));

  // Jangan hapus kategori yang masih dipakai listing — nonaktifkan saja agar
  // hilang dari picker/filter tanpa membuat listing kehilangan kategorinya.
  if ((usage?.count ?? 0) > 0) {
    throw new Error(
      `Kategori masih dipakai ${usage.count} listing. Nonaktifkan kategori alih-alih menghapusnya.`,
    );
  }

  await db.delete(categories).where(eq(categories.id, id));
  revalidateCategoryConsumers();
}
