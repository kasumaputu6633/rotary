import WasteMapClient from "./_components/WasteMapClient";
import { getWasteLocations } from "./actions";

// This is a Server Component. It fetches data on the server side
// before rendering the client component, providing instant load times and SEO.
export default async function WasteMapPage() {
  const dbLocations = await getWasteLocations();

  // INJEKSI SEMENTARA: 3 Pin berdekatan untuk melihat Mapbox Collision Detection & Supercluster
  // Hapus ini nanti saat admin sudah mulai input data asli
  const dummyLocations: any[] = Array.from({ length: 3 }).map((_, i) => ({
    id: `dummy-${i}`,
    type: i % 2 === 0 ? "vendor" : "tps",
    namaUsaha: `Pusat Daur Ulang ${i + 1}`,
    latitude: -8.4095 + (Math.random() - 0.5) * 0.03,
    longitude: 115.1889 + (Math.random() - 0.5) * 0.03,
    isActive: true,
  }));

  // INJEKSI KHUSUS: Menguji komponen UI Jam Operasional JSONB
  const dummyTester = {
    id: "dummy-tester",
    type: "vendor",
    namaUsaha: "Test 1",
    latitude: -8.4110,
    longitude: 115.1880,
    isActive: true,
    alamat: "Jl. Batanta",
    teleponKontak: "08123456789",
    emailKontak: "tester@rotary.id",
    website: "https://rotary.id",
    operatingHours: {
      monday: { open: "08:00", close: "17:00", isClosed: false },
      tuesday: { open: "08:00", close: "17:00", isClosed: false },
      wednesday: { open: "08:00", close: "17:00", isClosed: false },
      thursday: { open: "08:00", close: "17:00", isClosed: false },
      friday: { open: "08:00", close: "17:00", isClosed: false },
      saturday: { open: "08:00", close: "15:00", isClosed: false },
      sunday: { isClosed: true }
    }
  };

  const combinedLocations = [dummyTester, ...dbLocations, ...dummyLocations];

  return <WasteMapClient initialLocations={combinedLocations} />;
}
