"use server";

import { db } from "@/db";
import { favoriteListings, listings, users } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth";
import { deleteUserAvatar, uploadUserAvatar } from "@/lib/r2";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function updateAccountProfileAction(formData: FormData) {
  const user = await requireRole("user");
  const fullNameValue = formData.get("fullName");
  const normalizedName = typeof fullNameValue === "string"
    ? fullNameValue.trim().slice(0, 120)
    : "";
  const removeAvatar = formData.get("removeAvatar") === "1";
  const avatarFile = getOptionalFile(formData, "avatar");

  if (normalizedName.length < 2) {
    throw new Error("Nama lengkap minimal 2 karakter.");
  }

  const uploadedAvatar = avatarFile ? await uploadUserAvatar(avatarFile, user.id) : null;
  const shouldClearAvatar = removeAvatar && !uploadedAvatar;

  await db
    .update(users)
    .set({
      fullName: normalizedName,
      ...(uploadedAvatar
        ? { avatarUrl: uploadedAvatar.imageUrl, avatarObjectKey: uploadedAvatar.objectKey }
        : shouldClearAvatar
          ? { avatarUrl: null, avatarObjectKey: null }
          : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  if ((uploadedAvatar || shouldClearAvatar) && user.avatarObjectKey) {
    await deleteUserAvatar(user.avatarObjectKey);
  }

  const sellerListings = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(eq(listings.sellerId, user.id));

  revalidatePath("/account/settings");
  revalidatePath("/account", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");
  revalidatePath("/");
  revalidatePath("/products");
  sellerListings.forEach((listing) => revalidatePath(`/products/${listing.slug}`));
}

export async function toggleFavoriteListingAction(listingId: string, slug?: string) {
  const user = await requireAuth();
  const existing = await db.query.favoriteListings.findFirst({
    where: and(
      eq(favoriteListings.userId, user.id),
      eq(favoriteListings.listingId, listingId),
    ),
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
  revalidatePath("/products");
  revalidatePath("/account/favorites");
  if (slug) revalidatePath(`/products/${slug}`);
}
