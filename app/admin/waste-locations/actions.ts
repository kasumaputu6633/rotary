"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { wasteLocations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadWasteLocationImage } from "@/lib/r2";
import { geocodeLocationText } from "@/lib/mapbox";
import { assertSafeText } from "@/lib/sanitize";

/**
 * Fetches all active waste locations for the admin panel, sorted by last modified.
 */
export async function getWasteLocationsAdmin() {
  await requireRole("admin");
  return db
    .select()
    .from(wasteLocations)
    .where(eq(wasteLocations.isActive, true))
    .orderBy(desc(wasteLocations.updatedAt));
}

/**
 * Creates a new waste location in the database.
 */
export async function createWasteLocationAction(formData: FormData) {
  await requireRole("admin");

  const type = formData.get("type") as string;
  const namaUsaha = formData.get("namaUsaha") as string;
  const namaPic = formData.get("namaPic") as string;
  const emailKontak = formData.get("emailKontak") as string;
  const teleponKontak = formData.get("teleponKontak") as string;
  const alamat = formData.get("alamat") as string;
  const website = formData.get("website") as string;
  const latitudeStr = formData.get("latitude") as string;
  const longitudeStr = formData.get("longitude") as string;

  const jenisSampahRaw = formData.get("jenisSampahDiterima") as string;
  const operatingHoursRaw = formData.get("operatingHours") as string;
  const imageFile = formData.get("image") as File | null;

  // Validate required fields
  if (!namaUsaha?.trim()) throw new Error("Nama lokasi harus diisi.");
  if (!type) throw new Error("Tipe lokasi harus diisi.");
  if (!teleponKontak?.trim()) throw new Error("Kontak harus diisi.");
  if (!alamat?.trim()) throw new Error("Alamat harus diisi.");

  // Sanitasi karakter aneh
  assertSafeText(namaUsaha.trim(), "Nama lokasi", { minLen: 2, maxLen: 120 });
  if (namaPic?.trim()) assertSafeText(namaPic.trim(), "Nama PIC", { minLen: 2, maxLen: 80 });
  assertSafeText(alamat.trim(), "Alamat", { narrative: true, minLen: 5 });

  // Koordinat opsional: terisi otomatis dari pencarian alamat di client,
  // atau di-geocode dari alamat di server bila tidak diisi.
  let latitude: number | null = latitudeStr?.trim() ? parseFloat(latitudeStr) : null;
  let longitude: number | null = longitudeStr?.trim() ? parseFloat(longitudeStr) : null;
  if (latitude !== null && isNaN(latitude)) throw new Error("Latitude harus berupa angka.");
  if (longitude !== null && isNaN(longitude)) throw new Error("Longitude harus berupa angka.");

  if ((latitude === null || longitude === null) && alamat) {
    const coords = await geocodeLocationText(alamat);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lng;
    }
  }

  const jenisSampahDiterima = jenisSampahRaw ? JSON.parse(jenisSampahRaw) : [];
  if (!jenisSampahDiterima.length) throw new Error("Pilih minimal satu jenis sampah.");

  const operatingHours = operatingHoursRaw ? JSON.parse(operatingHoursRaw) : null;
  if (!operatingHours) throw new Error("Jam operasional harus diisi.");

  // Upload image to R2
  let imageUrl = "";
  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadWasteLocationImage(imageFile);
    imageUrl = uploadResult.imageUrl;
  } else {
    throw new Error("Gambar lokasi harus diunggah.");
  }

  await db.insert(wasteLocations).values({
    type,
    namaUsaha,
    namaPic: namaPic || null,
    emailKontak: emailKontak || null,
    teleponKontak,
    alamat,
    website: website || null,
    latitude,
    longitude,
    jenisSampahDiterima,
    operatingHours,
    imageUrl,
    isActive: true,
  });

  revalidatePath("/admin/waste-locations");
  revalidatePath("/waste");
}

/**
 * Updates an existing waste location in the database.
 */
export async function updateWasteLocationAction(id: string, formData: FormData) {
  await requireRole("admin");

  const type = formData.get("type") as string;
  const namaUsaha = formData.get("namaUsaha") as string;
  const namaPic = formData.get("namaPic") as string;
  const emailKontak = formData.get("emailKontak") as string;
  const teleponKontak = formData.get("teleponKontak") as string;
  const alamat = formData.get("alamat") as string;
  const website = formData.get("website") as string;
  const latitudeStr = formData.get("latitude") as string;
  const longitudeStr = formData.get("longitude") as string;

  const jenisSampahRaw = formData.get("jenisSampahDiterima") as string;
  const operatingHoursRaw = formData.get("operatingHours") as string;

  const imageFile = formData.get("image") as File | null;
  const currentImageUrl = formData.get("currentImageUrl") as string;

  // Validate required fields
  if (!namaUsaha?.trim()) throw new Error("Nama lokasi harus diisi.");
  if (!type) throw new Error("Tipe lokasi harus diisi.");
  if (!teleponKontak?.trim()) throw new Error("Kontak harus diisi.");
  if (!alamat?.trim()) throw new Error("Alamat harus diisi.");

  // Sanitasi karakter aneh
  assertSafeText(namaUsaha.trim(), "Nama lokasi", { minLen: 2, maxLen: 120 });
  if (namaPic?.trim()) assertSafeText(namaPic.trim(), "Nama PIC", { minLen: 2, maxLen: 80 });
  assertSafeText(alamat.trim(), "Alamat", { narrative: true, minLen: 5 });

  // Koordinat opsional: terisi otomatis dari pencarian alamat di client,
  // atau di-geocode dari alamat di server bila tidak diisi.
  let latitude: number | null = latitudeStr?.trim() ? parseFloat(latitudeStr) : null;
  let longitude: number | null = longitudeStr?.trim() ? parseFloat(longitudeStr) : null;
  if (latitude !== null && isNaN(latitude)) throw new Error("Latitude harus berupa angka.");
  if (longitude !== null && isNaN(longitude)) throw new Error("Longitude harus berupa angka.");

  if ((latitude === null || longitude === null) && alamat) {
    const coords = await geocodeLocationText(alamat);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lng;
    }
  }

  const jenisSampahDiterima = jenisSampahRaw ? JSON.parse(jenisSampahRaw) : [];
  if (!jenisSampahDiterima.length) throw new Error("Pilih minimal satu jenis sampah.");

  const operatingHours = operatingHoursRaw ? JSON.parse(operatingHoursRaw) : null;
  if (!operatingHours) throw new Error("Jam operasional harus diisi.");

  let imageUrl = currentImageUrl || "";
  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadWasteLocationImage(imageFile);
    imageUrl = uploadResult.imageUrl;
  }

  if (!imageUrl) {
    throw new Error("Gambar lokasi harus diunggah.");
  }

  await db
    .update(wasteLocations)
    .set({
      type,
      namaUsaha,
      namaPic: namaPic || null,
      emailKontak: emailKontak || null,
      teleponKontak,
      alamat,
      website: website || null,
      latitude,
      longitude,
      jenisSampahDiterima,
      operatingHours,
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(wasteLocations.id, id));

  revalidatePath("/admin/waste-locations");
  revalidatePath("/waste");
}

/**
 * Hard-deletes a waste location from the database.
 */
export async function deleteWasteLocationAction(id: string) {
  await requireRole("admin");
  await db.delete(wasteLocations).where(eq(wasteLocations.id, id));
  revalidatePath("/admin/waste-locations");
  revalidatePath("/waste");
}
