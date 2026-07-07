"use server";

import { db } from "@/db";
import { conversations, listingDeals, listingImages, listings, users } from "@/db/schema";
import { requireRole, requireSellerReady } from "@/lib/auth";
import type { DealStage } from "@/lib/deal-format";
import type { ListingMode, ListingStatus } from "@/lib/listing-format";
import { createUniqueListingSlug } from "@/lib/listings";
import { notifyFavoriters } from "@/lib/notifications";
import { deleteListingImage, uploadListingImage } from "@/lib/r2";
import { and, desc, eq, inArray } from "drizzle-orm";
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

const DESCRIPTION_MAX_LENGTH = 2000;

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

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new Error(`Deskripsi maksimal ${DESCRIPTION_MAX_LENGTH} karakter.`);
  }

  if (mode === "sale" && (price === null || price <= 0)) {
    throw new Error("Harga wajib diisi untuk listing yang dijual.");
  }

  if (handoverOptions.length === 0) {
    throw new Error("Pilih minimal 1 opsi serah terima.");
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
    contactPreference: getString(formData, "contactPreference") === "whatsapp" ? "whatsapp" as const : "in_app" as const,
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
    "/dashboard/listings/reserved",
    "/dashboard/listings/completed",
    "/dashboard/listings/inactive",
    "/dashboard/deals",
  ].forEach((path) => revalidatePath(path));

  if (slug) revalidatePath(`/products/${slug}`);
}

function dashboardListingPath(status: ListingStatus) {
  if (status === "active") return "/dashboard/listings";
  if (status === "reserved") return "/dashboard/listings/reserved";
  if (status === "completed") return "/dashboard/listings/completed";
  if (status === "inactive") return "/dashboard/listings/inactive";
  return "/dashboard/listings/drafts";
}

export async function createListingAction(formData: FormData) {
  const user = await requireSellerReady();
  const values = {
    ...await getListingFormValues(formData),
    contactPreference: user.whatsappContactEnabled ? "whatsapp" as const : "in_app" as const,
  };
  const intent = getString(formData, "intent");
  const status = intent === "publish" ? "active" : "draft";

  const images = getImages(formData);
  if (images.length === 0) {
    throw new Error("Tambahkan minimal 1 foto barang.");
  }

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

  await insertListingImages(listing.id, user.id, images);

  revalidateListingPaths(slug);
  redirect(dashboardListingPath(status));
}

export async function updateListingAction(listingId: string, formData: FormData) {
  const user = await requireSellerReady();

  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { id: true, status: true, slug: true, price: true, title: true, mode: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const values = {
    ...await getListingFormValues(formData),
    contactPreference: user.whatsappContactEnabled ? "whatsapp" as const : "in_app" as const,
  };
  const intent = getString(formData, "intent");
  const deleteImageIds = getList(formData, "deleteImageIds");
  const newImages = getImages(formData);

  // Cek total foto setelah update: existing - yang dihapus + yang baru
  const existingCount = await db.$count(listingImages, eq(listingImages.listingId, listingId));
  const remainingAfterDelete = existingCount - deleteImageIds.length;
  if (remainingAfterDelete + newImages.length < 1) {
    throw new Error("Listing harus memiliki minimal 1 foto.");
  }

  let status = existing.status;
  let publishedAt: Date | undefined;
  const now = new Date();
  if (intent === "publish" && (status === "draft" || status === "inactive")) {
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

  if (newImages.length > 0) {
    const remainingCount = await db.$count(listingImages, eq(listingImages.listingId, listingId));
    await insertListingImages(listingId, user.id, newImages, remainingCount);
  }

  // Beri tahu favoriter jika harga turun — alasan utama orang memfavoritkan
  // barang. Hanya untuk listing jual yang tetap tampil publik (active/reserved).
  if (
    existing.mode === "sale" &&
    values.mode === "sale" &&
    typeof existing.price === "number" &&
    typeof values.price === "number" &&
    values.price < existing.price &&
    (status === "active" || status === "reserved")
  ) {
    const oldPrice = existing.price.toLocaleString("id-ID");
    const newPrice = values.price.toLocaleString("id-ID");
    await notifyFavoriters(
      listingId,
      () => ({
        type: "favorite_price_drop",
        title: "Harga barang favoritmu turun",
        body: `"${existing.title}" kini Rp${newPrice} (sebelumnya Rp${oldPrice}).`,
        href: `/products/${existing.slug}`,
      }),
      user.id,
    );
  }

  revalidateListingPaths(existing.slug);
  redirect(dashboardListingPath(status));
}

export async function setListingStatusAction(listingId: string, status: ListingStatus) {
  const user = await requireSellerReady();
  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { slug: true, status: true, title: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const allowedTransitions: Record<ListingStatus, ListingStatus[]> = {
    draft: ["active"],
    active: ["reserved", "inactive"],
    reserved: ["active", "completed"],
    completed: ["active"],
    inactive: ["active"],
    blocked: [],
  };

  if (!allowedTransitions[existing.status].includes(status)) {
    throw new Error("Perubahan status listing tidak diizinkan.");
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(listings)
      .set({
        status,
        updatedAt: now,
        ...(status === "active"
          ? { publishedAt: now, reservedAt: null, completedAt: null }
          : status === "reserved"
            ? { reservedAt: now, completedAt: null }
            : status === "completed"
              ? { completedAt: now }
              : {}),
      })
      .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

    if (status === "reserved") {
      await tx.insert(listingDeals).values({
        listingId,
        sellerId: user.id,
        status: "active",
        stage: "negotiating",
        createdAt: now,
        updatedAt: now,
      });
    }

    if (existing.status === "reserved" && status === "active") {
      const [activeDeal] = await tx
        .select({ id: listingDeals.id })
        .from(listingDeals)
        .where(and(
          eq(listingDeals.listingId, listingId),
          eq(listingDeals.sellerId, user.id),
          eq(listingDeals.status, "active"),
        ))
        .orderBy(desc(listingDeals.createdAt))
        .limit(1);

      if (activeDeal) {
        await tx
          .update(listingDeals)
          .set({ status: "cancelled", cancelledAt: now, updatedAt: now })
          .where(eq(listingDeals.id, activeDeal.id));
      }
    }

    if (status === "completed") {
      const [activeDeal] = await tx
        .select({ id: listingDeals.id })
        .from(listingDeals)
        .where(and(
          eq(listingDeals.listingId, listingId),
          eq(listingDeals.sellerId, user.id),
          eq(listingDeals.status, "active"),
        ))
        .orderBy(desc(listingDeals.createdAt))
        .limit(1);

      if (activeDeal) {
        await tx
          .update(listingDeals)
          .set({ status: "completed", completedAt: now, updatedAt: now })
          .where(eq(listingDeals.id, activeDeal.id));
      }
    }
  });

  // Beri tahu user yang memfavoritkan barang ini saat statusnya berpindah ke
  // dipesan/terjual — barang unik (umumnya 1 unit), jadi ini info yang menentukan.
  if (status === "reserved") {
    await notifyFavoriters(
      listingId,
      () => ({
        type: "favorite_reserved",
        title: "Barang favoritmu sedang dipesan",
        body: `"${existing.title}" sedang dalam proses kesepakatan. Barang bisa tersedia lagi jika deal batal.`,
        href: `/products/${existing.slug}`,
      }),
      user.id,
    );
  } else if (status === "completed") {
    await notifyFavoriters(
      listingId,
      () => ({
        type: "favorite_sold",
        title: "Barang favoritmu sudah terjual",
        body: `"${existing.title}" telah selesai diserahterimakan. Cari barang serupa lainnya di marketplace.`,
        href: `/products/${existing.slug}`,
      }),
      user.id,
    );
  }

  revalidateListingPaths(existing.slug);
}

function parseScheduledAt(value: string) {
  if (!value) return null;
  const parsed = new Date(`${value}:00+08:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function updateListingDealAction(listingId: string, formData: FormData) {
  const user = await requireSellerReady();
  const stageValue = getString(formData, "stage");
  const stage: DealStage =
    stageValue === "agreed" || stageValue === "handover_scheduled"
      ? stageValue
      : "negotiating";
  const counterpartyName = getString(formData, "counterpartyName").slice(0, 120);
  const counterpartyContact = getString(formData, "counterpartyContact").slice(0, 80);
  const handoverMethod = getString(formData, "handoverMethod").slice(0, 80);
  const handoverLocation = getString(formData, "handoverLocation");
  const sellerNote = getString(formData, "sellerNote");
  const scheduledAt = parseScheduledAt(getString(formData, "scheduledAt"));
  const buyerIdRaw = getString(formData, "buyerId");

  const [deal] = await db
    .select({
      id: listingDeals.id,
      mode: listings.mode,
      slug: listings.slug,
      status: listingDeals.status,
    })
    .from(listingDeals)
    .innerJoin(listings, eq(listings.id, listingDeals.listingId))
    .where(and(
      eq(listingDeals.listingId, listingId),
      eq(listingDeals.sellerId, user.id),
      eq(listingDeals.status, "active"),
    ))
    .orderBy(desc(listingDeals.createdAt))
    .limit(1);

  if (!deal) {
    throw new Error("Kesepakatan aktif tidak ditemukan.");
  }

  if (stage === "handover_scheduled" && (!scheduledAt || !handoverMethod)) {
    throw new Error("Cara dan jadwal serah terima wajib diisi.");
  }

  const agreedPrice = deal.mode === "sale" ? getNumber(formData, "agreedPrice") : null;
  const now = new Date();

  // Validasi buyerId: hanya boleh user yang benar-benar punya sesi chat dengan
  // penjual. Kalau tidak valid (tampering/stale), lepaskan tautan — deal tetap
  // tersimpan dengan counterparty teks bebas sebagai fallback.
  let buyerId: string | null = null;
  if (buyerIdRaw) {
    const [contact] = await db
      .select({ buyerId: conversations.buyerId })
      .from(conversations)
      .where(and(
        eq(conversations.sellerId, user.id),
        eq(conversations.buyerId, buyerIdRaw),
      ))
      .limit(1);
    buyerId = contact?.buyerId ?? null;
  }

  await db
    .update(listingDeals)
    .set({
      stage,
      buyerId,
      counterpartyName: counterpartyName || null,
      counterpartyContact: counterpartyContact || null,
      agreedPrice,
      handoverMethod: handoverMethod || null,
      handoverLocation: handoverLocation || null,
      scheduledAt,
      sellerNote: sellerNote || null,
      updatedAt: now,
    })
    .where(and(eq(listingDeals.id, deal.id), eq(listingDeals.sellerId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard/listings/reserved");
  revalidatePath(`/dashboard/deals/${deal.id}`);
  revalidatePath(`/products/${deal.slug}`);
}

export async function deleteListingAction(listingId: string) {
  const user = await requireSellerReady();

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
  const shopName = getString(formData, "shopName").slice(0, 80);
  const bio = getString(formData, "bio").slice(0, 280);
  const whatsappContactEnabled = formData.get("whatsappContactEnabled") === "on";

  if (shopName.length < 2) {
    throw new Error("Nama lapak minimal 2 karakter.");
  }
  if (whatsappContactEnabled && (!user.phone || !user.phoneVerifiedAt)) {
    throw new Error("Verifikasi nomor HP terlebih dahulu untuk mengaktifkan kontak WhatsApp.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        shopName: shopName || null,
        bio: bio || null,
        whatsappContactEnabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await tx
      .update(listings)
      .set({
        contactPreference: whatsappContactEnabled ? "whatsapp" : "in_app",
      })
      .where(eq(listings.sellerId, user.id));
  });

  const sellerListings = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(eq(listings.sellerId, user.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");
  revalidatePath("/account", "layout");
  revalidatePath("/");
  revalidatePath("/products");
  sellerListings.forEach((listing) => revalidatePath(`/products/${listing.slug}`));
}

export async function renewListingAction(listingId: string) {
  const user = await requireSellerReady();
  const existing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    columns: { id: true, slug: true },
  });
  if (!existing) throw new Error("Listing tidak ditemukan.");

  const now = new Date();
  await db
    .update(listings)
    .set({
      updatedAt: now,
      verificationSentAt: null,
    })
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath(`/products/${existing.slug}`);
  return { success: true, message: "Listing berhasil diperpanjang." };
}
