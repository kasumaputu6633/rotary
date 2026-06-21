const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Geocode teks alamat → koordinat. Dipanggil server-side saat user tidak pakai autocomplete.
export async function geocodeLocationText(text: string): Promise<{ lat: number; lng: number } | null> {
  if (!TOKEN || !text.trim()) return null;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?country=id&language=id&limit=1&access_token=${TOKEN}`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24 jam — alamat yang sama hasilnya sama
    if (!res.ok) return null;

    const data = (await res.json()) as { features?: { center: [number, number] }[] };
    const center = data.features?.[0]?.center;
    if (!center) return null;

    const [lng, lat] = center;
    return { lat, lng };
  } catch {
    return null;
  }
}
