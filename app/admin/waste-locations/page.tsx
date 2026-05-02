import { requireRole } from "@/lib/auth";

export default async function AdminWasteLocationsPage() {
  await requireRole("admin");
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-poppins text-3xl font-bold text-[#17458f] mb-2">Kelola Lokasi Sampah</h1>
      <p className="font-poppins text-gray-500 text-sm">Tambah, edit, dan aktif/nonaktif lokasi pembuangan sampah.</p>
      <div className="mt-10 p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center">
        <p className="font-poppins text-gray-400 text-base">CRUD lokasi sampah — coming soon</p>
      </div>
    </div>
  );
}
