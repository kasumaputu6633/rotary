import { db } from "@/db";
import { favoriteListings, listingImages, listings, users } from "@/db/schema";
import type { ListingCardData, ListingStatus } from "@/lib/listing-format";
import { and, desc, eq, ne, sql, type SQL } from "drizzle-orm";

export type { ListingCardData, ListingMode, ListingStatus } from "@/lib/listing-format";

export function slugifyListing(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160) || "listing";
}

export async function createUniqueListingSlug(title: string) {
  const base = slugifyListing(title);
  for (let index = 0; index < 8; index += 1) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await db.query.listings.findFirst({
      where: eq(listings.slug, slug),
      columns: { id: true },
    });
    if (!existing) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

const listingSelection = {
  id: listings.id,
  slug: listings.slug,
  title: listings.title,
  description: listings.description,
  category: listings.category,
  subcategory: listings.subcategory,
  condition: listings.condition,
  mode: listings.mode,
  status: listings.status,
  price: listings.price,
  location: listings.location,
  latitude: listings.latitude,
  longitude: listings.longitude,
  updatedAt: listings.updatedAt,
  publishedAt: listings.publishedAt,
  sellerName: users.name,
  imageUrl: listingImages.imageUrl,
};

function favoriteExistsSubquery(userId: string) {
  return sql<boolean>`exists (
    select 1 from ${favoriteListings}
    where ${favoriteListings.userId} = ${userId}
      and ${favoriteListings.listingId} = ${listings.id}
  )`;
}

function withFavorite(row: Omit<ListingCardData, "isFavorite"> & { isFavorite?: boolean | null }): ListingCardData {
  return { ...row, isFavorite: Boolean(row.isFavorite) };
}

export async function getPublicListings({
  limit = 24,
  excludeSlug,
  userId,
}: {
  limit?: number;
  excludeSlug?: string;
  userId?: string | null;
} = {}) {
  const conditions: SQL[] = [eq(listings.status, "active")];
  if (excludeSlug) conditions.push(ne(listings.slug, excludeSlug));

  const rows = await db
    .select({
      ...listingSelection,
      isFavorite: userId ? favoriteExistsSubquery(userId) : sql<boolean>`false`,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0)))
    .where(and(...conditions))
    .orderBy(desc(listings.publishedAt), desc(listings.createdAt))
    .limit(limit);

  return rows.map(withFavorite);
}

export async function getPublicListingBySlug(slug: string, userId?: string | null) {
  const [row] = await db
    .select({
      ...listingSelection,
      sellerId: listings.sellerId,
      handoverOptions: listings.handoverOptions,
      sellerWhatsapp: users.whatsapp,
      isFavorite: userId ? favoriteExistsSubquery(userId) : sql<boolean>`false`,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0)))
    .where(and(eq(listings.slug, slug), eq(listings.status, "active")))
    .limit(1);

  return row ? withFavorite(row) : null;
}

export async function getListingImages(listingId: string) {
  return db
    .select({
      id: listingImages.id,
      imageUrl: listingImages.imageUrl,
      sortOrder: listingImages.sortOrder,
    })
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder);
}

export async function getSellerListingById(id: string, userId: string) {
  const [row] = await db
    .select({
      id: listings.id,
      slug: listings.slug,
      title: listings.title,
      description: listings.description,
      category: listings.category,
      subcategory: listings.subcategory,
      condition: listings.condition,
      mode: listings.mode,
      status: listings.status,
      price: listings.price,
      location: listings.location,
      latitude: listings.latitude,
      longitude: listings.longitude,
      handoverOptions: listings.handoverOptions,
      updatedAt: listings.updatedAt,
    })
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.sellerId, userId)))
    .limit(1);

  return row ?? null;
}

export async function getSellerListings(userId: string, status?: ListingStatus) {
  const conditions: SQL[] = [eq(listings.sellerId, userId)];
  if (status) conditions.push(eq(listings.status, status));

  // Kalau tampil semua (tanpa filter status), grupkan aktif dulu → draft → nonaktif
  const statusOrder = status
    ? desc(listings.updatedAt)
    : sql`CASE ${listings.status} WHEN 'active' THEN 0 WHEN 'draft' THEN 1 ELSE 2 END`;

  return db
    .select(listingSelection)
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0)))
    .where(and(...conditions))
    .orderBy(statusOrder, desc(listings.updatedAt), desc(listings.createdAt));
}

export async function getFavoriteListings(userId: string) {
  const rows = await db
    .select({
      ...listingSelection,
      isFavorite: sql<boolean>`true`,
    })
    .from(favoriteListings)
    .innerJoin(listings, eq(listings.id, favoriteListings.listingId))
    .leftJoin(users, eq(users.id, listings.sellerId))
    .leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0)))
    .where(and(eq(favoriteListings.userId, userId), eq(listings.status, "active")))
    .orderBy(desc(favoriteListings.createdAt));

  return rows.map(withFavorite);
}
