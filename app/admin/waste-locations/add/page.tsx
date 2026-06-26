import { requireRole } from "@/lib/auth";
import AddLocationClient from "./AddLocationClient";

export const metadata = {
    title: "Tambah Lokasi Vendor — Rotary Admin",
    description: "Tambahkan lokasi penampungan sampah baru ke platform Rotary.",
};

export default async function AddWasteLocationPage() {
    await requireRole("admin");

    return (
        <div className="mx-auto max-w-7xl">
            <AddLocationClient />
        </div>
    );
}
