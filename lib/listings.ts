import { db } from "@/db";
import { favoriteListings, listingImages, listings, users } from "@/db/schema";
import type { ListingCardData, ListingMode, ListingStatus } from "@/lib/listing-format";
import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";

export type { ListingCardData, ListingMode, ListingStatus } from "@/lib/listing-format";

export type PublicListingSort = "newest" | "popular" | "price-low" | "price-high";

export type PublicListingsQuery = {
  limit?: number;
  page?: number;
  offset?: number;
  excludeSlug?: string;
  userId?: string | null;
  q?: string | null;
  category?: string | null;
  subcategory?: string | null;
  mode?: ListingMode | "all" | null;
  location?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: PublicListingSort | null;
};

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
  handoverOptions: listings.handoverOptions,
  viewCount: listings.viewCount,
  updatedAt: listings.updatedAt,
  publishedAt: listings.publishedAt,
  reservedAt: listings.reservedAt,
  completedAt: listings.completedAt,
  sellerName: sql<string | null>`coalesce(${users.displayName}, ${users.name})`,
  sellerAvatarUrl: users.avatarUrl,
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

function normalizeLimit(limit: number | undefined) {
  if (!limit || Number.isNaN(limit)) return 24;
  return Math.min(Math.max(Math.floor(limit), 1), 60);
}

function normalizePage(page: number | undefined) {
  if (!page || Number.isNaN(page)) return 1;
  return Math.max(Math.floor(page), 1);
}

function buildPublicListingConditions({
  excludeSlug,
  q,
  category,
  subcategory,
  mode,
  location,
  minPrice,
  maxPrice,
}: PublicListingsQuery) {
  const conditions: SQL[] = [inArray(listings.status, ["active", "reserved"])];

  if (excludeSlug) conditions.push(ne(listings.slug, excludeSlug));
  if (category) conditions.push(eq(listings.category, category));
  if (subcategory) conditions.push(eq(listings.subcategory, subcategory));
  if (mode && mode !== "all") conditions.push(eq(listings.mode, mode));
  if (location) conditions.push(ilike(listings.location, `%${location.trim()}%`));
  if (typeof minPrice === "number" && Number.isFinite(minPrice)) conditions.push(gte(listings.price, minPrice));
  if (typeof maxPrice === "number" && Number.isFinite(maxPrice)) conditions.push(lte(listings.price, maxPrice));

  const keyword = q?.trim();
  if (keyword) {
    const pattern = `%${keyword}%`;
    const searchCondition = or(
      ilike(listings.title, pattern),
      ilike(listings.description, pattern),
      ilike(listings.category, pattern),
      ilike(listings.subcategory, pattern),
      ilike(listings.location, pattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  return conditions;
}

function getPublicListingOrder(sort: PublicListingSort | null | undefined) {
  if (sort === "popular") return [desc(listings.viewCount), desc(listings.publishedAt), desc(listings.createdAt)];
  if (sort === "price-low") return [sql`${listings.price} asc nulls last`, desc(listings.publishedAt)];
  if (sort === "price-high") return [sql`${listings.price} desc nulls last`, desc(listings.publishedAt)];
  return [desc(listings.publishedAt), desc(listings.createdAt)];
}

export async function getPublicListings(params: PublicListingsQuery = {}) {
  const limit = normalizeLimit(params.limit);
  const page = normalizePage(params.page);
  const offset = typeof params.offset === "number" ? Math.max(params.offset, 0) : (page - 1) * limit;
  const conditions = buildPublicListingConditions(params);

  const rows = await db
    .select({
      ...listingSelection,
      isFavorite: params.userId ? favoriteExistsSubquery(params.userId) : sql<boolean>`false`,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0)))
    .where(and(...conditions))
    .orderBy(...getPublicListingOrder(params.sort))
    .limit(limit)
    .offset(offset);

  return rows.map(withFavorite);
}

export async function getPublicListingsCount(params: PublicListingsQuery = {}) {
  const conditions = buildPublicListingConditions(params);
  return db.$count(listings, and(...conditions));
}

export async function getPublicListingCategoryCounts() {
  return db
    .select({
      category: listings.category,
      count: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(inArray(listings.status, ["active", "reserved"]))
    .groupBy(listings.category)
    .orderBy(asc(listings.category));
}

export async function getPublicListingBySlug(slug: string, userId?: string | null) {
  const [row] = await db
    .select({
      ...listingSelection,
      sellerId: listings.sellerId,
      handoverOptions: listings.handoverOptions,
      sellerWhatsapp: users.phone,
      isFavorite: userId ? favoriteExistsSubquery(userId) : sql<boolean>`false`,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0)))
    .where(and(eq(listings.slug, slug), inArray(listings.status, ["active", "reserved"])))
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
      reservedAt: listings.reservedAt,
      completedAt: listings.completedAt,
    })
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.sellerId, userId)))
    .limit(1);

  return row ?? null;
}

export async function getSellerListings(userId: string, status?: ListingStatus) {
  const conditions: SQL[] = [eq(listings.sellerId, userId)];
  if (status) conditions.push(eq(listings.status, status));

  // Kalau tampil semua, grupkan berdasarkan alur kerja seller.
  const statusOrder = status
    ? desc(listings.updatedAt)
    : sql`CASE ${listings.status}
        WHEN 'active' THEN 0
        WHEN 'reserved' THEN 1
        WHEN 'draft' THEN 2
        WHEN 'completed' THEN 3
        ELSE 4
      END`;

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
    .where(and(eq(favoriteListings.userId, userId), inArray(listings.status, ["active", "reserved"])))
    .orderBy(desc(favoriteListings.createdAt));

  return rows.map(withFavorite);
}

export async function incrementListingView(listingId: string) {
  await db
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, listingId));
}

export type ListingStats = {
  viewCount: number;
  favoriteCount: number;
};

export async function getListingStats(listingId: string): Promise<ListingStats> {
  const [row] = await db
    .select({
      viewCount: listings.viewCount,
      favoriteCount: sql<number>`(
        select count(*)::int
        from ${favoriteListings}
        where ${favoriteListings.listingId} = ${listings.id}
      )`,
    })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  return row ?? { viewCount: 0, favoriteCount: 0 };
}

export async function getSellerListingStats(sellerId: string): Promise<Record<string, ListingStats>> {
  const sellerListings = await db
    .select({
      id: listings.id,
      viewCount: listings.viewCount,
    })
    .from(listings)
    .where(eq(listings.sellerId, sellerId));

  const listingIds = sellerListings.map((listing) => listing.id);
  if (listingIds.length === 0) return {};

  const favoriteCounts = await db
    .select({
      listingId: favoriteListings.listingId,
      count: sql<number>`count(*)::int`,
    })
    .from(favoriteListings)
    .where(inArray(favoriteListings.listingId, listingIds))
    .groupBy(favoriteListings.listingId);

  const favoriteCountByListingId = new Map(
    favoriteCounts.map((row) => [row.listingId, row.count]),
  );

  return Object.fromEntries(
    sellerListings.map((listing) => [
      listing.id,
      {
        viewCount: listing.viewCount,
        favoriteCount: favoriteCountByListingId.get(listing.id) ?? 0,
      },
    ]),
  );
}
