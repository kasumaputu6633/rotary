export default function WastePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-poppins text-3xl font-bold text-[#17458f] mb-2">Tempat Buang Sampah</h1>
      <p className="font-poppins text-gray-500 text-sm">
        Informasi lokasi tempat pembuangan dan pengolah sampah terdekat.
      </p>
      <div className="mt-10 p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center">
        <p className="font-poppins text-gray-400 text-base">Daftar lokasi pembuangan sampah — coming soon</p>
        <p className="font-poppins text-gray-300 text-xs mt-2">Data lokasi dikelola oleh admin.</p>
      </div>
    </div>
  );
}
