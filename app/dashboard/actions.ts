"use server";

import { db } from "@/db";
import { favoriteListings, listingImages, listings, users } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth";
import type { ListingMode, ListingStatus } from "@/lib/listing-format";
import { createUniqueListingSlug } from "@/lib/listings";
import { deleteListingImage, deleteUserAvatar, uploadListingImage, uploadUserAvatar } from "@/lib/r2";
import { and, eq, inArray } from "drizzle-orm";
import { geocodeLocationText } from "@/lib/mapbox";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const raw = getString(formData, key).replace(/[^\d]/g, "");
  if (!raw) return null;
  return Number(raw);
}

function getFloat(formData: FormData, key: string) {
  const raw = getString(formData, key);
  const val = parseFloat(raw);
  return isNaN(val) ? null : val;
}

function getList(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.trim() !== "");
}

function getImages(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, 4);
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

async function getListingFormValues(formData: FormData) {
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const category = getString(formData, "category");
  const subcategory = getString(formData, "subcategory");
  const condition = getString(formData, "condition");
  const mode: ListingMode = getString(formData, "mode") === "donation" ? "donation" : "sale";
  const price = mode === "sale" ? getNumber(formData, "price") : null;
  const location = getString(formData, "location");
  const handoverOptions = getList(formData, "handoverOptions");
  let latitude = getFloat(formData, "latitude");
  let longitude = getFloat(formData, "longitude");

  if (!title || !category || !condition || !location) {
    throw new Error("Judul, kategori, kondisi, dan lokasi wajib diisi.");
  }

  if ((latitude === null || longitude === null) && location) {
    const coords = await geocodeLocationText(location);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lng;
    }
  }

  return {
    title,
    description: description || null,
    category,
    subcategory: subcategory || null,
    condition,
    mode,
    price,
    location,
    latitude,
    longitude,
    handoverOptions,
  };
}

async function insertListingImages(listingId: string, userId: string, images: File[], startOrder = 0) {
  if (images.length === 0) return;

  const uploadedImages = await Promise.all(
    images.map(async (image, index) => {
      const uploaded = await uploadListingImage(image, userId);
      return {
        listingId,
        imageUrl: uploaded.imageUrl,
        objectKey: uploaded.objectKey,
        sortOrder: startOrder + index,
      };
    }),
  );

  await db.insert(listingImages).values(uploadedImages);
}

async function deleteListingImagesById(listingId: string, imageIds: string[]) {
  if (imageIds.length === 0) return;

  const images = await db
    .select({ id: listingImages.id, objectKey: listingImages.objectKey })
    .from(listingImages)
    .where(and(eq(listingImages.listingId, listingId), inArray(listingImages.id, imageIds)));

  if (images.length === 0) return;

  await Promise.all(images.map((image) => deleteListingImage(image.objectKey)));
  await db.delete(listingImages).where(inArray(listingImages.id, images.map((image) => image.id)));
}

function revalidateListingPaths(slug?: string) {
  [
    "/",
    "/products",
    "/dashboard",
    "/dashboard/listings",
    "/dashboard/listings/drafts",
    "/dashboard/listings/inactive",
  ].forEach((path) => revalidatePath(path));

  if (slug) revalidatePath(`/products/${slug}`);
}

function dashboardListingPath(status: ListingStatus) {
  if (status === "active") return "/dashboard/listings";
  if (status === "inactive") return "/dashboard/listings/inactive";
  return "/dashboard/listings/drafts";
}

export async function createListingAction(formData: FormData) {
  const user = await requireRole("user");
  const values = await getListingFormValues(formData);
  const intent = getString(formData, "intent");
  const status = intent === "publish" ? "active" : "draft";

  const slug = await createUniqueListingSlug(values.title);
  const now = new Date();
  const [listing] = await db
    .insert(listings)
    .values({
      sellerId: user.id,
      ...values,
      slug,
      status,
      publishedAt: status === "active" ? now : null,
      updatedAt: now,
    })
    .returning({ id: listings.id });

  const images = getImages(formData);
  await insertListingImages(listing.id, user.id, images);

  revalidateListingPaths(slug);
  redirect(dashboardListingPath(status));
}

export async function updateListingAction(listingId: string, formData: FormData) {
  const user = await requireRole("user");

  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { id: true, status: true, slug: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const values = await getListingFormValues(formData);
  const intent = getString(formData, "intent");
  const deleteImageIds = getList(formData, "deleteImageIds");

  let status = existing.status;
  let publishedAt: Date | undefined;
  const now = new Date();
  if (intent === "publish" && status !== "active") {
    status = "active";
    publishedAt = now;
  }

  await db
    .update(listings)
    .set({
      ...values,
      status,
      updatedAt: now,
      ...(publishedAt ? { publishedAt } : {}),
    })
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

  await deleteListingImagesById(listingId, deleteImageIds);

  const newImages = getImages(formData);
  if (newImages.length > 0) {
    const remainingCount = await db.$count(listingImages, eq(listingImages.listingId, listingId));
    await insertListingImages(listingId, user.id, newImages, remainingCount);
  }

  revalidateListingPaths(existing.slug);
  redirect(dashboardListingPath(status));
}

export async function setListingStatusAction(listingId: string, status: ListingStatus) {
  const user = await requireRole("user");
  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { slug: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const now = new Date();
  await db
    .update(listings)
    .set({
      status,
      updatedAt: now,
      ...(status === "active" ? { publishedAt: now } : {}),
    })
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

  revalidateListingPaths(existing.slug);
}

export async function deleteListingAction(listingId: string) {
  const user = await requireRole("user");

  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { id: true, slug: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const images = await db
    .select({ objectKey: listingImages.objectKey })
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId));

  for (const img of images) {
    await deleteListingImage(img.objectKey);
  }

  // cascade hapus listing_images & favorite_listings
  await db.delete(listings).where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

  revalidateListingPaths(existing.slug);
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireRole("user");
  const name = getString(formData, "name");
  const bio = getString(formData, "bio");
  const whatsapp = getString(formData, "whatsapp");
  const removeAvatar = getString(formData, "removeAvatar") === "1";
  const avatarFile = getOptionalFile(formData, "avatar");

  const currentProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { avatarObjectKey: true },
  });

  const uploadedAvatar = avatarFile ? await uploadUserAvatar(avatarFile, user.id) : null;
  const shouldClearAvatar = removeAvatar && !uploadedAvatar;

  await db
    .update(users)
    .set({
      name: name || null,
      bio: bio || null,
      whatsapp: whatsapp || null,
      ...(uploadedAvatar
        ? { avatarUrl: uploadedAvatar.imageUrl, avatarObjectKey: uploadedAvatar.objectKey }
        : shouldClearAvatar
          ? { avatarUrl: null, avatarObjectKey: null }
          : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  if ((uploadedAvatar || shouldClearAvatar) && currentProfile?.avatarObjectKey) {
    await deleteUserAvatar(currentProfile.avatarObjectKey);
  }

  const sellerListings = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(eq(listings.sellerId, user.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/products");
  sellerListings.forEach((listing) => revalidatePath(`/products/${listing.slug}`));
}

export async function toggleFavoriteListingAction(listingId: string, slug?: string) {
  const user = await requireAuth();
  const existing = await db.query.favoriteListings.findFirst({
    where: and(eq(favoriteListings.userId, user.id), eq(favoriteListings.listingId, listingId)),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(favoriteListings).where(eq(favoriteListings.id, existing.id));
  } else {
    await db
      .insert(favoriteListings)
      .values({ userId: user.id, listingId })
      .onConflictDoNothing();
  }

  revalidatePath("/");
  revalidatePath("/dashboard/favorites");
  if (slug) revalidatePath(`/products/${slug}`);
}
