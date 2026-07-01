import WasteMapClient from "./_components/WasteMapClient";
import { getWasteLocations } from "./actions";
import Navbar from "../_components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { getSavedWasteLocationIds } from "@/lib/waste";

export const metadata = {
  title: "Lokasi Penampung Limbah | Rotary",
  description:
    "Cari lokasi penampung limbah berdasarkan nama tempat, alamat, dan jenis sampah yang diterima.",
};

// This is a Server Component. It fetches data on the server side
// before rendering the client component, providing instant load times and SEO.
export default async function WasteMapPage() {
  const [dbLocations, user] = await Promise.all([getWasteLocations(), getCurrentUser()]);
  const savedIds = user ? await getSavedWasteLocationIds(user.id) : [];

  return (
    <>
      <Navbar />
      <main className="bg-[#f5f7fb]">
        <WasteMapClient
          initialLocations={dbLocations}
          initialSavedIds={savedIds}
          isAuthenticated={Boolean(user)}
        />
      </main>
    </>
  );
}
