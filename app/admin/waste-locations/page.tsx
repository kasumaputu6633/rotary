import { requireRole } from "@/lib/auth";
import WasteLocationsClient from "./_components/WasteLocationsClient";

export const metadata = {
    title: "Waste Locations — Rotary Admin",
    description: "Kelola lokasi pembuangan sampah dan jenis sampah terintegrasi.",
};

export default async function AdminWasteLocationsPage() {
    await requireRole("admin");

    return (
        <div className="mx-auto max-w-7xl">
            <WasteLocationsClient />
        </div>
    );
}

