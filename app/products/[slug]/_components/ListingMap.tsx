import Image from "next/image";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const ZOOM = 13;

type Props = {
  latitude: number;
  longitude: number;
  locationLabel?: string;
};

export function ListingMap({ latitude, longitude, locationLabel }: Props) {
  if (!TOKEN) return null;

  const staticUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+17458f(${longitude},${latitude})/${longitude},${latitude},${ZOOM},0,0/400x240@2x?access_token=${TOKEN}`;

  return (
    <div className="relative h-30 overflow-hidden rounded-lg border border-[#cbd5e1]">
      <Image
        src={staticUrl}
        alt={`Peta lokasi sekitar ${locationLabel ?? ""}`}
        fill
        className="object-cover"
        unoptimized
      />
      {/* Lingkaran perkiraan akurasi */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-14 w-14 rounded-full border-2 border-[#17458f]/50 bg-[#17458f]/10" />
      </div>
    </div>
  );
}
