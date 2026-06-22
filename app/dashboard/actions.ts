"use server";

import { db } from "@/db";
import { favoriteListings, listingImages, listings, users } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth";
import type { ListingStatus } from "@/lib/listing-format";
import { createUniqueListingSlug } from "@/lib/listings";
import { deleteListingImage, deleteUserAvatar, uploadListingImage, uploadUserAvatar } from "@/lib/r2";
import { and, eq } from "drizzle-orm";
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

export async function createListingAction(formData: FormData) {
  const user = await requireRole("user");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const category = getString(formData, "category");
  const subcategory = getString(formData, "subcategory");
  const condition = getString(formData, "condition");
  const mode = getString(formData, "mode") === "donation" ? "donation" : "sale";
  const price = mode === "sale" ? getNumber(formData, "price") : null;
  const location = getString(formData, "location");
  const handoverOptions = getList(formData, "handoverOptions");
  const intent = getString(formData, "intent");
  const status = intent === "publish" ? "active" : "draft";
  let latitude = getFloat(formData, "latitude");
  let longitude = getFloat(formData, "longitude");

  if (!title || !category || !condition || !location) {
    throw new Error("Judul, kategori, kondisi, dan lokasi wajib diisi.");
  }

  // Kalau user tulis alamat manual (tidak pakai autocomplete), geocode otomatis
  if ((latitude === null || longitude === null) && location) {
    const coords = await geocodeLocationText(location);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lng;
    }
  }

  const slug = await createUniqueListingSlug(title);
  const now = new Date();
  const [listing] = await db
    .insert(listings)
    .values({
      sellerId: user.id,
      title,
      slug,
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
      status,
      publishedAt: status === "active" ? now : null,
      updatedAt: now,
    })
    .returning({ id: listings.id });

  const images = getImages(formData);
  for (const [index, image] of images.entries()) {
    const uploaded = await uploadListingImage(image, user.id);
    await db.insert(listingImages).values({
      listingId: listing.id,
      imageUrl: uploaded.imageUrl,
      objectKey: uploaded.objectKey,
      sortOrder: index,
    });
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  redirect(status === "active" ? "/dashboard/listings" : "/dashboard/listings/drafts");
}

export async function updateListingAction(listingId: string, formData: FormData) {
  const user = await requireRole("user");

  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { id: true, status: true, slug: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const category = getString(formData, "category");
  const subcategory = getString(formData, "subcategory");
  const condition = getString(formData, "condition");
  const mode = getString(formData, "mode") === "donation" ? "donation" : "sale";
  const price = mode === "sale" ? getNumber(formData, "price") : null;
  const location = getString(formData, "location");
  const handoverOptions = getList(formData, "handoverOptions");
  const intent = getString(formData, "intent");
  const deleteImageIds = getList(formData, "deleteImageIds");
  let latitude = getFloat(formData, "latitude");
  let longitude = getFloat(formData, "longitude");

  if (!title || !category || !condition || !location) {
    throw new Error("Judul, kategori, kondisi, dan lokasi wajib diisi.");
  }

  // Geocode otomatis kalau user tulis manual dan tidak ada koordinat dari autocomplete
  if ((latitude === null || longitude === null) && location) {
    const coords = await geocodeLocationText(location);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lng;
    }
  }

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
      status,
      updatedAt: now,
      ...(publishedAt ? { publishedAt } : {}),
    })
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

  // Hapus foto yang di-mark untuk dihapus
  if (deleteImageIds.length > 0) {
    const toDelete = await db
      .select({ id: listingImages.id, objectKey: listingImages.objectKey })
      .from(listingImages)
      .where(and(eq(listingImages.listingId, listingId)));

    const deletable = toDelete.filter((img) => deleteImageIds.includes(img.id));
    for (const img of deletable) {
      await deleteListingImage(img.objectKey);
      await db.delete(listingImages).where(eq(listingImages.id, img.id));
    }
  }

  // Upload foto baru — sort_order dimulai setelah existing yang tersisa
  const newImages = getImages(formData);
  if (newImages.length > 0) {
    const remainingCount = await db.$count(listingImages, eq(listingImages.listingId, listingId));
    for (const [index, image] of newImages.entries()) {
      const uploaded = await uploadListingImage(image, user.id);
      await db.insert(listingImages).values({
        listingId,
        imageUrl: uploaded.imageUrl,
        objectKey: uploaded.objectKey,
        sortOrder: remainingCount + index,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/listings/drafts");
  revalidatePath("/dashboard/listings/inactive");
  revalidatePath(`/products/${existing.slug}`);
  redirect(status === "active" ? "/dashboard/listings" : status === "inactive" ? "/dashboard/listings/inactive" : "/dashboard/listings/drafts");
}

export async function setListingStatusAction(listingId: string, status: ListingStatus) {
  const user = await requireRole("user");
  const now = new Date();
  await db
    .update(listings)
    .set({
      status,
      updatedAt: now,
      publishedAt: status === "active" ? now : undefined,
    })
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/listings/drafts");
  revalidatePath("/dashboard/listings/inactive");
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

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/listings/drafts");
  revalidatePath("/dashboard/listings/inactive");
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
