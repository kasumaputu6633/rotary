"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { wasteLocations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadWasteLocationImage } from "@/lib/r2";

/**
 * Fetches all active waste locations for the admin panel, sorted by latest created.
 */
export async function getWasteLocationsAdmin() {
  await requireRole("admin");
  return db
    .select()
    .from(wasteLocations)
    .where(eq(wasteLocations.isActive, true))
    .orderBy(desc(wasteLocations.createdAt));
}

/**
 * Creates a new waste location in the database.
 */
export async function createWasteLocationAction(formData: FormData) {
  await requireRole("admin");

  const type = formData.get("type") as "tps" | "vendor";
  const namaUsaha = formData.get("namaUsaha") as string;
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
  if (!latitudeStr) throw new Error("Latitude harus diisi.");
  if (!longitudeStr) throw new Error("Longitude harus diisi.");

  const latitude = parseFloat(latitudeStr);
  const longitude = parseFloat(longitudeStr);
  if (isNaN(latitude)) throw new Error("Latitude harus berupa angka.");
  if (isNaN(longitude)) throw new Error("Longitude harus berupa angka.");

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

  const type = formData.get("type") as "tps" | "vendor";
  const namaUsaha = formData.get("namaUsaha") as string;
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
  if (!latitudeStr) throw new Error("Latitude harus diisi.");
  if (!longitudeStr) throw new Error("Longitude harus diisi.");

  const latitude = parseFloat(latitudeStr);
  const longitude = parseFloat(longitudeStr);
  if (isNaN(latitude)) throw new Error("Latitude harus berupa angka.");
  if (isNaN(longitude)) throw new Error("Longitude harus berupa angka.");

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
