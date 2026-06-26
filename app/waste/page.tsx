import WasteMapClient from "./_components/WasteMapClient";
import { getWasteLocations } from "./actions";

// This is a Server Component. It fetches data on the server side
// before rendering the client component, providing instant load times and SEO.
export default async function WasteMapPage() {
  const dbLocations = await getWasteLocations();

  // INJEKSI SEMENTARA: 20 Pin berdekatan untuk melihat Mapbox Collision Detection
  // Hapus ini nanti saat admin sudah mulai input data
  const dummyLocations: any[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `dummy-${i}`,
    type: i % 3 === 0 ? "vendor" : "tps",
    namaUsaha: `Pusat Daur Ulang ${i + 1} (Panjang Sekali)`,
    // Cluster sangat padat di tengah koordinat peta awal (-8.4095, 115.1889)
    latitude: -8.4095 + (Math.random() - 0.5) * 0.03,
    longitude: 115.1889 + (Math.random() - 0.5) * 0.03,
    isActive: true,
  }));

  const combinedLocations = [...dbLocations, ...dummyLocations];

  return <WasteMapClient initialLocations={combinedLocations} />;
}
