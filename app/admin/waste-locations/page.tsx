import { requireRole } from "@/lib/auth";
import WasteLocationsClient from "./_components/WasteLocationsClient";
import { getWasteLocationsAdmin } from "./actions";

export const metadata = {
    title: "Waste Locations — Rotary Admin",
    description: "Kelola lokasi pembuangan sampah dan jenis sampah terintegrasi.",
};

export default async function AdminWasteLocationsPage() {
    await requireRole("admin");
    const initialLocations = await getWasteLocationsAdmin();

    return (
        <div className="mx-auto max-w-7xl">
            <WasteLocationsClient initialLocations={initialLocations} />
        </div>
    );
}


