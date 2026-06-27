"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import MapContainer from "./MapContainer";
import type { WasteLocation } from "../actions";

interface WasteMapClientProps {
  initialLocations: WasteLocation[];
}

const DEFAULT_MATERIALS = [
  "Semua",
  "Plastik",
  "Kertas",
  "Logam",
  "Tekstil",
  "Elektronik",
  "Baterai",
  "Kaca",
  "Residu",
  "Organik",
];

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function formatMaterialName(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getMaterialStyles(material: string) {
  const key = normalizeText(material);

  if (key.includes("plastik")) return "border-[#bfd2ef] bg-[#dbe8fb] text-[#17458f]";
  if (key.includes("kertas")) return "border-[#abe6dd] bg-[#d8f6f1] text-[#087568]";
  if (key.includes("logam") || key.includes("kaleng")) return "border-[#f1d79e] bg-[#fff1cf] text-[#986a12]";
  if (key.includes("kaca") || key.includes("botol")) return "border-[#b9e9f7] bg-[#ddf7ff] text-[#087093]";
  if (key.includes("residu")) return "border-[#f4b5b9] bg-[#ffe0e3] text-[#be343d]";
  if (key.includes("organik")) return "border-[#bddfbf] bg-[#e5f6e6] text-[#247839]";
  if (key.includes("baterai") || key.includes("elektronik")) return "border-[#d8d1fb] bg-[#eeeaff] text-[#5543a9]";
  if (key.includes("tekstil") || key.includes("kain")) return "border-[#ffd0a8] bg-[#fff0e2] text-[#a15b12]";

  return "border-gray-200 bg-gray-100 text-gray-600";
}

function getLocationTypeLabel(type: WasteLocation["type"]) {
  return type === "vendor" ? "Partner Penampung" : "Tempat Penampung";
}

function hasMapCoordinate(location: WasteLocation) {
  return typeof location.latitude === "number" && typeof location.longitude === "number";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatOperatingHours(hours: unknown) {
  if (!hours || typeof hours !== "object") return "Jam operasional belum tersedia";

  const schedules: Record<string, string[]> = {};
  const source = hours as Record<string, { isClosed?: boolean; open?: string; close?: string }>;

  DAY_KEYS.forEach((key, index) => {
    const schedule = source[key];
    const time =
      schedule && !schedule.isClosed && schedule.open && schedule.close
        ? `${schedule.open} - ${schedule.close}`
        : "Tutup";

    schedules[time] = [...(schedules[time] ?? []), DAY_NAMES[index]];
  });

  const parts = Object.entries(schedules)
    .map(([time, days]) => {
      if (time === "Tutup") return null;
      if (days.length === 7) return `Setiap hari ${time}`;
      if (days.length === 5 && days[0] === "Senin" && days[4] === "Jumat") {
        return `Senin - Jumat ${time}`;
      }
      return `${days[0]}${days.length > 1 ? ` - ${days[days.length - 1]}` : ""} ${time}`;
    })
    .filter(Boolean);

  return parts[0] ?? "Tutup sementara";
}

function buildDirectionsUrl(location: WasteLocation) {
  const destination =
    location.latitude && location.longitude
      ? `${location.latitude},${location.longitude}`
      : `${location.namaUsaha} ${location.alamat ?? ""}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function buildWhatsAppUrl(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function LocationImage({ location, className }: { location: WasteLocation; className: string }) {
  if (location.imageUrl) {
    return (
      <div
        role="img"
        aria-label={location.namaUsaha}
        className={`${className} bg-[#edf3fb] bg-cover bg-center`}
        style={{ backgroundImage: `url("${location.imageUrl}")` }}
      />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-[#edf3fb] text-[#17458f]`}>
      <span className="font-open-sauce text-lg font-bold">{getInitials(location.namaUsaha) || "R"}</span>
    </div>
  );
}

function MaterialBadges({ materials, limit = 4 }: { materials?: string[] | null; limit?: number }) {
  const visibleMaterials = (materials ?? []).slice(0, limit);
  const remainingCount = Math.max((materials?.length ?? 0) - visibleMaterials.length, 0);

  if (!visibleMaterials.length) {
    return (
      <span className="inline-flex rounded-md border border-[#d8deea] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#5f6370]">
        Material belum diisi
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleMaterials.map((material) => (
        <span
          key={material}
          className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getMaterialStyles(material)}`}
        >
          {formatMaterialName(material)}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex rounded-md border border-[#d8deea] bg-[#eef2f7] px-2.5 py-1 text-[11px] font-bold text-[#4b5563]">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

function LocationListCard({
  location,
  isActive,
  onSelect,
}: {
  location: WasteLocation;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(location.id)}
      aria-pressed={isActive}
      className={`grid w-full grid-cols-[86px_minmax(0,1fr)] gap-3 rounded-lg border bg-white p-3 text-left transition duration-200 hover:border-[#9eb8df] hover:bg-[#fbfdff] hover:shadow-[0_8px_12px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${
        isActive ? "border-[#17458f] bg-[#f7fbff]" : "border-[#d8deea]"
      }`}
    >
      <LocationImage
        location={location}
        className="h-[86px] w-[86px] shrink-0 overflow-hidden rounded-lg border border-[#d8deea]"
      />

      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-md bg-[#e8f0fb] px-2 py-1 font-open-sauce text-[10px] font-semibold text-[#17458f]">
            {getLocationTypeLabel(location.type)}
          </span>
          {hasMapCoordinate(location) && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#fff3d8] text-[#986a12]">
              <Icon icon="lucide:map-pin" width={13} height={13} aria-hidden="true" />
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 font-open-sauce text-[15px] font-semibold leading-snug text-[#171717]">
          {location.namaUsaha}
        </h3>
        <p className="mt-1 line-clamp-2 font-open-sauce text-[12px] leading-relaxed text-[#5f6370]">
          {location.alamat || "Alamat belum tersedia"}
        </p>
        <div className="mt-3">
          <MaterialBadges materials={location.jenisSampahDiterima} />
        </div>
      </div>
    </button>
  );
}

function LocationDetailCard({
  location,
  isSaved,
  shareNotice,
  canRecenter,
  onClose,
  onRecenter,
  onShare,
  onToggleSave,
}: {
  location: WasteLocation;
  isSaved: boolean;
  shareNotice: string | null;
  canRecenter: boolean;
  onClose: () => void;
  onRecenter: () => void;
  onShare: () => void;
  onToggleSave: () => void;
}) {
  return (
    <aside
      aria-label="Detail lokasi penampung"
      className="absolute inset-x-3 bottom-3 z-20 rounded-xl bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.18)] md:inset-x-8 md:bottom-6 md:p-5"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#5f6370] transition hover:bg-[#f2f5f9] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
        aria-label="Tutup detail lokasi"
      >
        <Icon icon="lucide:x" width={20} height={20} />
      </button>

      <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)_280px] lg:grid-cols-[260px_minmax(0,1fr)_300px] md:items-start">
        <LocationImage
          location={location}
          className="hidden h-[154px] w-full overflow-hidden rounded-lg border border-[#d8deea] md:block"
        />

        <div className="min-w-0 pr-10 md:pr-0">
          <p className="mb-2 flex items-center gap-2 font-open-sauce text-xs font-semibold text-[#17458f]">
            <Icon icon="lucide:map-pin" width={15} height={15} className="text-[#f7a81b]" />
            {getLocationTypeLabel(location.type)}
          </p>
          <h2 className="font-open-sauce text-[22px] font-semibold leading-tight text-[#171717] md:text-[24px]">
            {location.namaUsaha}
          </h2>

          <div className="mt-4 grid gap-3 font-open-sauce text-[13px] text-[#4b5563]">
            <div>
              <p className="font-semibold text-[#171717]">Jam Operasional</p>
              <p className="mt-1 flex items-center gap-2">
                <Icon icon="lucide:clock-3" width={16} height={16} className="text-[#17458f]" />
                {formatOperatingHours(location.operatingHours)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#171717]">Alamat</p>
              <p className="mt-1 flex items-start gap-2 leading-relaxed">
                <Icon icon="lucide:map-pin" width={16} height={16} className="mt-0.5 text-[#17458f]" />
                <span>{location.alamat || "Alamat belum tersedia"}</span>
              </p>
            </div>
            {location.teleponKontak && (
              <div>
                <p className="font-semibold text-[#171717]">Kontak</p>
                <a
                  href={buildWhatsAppUrl(location.teleponKontak)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-[#4b5563] transition hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
                >
                  <Icon icon="lucide:phone" width={16} height={16} />
                  {location.teleponKontak}
                  <Icon icon="mdi:whatsapp" width={18} height={18} className="text-[#25d366]" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-5">
          <div>
            <p className="mb-3 font-open-sauce text-[13px] font-semibold text-[#171717]">Sampah yang diterima</p>
            <MaterialBadges materials={location.jenisSampahDiterima} limit={8} />
          </div>

          <div className="space-y-2">
            {shareNotice && (
              <p className="font-open-sauce text-xs font-semibold text-[#247839]">{shareNotice}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={buildDirectionsUrl(location)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#17458f] px-3 font-open-sauce text-[13px] font-semibold text-white transition hover:bg-[#123a79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px"
              >
                <Icon icon="lucide:navigation" width={16} height={16} />
                Petunjuk arah
              </a>
              <button
                type="button"
                onClick={onRecenter}
                disabled={!canRecenter}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#c5cbd6] bg-[#f8fafc] px-3 font-open-sauce text-[13px] font-semibold text-[#17458f] transition hover:border-[#9eb8df] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:border-[#d8deea] disabled:text-[#9aa3b2]"
              >
                <Icon icon="lucide:crosshair" width={16} height={16} />
                Pusatkan
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-2">
              <button
                type="button"
                onClick={onToggleSave}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d8deea] bg-white px-3 font-open-sauce text-[13px] font-semibold text-[#5f6370] transition hover:border-[#f7a81b] hover:bg-[#fffaf0] hover:text-[#986a12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px"
              >
                <Icon icon={isSaved ? "lucide:bookmark-check" : "lucide:bookmark"} width={16} height={16} />
                {isSaved ? "Disimpan" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={onShare}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d8deea] bg-white text-[#5f6370] transition hover:border-[#17458f] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px"
                aria-label="Bagikan lokasi"
              >
                <Icon icon="lucide:share-2" width={17} height={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function WasteMapClient({ initialLocations }: WasteMapClientProps) {
  const [query, setQuery] = useState("");
  const [activeMaterial, setActiveMaterial] = useState("Semua");
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [recenterRequestKey, setRecenterRequestKey] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = window.localStorage.getItem("rotary-saved-waste-locations");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem("rotary-saved-waste-locations", JSON.stringify(savedIds));
  }, [savedIds]);

  const materialOptions = useMemo(() => {
    const materialSet = new Set(DEFAULT_MATERIALS);
    initialLocations.forEach((location) => {
      location.jenisSampahDiterima?.forEach((material) => {
        if (material?.trim()) materialSet.add(formatMaterialName(material));
      });
    });

    return Array.from(materialSet);
  }, [initialLocations]);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const normalizedMaterial = normalizeText(activeMaterial);

    return initialLocations.filter((location) => {
      const materials = location.jenisSampahDiterima ?? [];
      const haystack = [
        location.namaUsaha,
        location.alamat,
        location.namaPic,
        location.emailKontak,
        location.teleponKontak,
        ...materials,
      ]
        .map(normalizeText)
        .join(" ");

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesMaterial =
        normalizedMaterial === "semua" ||
        materials.some((material) => normalizeText(material).includes(normalizedMaterial));

      return matchesQuery && matchesMaterial;
    });
  }, [activeMaterial, initialLocations, query]);

  const activeLocation = activeLocationId
    ? filteredLocations.find((location) => location.id === activeLocationId) ?? null
    : null;

  const toggleSaved = (locationId: string) => {
    setSavedIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId],
    );
  };

  const handleShare = async (location: WasteLocation) => {
    const shareUrl = buildDirectionsUrl(location);
    const shareText = `${location.namaUsaha} - ${location.alamat ?? "Lokasi penampung limbah Rotary"}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: location.namaUsaha,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareNotice("Tautan disalin");
        window.setTimeout(() => setShareNotice(null), 1800);
      }
    } catch {
      setShareNotice(null);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-149px)] max-w-[1920px] overflow-hidden border-t border-gray-200 bg-white lg:min-h-[calc(100dvh-133px)] lg:grid-cols-[410px_minmax(0,1fr)] xl:grid-cols-[450px_minmax(0,1fr)]">
      <aside className="relative z-20 flex max-h-none flex-col border-b border-[#d8deea] bg-white lg:h-[calc(100dvh-133px)] lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e6eaf0] bg-white px-5 py-5 md:px-6">
          <div className="mb-4">
            <p className="inline-flex items-center gap-2 font-open-sauce text-xs font-semibold text-[#17458f]">
              <Icon icon="lucide:recycle" width={14} height={14} className="text-[#f7a81b]" aria-hidden="true" />
              Direktori limbah Bali
            </p>
            <h1 className="mt-2 font-open-sauce text-[26px] font-semibold leading-[1.15] text-[#171717] md:text-[28px]">
              Lokasi Penampung
            </h1>
            <p className="mt-3 max-w-[42ch] font-open-sauce text-[13px] leading-6 text-[#5f6370]">
              Temukan tempat yang menerima material tertentu tanpa mencampurnya dengan marketplace barang layak pakai.
            </p>
          </div>

          <form
            className="grid grid-cols-[minmax(0,1fr)_82px] gap-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="relative block">
              <Icon
                icon="lucide:search"
                width={18}
                height={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6370]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari lokasi atau material..."
                className="h-11 w-full rounded-lg border border-[#c5cbd6] bg-white pl-10 pr-3 font-open-sauce text-[13px] text-[#171717] outline-none transition placeholder:text-[#5f6370] focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/15"
              />
            </label>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#f7a81b] font-open-sauce text-[13px] font-semibold text-[#171717] transition hover:bg-[#e89a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px"
            >
              Filter
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {materialOptions.map((material) => {
              const isActive = activeMaterial === material;

              return (
                <button
                  key={material}
                  type="button"
                  onClick={() => setActiveMaterial(material)}
                  className={`min-h-11 rounded-lg border px-3.5 py-2 font-open-sauce text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-[#f7a81b] bg-[#f7a81b] text-[#171717]"
                      : "border-[#d8deea] bg-white text-[#4b5563] hover:border-[#17458f] hover:text-[#17458f]"
                  }`}
                >
                  {material}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 md:px-6">
          <h2 className="font-open-sauce text-[17px] font-semibold text-[#171717]">
            {filteredLocations.length} Lokasi Ditemukan
          </h2>
          {(query || activeMaterial !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveMaterial("Semua");
              }}
              className="rounded-md px-2 py-1 font-open-sauce text-xs font-semibold text-[#17458f] transition hover:bg-[#e8f0fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-5 md:px-6 lg:pb-8">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
              <LocationListCard
                key={location.id}
                location={location}
                isActive={activeLocationId === location.id}
                onSelect={setActiveLocationId}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#d8deea] bg-[#f8fafc] px-5 py-7 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f0fb] text-[#17458f]">
                <Icon icon="lucide:map-pin-off" width={22} height={22} />
              </div>
              <h3 className="font-open-sauce text-[17px] font-semibold text-[#171717]">
                Belum ada lokasi yang cocok
              </h3>
              <p className="mx-auto mt-2 max-w-[32ch] font-open-sauce text-[13px] leading-6 text-[#5f6370]">
                Coba ubah kata kunci atau pilih material lain. Data lokasi penampung akan muncul setelah admin menambahkannya.
              </p>
            </div>
          )}
        </div>
      </aside>

      <div className="relative min-h-[620px] bg-[#dfe9ef] lg:h-[calc(100dvh-133px)] lg:min-h-0">
        <MapContainer
          locations={filteredLocations}
          onMarkerClick={setActiveLocationId}
          activeLocationId={activeLocationId}
          recenterRequestKey={recenterRequestKey}
        />

        {filteredLocations.length === 0 && (
          <div className="pointer-events-none absolute left-1/2 top-6 z-10 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-lg bg-white px-4 py-3 text-center shadow-[0_8px_12px_rgba(15,23,42,0.12)]">
            <p className="font-open-sauce text-sm font-semibold text-gray-800">
              Peta akan menampilkan titik lokasi penampung yang sesuai filter.
            </p>
          </div>
        )}

        {activeLocation && (
          <LocationDetailCard
            location={activeLocation}
            isSaved={savedIds.includes(activeLocation.id)}
            shareNotice={shareNotice}
            canRecenter={hasMapCoordinate(activeLocation)}
            onClose={() => setActiveLocationId(null)}
            onRecenter={() => setRecenterRequestKey((key) => key + 1)}
            onShare={() => handleShare(activeLocation)}
            onToggleSave={() => toggleSaved(activeLocation.id)}
          />
        )}
      </div>
    </section>
  );
}
