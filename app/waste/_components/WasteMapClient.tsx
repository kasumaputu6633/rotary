"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MapContainer from "./MapContainer";
import ReportWasteLocationButton from "./ReportWasteLocationButton";
import type { WasteLocation } from "../actions";
import { recordRecentWasteLocationAction, toggleSavedWasteLocationAction } from "../actions";

interface WasteMapClientProps {
  initialLocations: WasteLocation[];
  initialSavedIds: string[];
  initialRecentIds: string[];
  isAuthenticated: boolean;
}

type ViewMode = "all" | "saved" | "recent";

const DEFAULT_MATERIALS = [
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

const VIEW_MODES: { value: ViewMode; label: string; icon: string }[] = [
  { value: "all", label: "Semua", icon: "lucide:layout-grid" },
  { value: "saved", label: "Tersimpan", icon: "lucide:bookmark" },
  { value: "recent", label: "Terakhir", icon: "lucide:history" },
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
  if (type === "vendor") return "Partner Penampung";
  if (type === "tps") return "Tempat Penampung";
  // Handle tipe dinamis baru dari admin (e.g. "bank_sampah" → "Bank Sampah")
  return type
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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

function normalizeWebsiteUrl(website: string) {
  const trimmed = website.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
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
      className={`grid w-full grid-cols-[60px_minmax(0,1fr)] gap-2.5 rounded-lg border bg-white p-2.5 text-left transition duration-200 hover:border-[#9eb8df] hover:bg-[#fbfdff] hover:shadow-[0_8px_12px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${
        isActive ? "border-[#17458f] bg-[#f7fbff]" : "border-[#d8deea]"
      }`}
    >
      <LocationImage
        location={location}
        className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md border border-[#d8deea]"
      />

      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded bg-[#e8f0fb] px-1.5 py-0.5 font-open-sauce text-[9px] font-semibold text-[#17458f]">
            {getLocationTypeLabel(location.type)}
          </span>
          {hasMapCoordinate(location) && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[#fff3d8] text-[#986a12]">
              <Icon icon="lucide:map-pin" width={11} height={11} aria-hidden="true" />
            </span>
          )}
        </div>
        <h3 className="line-clamp-1 font-open-sauce text-[13px] font-semibold leading-snug text-[#171717]">
          {location.namaUsaha}
        </h3>
        <p className="mt-0.5 line-clamp-1 font-open-sauce text-[11px] leading-relaxed text-[#5f6370]">
          {location.alamat || "Alamat belum tersedia"}
        </p>
        <div className="mt-1.5">
          <MaterialBadges materials={location.jenisSampahDiterima} limit={3} />
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Detail lokasi penampung"
      className={`absolute inset-x-0 bottom-0 z-20 overflow-y-auto rounded-t-2xl bg-white shadow-[0_-8px_28px_rgba(15,23,42,0.18)] transition-[max-height] duration-300 ease-in-out md:inset-x-auto md:bottom-6 md:left-1/2 md:w-[calc(100%-4rem)] md:max-w-2xl md:-translate-x-1/2 md:rounded-xl md:shadow-[0_12px_28px_rgba(15,23,42,0.18)] ${
        isExpanded ? "max-h-[80%] md:max-h-[70vh]" : "max-h-[45%] md:max-h-[320px]"
      }`}
    >
      {/* Grab handle — penanda bottom sheet, hanya di mobile. */}
      <div
        className="mx-auto mb-3 mt-2 h-1 w-10 rounded-full bg-[#d8deea] md:hidden"
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-[#5f6370] transition hover:bg-[#f2f5f9] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
        aria-label="Tutup detail lokasi"
      >
        <Icon icon="lucide:x" width={20} height={20} />
      </button>

      <div className="p-4 pt-2.5 md:p-5">
        {/* Header — always visible */}
        <div className="flex gap-4">
          <LocationImage
            location={location}
            className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#d8deea] md:h-20 md:w-20"
          />
          <div className="min-w-0 flex-1 pr-10">
            <p className="mb-1.5 flex items-center gap-2 font-open-sauce text-xs font-semibold text-[#17458f]">
              <Icon icon="lucide:map-pin" width={14} height={14} className="text-[#f7a81b]" />
              {getLocationTypeLabel(location.type)}
            </p>
            <h2 className="font-open-sauce text-[18px] font-semibold leading-tight text-[#171717] md:text-[20px]">
              {location.namaUsaha}
            </h2>
            <p className="mt-1.5 flex items-start gap-1.5 font-open-sauce text-[12px] leading-relaxed text-[#5f6370]">
              <Icon icon="lucide:map-pin" width={14} height={14} className="mt-0.5 shrink-0 text-[#17458f]" />
              <span className={isExpanded ? "" : "line-clamp-1"}>{location.alamat || "Alamat belum tersedia"}</span>
            </p>
          </div>
        </div>

        {/* Details — only when expanded */}
        {isExpanded && (
          <div className="mt-5 grid gap-4 border-t border-[#edf0f5] pt-5 font-open-sauce text-[13px] text-[#4b5563] md:grid-cols-2">
            <div>
              <p className="font-semibold text-[#171717]">Jam Operasional</p>
              <p className="mt-1 flex items-center gap-2">
                <Icon icon="lucide:clock-3" width={16} height={16} className="text-[#17458f]" />
                {formatOperatingHours(location.operatingHours)}
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
                {location.namaPic && (
                  <p className="mt-1 flex items-center gap-2 text-[#5f6370]">
                    <Icon icon="lucide:user-round" width={16} height={16} className="text-[#17458f]" />
                    {location.namaPic}
                  </p>
                )}
              </div>
            )}
            {location.emailKontak && (
              <div>
                <p className="font-semibold text-[#171717]">Email</p>
                <a
                  href={`mailto:${location.emailKontak}`}
                  className="mt-1 inline-flex items-center gap-2 break-all text-[#4b5563] transition hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
                >
                  <Icon icon="lucide:mail" width={16} height={16} className="text-[#17458f]" />
                  {location.emailKontak}
                </a>
              </div>
            )}
            {location.website && (
              <div>
                <p className="font-semibold text-[#171717]">Website</p>
                <a
                  href={normalizeWebsiteUrl(location.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 break-all text-[#4b5563] transition hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
                >
                  <Icon icon="lucide:globe" width={16} height={16} className="text-[#17458f]" />
                  {location.website}
                </a>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="mb-3 font-semibold text-[#171717]">Sampah yang diterima</p>
              <MaterialBadges materials={location.jenisSampahDiterima} limit={8} />
            </div>
          </div>
        )}

        {/* Actions — always visible */}
        <div className="mt-4 space-y-2">
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
          <div className="grid grid-cols-[minmax(0,1fr)_40px_40px] gap-2">
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
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d8deea] bg-white text-[#5f6370] transition hover:border-[#17458f] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 active:translate-y-px"
              aria-label={isExpanded ? "Sembunyikan detail" : "Lihat selengkapnya"}
            >
              <Icon icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} width={18} height={18} />
            </button>
          </div>
          {isExpanded && (
            <ReportWasteLocationButton locationId={location.id} />
          )}
        </div>
      </div>
    </aside>
  );
}

export default function WasteMapClient({
  initialLocations,
  initialSavedIds,
  initialRecentIds,
  isAuthenticated,
}: WasteMapClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeMaterial, setActiveMaterial] = useState<string[]>([]);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [recenterRequestKey, setRecenterRequestKey] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [mapResizeKey, setMapResizeKey] = useState(0);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const materialOptions = useMemo(() => {
    const materialSet = new Set(DEFAULT_MATERIALS);
    initialLocations.forEach((location) => {
      location.jenisSampahDiterima?.forEach((material) => {
        if (material?.trim()) materialSet.add(formatMaterialName(material));
      });
    });

    return Array.from(materialSet);
  }, [initialLocations]);

  // Tutup popover filter saat klik di luar area-nya.
  useEffect(() => {
    if (!showFilter) return;

    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter]);

  // Basis lokasi sesuai mode tampilan (semua / tersimpan / terakhir dilihat).
  // Recent mempertahankan urutan viewedAt dari server.
  const baseLocations = useMemo(() => {
    if (viewMode === "saved") {
      const savedSet = new Set(savedIds);
      return initialLocations.filter((location) => savedSet.has(location.id));
    }
    if (viewMode === "recent") {
      const byId = new Map(initialLocations.map((location) => [location.id, location]));
      return initialRecentIds
        .map((id) => byId.get(id))
        .filter((location): location is WasteLocation => Boolean(location));
    }
    return initialLocations;
  }, [viewMode, savedIds, initialLocations, initialRecentIds]);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const normalizedMaterials = activeMaterial.map(normalizeText);

    return baseLocations.filter((location) => {
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
        normalizedMaterials.length === 0 ||
        normalizedMaterials.some((selected) =>
          materials.some((material) => normalizeText(material).includes(selected)),
        );

      return matchesQuery && matchesMaterial;
    });
  }, [activeMaterial, baseLocations, query]);

  const hasActiveFilter = query.trim().length > 0 || activeMaterial.length > 0;
  const emptyState =
    !hasActiveFilter && viewMode === "saved"
      ? {
          icon: "lucide:bookmark",
          title: "Belum ada lokasi tersimpan",
          description:
            "Tekan tombol Simpan pada detail lokasi di peta untuk menyimpannya di sini.",
        }
      : !hasActiveFilter && viewMode === "recent"
        ? {
            icon: "lucide:history",
            title: "Belum ada riwayat",
            description:
              "Lokasi yang kamu buka di peta akan muncul di sini secara otomatis.",
          }
        : {
            icon: "lucide:map-pin-off",
            title: "Belum ada lokasi yang cocok",
            description:
              "Coba ubah kata kunci atau pilih material lain. Data lokasi penampung akan muncul setelah admin menambahkannya.",
          };

  const activeLocation = activeLocationId
    ? filteredLocations.find((location) => location.id === activeLocationId) ?? null
    : null;

  // Beralih ke tampilan peta di mobile sekaligus memicu resize canvas Mapbox
  // (peta sebelumnya display:none → canvas 0x0). Dipanggil dari event handler,
  // bukan effect, agar tidak memicu cascading render.
  const showMobileMap = () => {
    setMobileView("map");
    setMapResizeKey((key) => key + 1);
  };

  const handleSelectLocation = (locationId: string) => {
    setActiveLocationId(locationId);
    // Di mobile, pilih kartu langsung memunculkan peta + detail sheet-nya.
    showMobileMap();
    if (isAuthenticated) {
      startTransition(() => {
        recordRecentWasteLocationAction(locationId).catch(() => {});
      });
    }
  };

  const toggleSaved = (locationId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/waste")}`);
      return;
    }

    const wasSaved = savedIds.includes(locationId);
    // Optimistic update; reconcile with the server result.
    setSavedIds((current) =>
      wasSaved ? current.filter((id) => id !== locationId) : [...current, locationId],
    );

    startTransition(() => {
      toggleSavedWasteLocationAction(locationId)
        .then((isSaved) => {
          setSavedIds((current) => {
            const without = current.filter((id) => id !== locationId);
            return isSaved ? [...without, locationId] : without;
          });
        })
        .catch(() => {
          // Revert on failure.
          setSavedIds((current) =>
            wasSaved ? [...current, locationId] : current.filter((id) => id !== locationId),
          );
        });
    });
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
      <aside className={`relative z-20 h-[calc(100dvh-149px)] flex-col border-b border-[#d8deea] bg-white lg:flex lg:h-[calc(100dvh-133px)] lg:border-b-0 lg:border-r ${mobileView === "map" ? "hidden" : "flex"}`}>
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-[#e6eaf0] bg-white px-4 py-3 md:px-5 md:py-3.5">
          <div className="mb-2.5">
            <p className="inline-flex items-center gap-2 font-open-sauce text-[11px] font-semibold text-[#17458f]">
              <Icon icon="lucide:recycle" width={13} height={13} className="text-[#f7a81b]" aria-hidden="true" />
              Direktori limbah Bali
            </p>
            <h1 className="mt-1 font-open-sauce text-[20px] font-semibold leading-tight text-[#171717] md:text-[22px]">
              Lokasi Penampung
            </h1>
            <p className="mt-1.5 hidden max-w-[42ch] font-open-sauce text-[12px] leading-5 text-[#5f6370] sm:block">
              Temukan tempat yang menerima material tertentu tanpa mencampurnya dengan marketplace barang layak pakai.
            </p>
          </div>

          <form onSubmit={(event) => event.preventDefault()}>
            <label className="relative block">
              <Icon
                icon="lucide:search"
                width={17}
                height={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6370]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari lokasi atau material..."
                className="h-10 w-full rounded-lg border border-[#c5cbd6] bg-white pl-10 pr-10 font-open-sauce text-[13px] text-[#171717] outline-none transition placeholder:text-[#5f6370] focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/15"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#5f6370] transition hover:bg-[#f2f5f9] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                  aria-label="Bersihkan pencarian"
                >
                  <Icon icon="lucide:x" width={15} height={15} aria-hidden="true" />
                </button>
              ) : null}
            </label>
          </form>

          {isAuthenticated ? (
            <div
              className="mt-3 flex rounded-lg border border-[#d8deea] bg-[#f2f5f9] p-1"
              role="tablist"
              aria-label="Tampilan lokasi"
            >
              {VIEW_MODES.map((mode) => {
                const isActive = viewMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setViewMode(mode.value)}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 font-open-sauce text-xs font-semibold transition ${
                      isActive
                        ? "bg-white text-[#17458f] shadow-sm"
                        : "text-[#5f6370] hover:text-[#17458f]"
                    }`}
                  >
                    <Icon icon={mode.icon} width={13} height={13} aria-hidden="true" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="relative mt-3" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilter((prev) => !prev)}
              aria-expanded={showFilter}
              aria-haspopup="dialog"
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 font-open-sauce text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 ${
                activeMaterial.length > 0
                  ? "border-[#f7a81b] bg-[#fff7e8] text-[#171717]"
                  : "border-[#c5cbd6] bg-white text-[#4b5563] hover:border-[#17458f] hover:text-[#17458f]"
              }`}
            >
              <Icon icon="lucide:sliders-horizontal" width={16} height={16} aria-hidden="true" />
              Filter Material
              {activeMaterial.length > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f7a81b] px-1.5 text-[11px] font-bold text-white">
                  {activeMaterial.length}
                </span>
              ) : null}
              <Icon
                icon="lucide:chevron-down"
                width={14}
                height={14}
                aria-hidden="true"
                className={`transition-transform ${showFilter ? "rotate-180" : ""}`}
              />
            </button>

            {showFilter ? (
              <div
                role="dialog"
                aria-label="Filter material"
                className="absolute left-0 top-[calc(100%+8px)] z-30 w-full max-w-[360px] rounded-xl border border-[#e6eaf0] bg-white p-3 shadow-[0_18px_44px_rgba(15,23,42,0.16)]"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="font-open-sauce text-[13px] font-semibold text-[#171717]">
                    Material diterima
                  </p>
                  {activeMaterial.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveMaterial([])}
                      className="font-open-sauce text-xs font-semibold text-[#17458f] transition hover:underline"
                    >
                      Bersihkan
                    </button>
                  ) : null}
                </div>
                <div className="max-h-64 space-y-0.5 overflow-y-auto">
                  {materialOptions.map((material) => {
                    const isActive = activeMaterial.includes(material);

                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() =>
                          setActiveMaterial((prev) =>
                            prev.includes(material)
                              ? prev.filter((m) => m !== material)
                              : [...prev, material],
                          )
                        }
                        aria-pressed={isActive}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-open-sauce text-[13px] transition hover:bg-[#f7fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition ${
                            isActive
                              ? "border-[#f7a81b] bg-[#f7a81b] text-white"
                              : "border-[#c5cbd6] bg-white"
                          }`}
                        >
                          {isActive ? (
                            <Icon icon="lucide:check" width={12} height={12} aria-hidden="true" />
                          ) : null}
                        </span>
                        <span className={isActive ? "font-semibold text-[#171717]" : "text-[#4b5563]"}>
                          {material}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 md:px-5">
          <h2 className="font-open-sauce text-[14px] font-semibold text-[#171717]">
            {filteredLocations.length} Lokasi Ditemukan
          </h2>
          {(query || activeMaterial.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveMaterial([]);
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-open-sauce text-xs font-semibold text-[#17458f] transition hover:bg-[#e8f0fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
            >
              <Icon icon="lucide:x" width={13} height={13} aria-hidden="true" />
              Reset{activeMaterial.length > 0 ? ` (${activeMaterial.length})` : ""}
            </button>
          )}
        </div>

        <div className="space-y-2 px-4 pb-20 md:px-5 lg:pb-6">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
              <LocationListCard
                key={location.id}
                location={location}
                isActive={activeLocationId === location.id}
                onSelect={handleSelectLocation}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#d8deea] bg-[#f8fafc] px-5 py-7 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f0fb] text-[#17458f]">
                <Icon icon={emptyState.icon} width={22} height={22} />
              </div>
              <h3 className="font-open-sauce text-[17px] font-semibold text-[#171717]">
                {emptyState.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[32ch] font-open-sauce text-[13px] leading-6 text-[#5f6370]">
                {emptyState.description}
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Toggle ke peta (mobile). Mengambang di bawah daftar. */}
        <button
          type="button"
          onClick={showMobileMap}
          className="absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#17458f] px-5 py-3 font-open-sauce text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(23,69,143,0.32)] transition hover:bg-[#123a79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2 lg:hidden"
        >
          <Icon icon="lucide:map" width={16} height={16} aria-hidden="true" />
          Lihat Peta
        </button>
      </aside>

      <div className={`relative h-[calc(100dvh-149px)] bg-[#dfe9ef] lg:block lg:h-[calc(100dvh-133px)] ${mobileView === "map" ? "block" : "hidden"}`}>
        <MapContainer
          locations={filteredLocations}
          onMarkerClick={handleSelectLocation}
          activeLocationId={activeLocationId}
          recenterRequestKey={recenterRequestKey}
          resizeKey={mapResizeKey}
        />

        {/* Toggle kembali ke daftar (mobile). Di kiri-atas agar tidak bentrok
            dengan kontrol peta (kanan-atas) dan detail sheet (bawah). */}
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-[#d8deea] bg-white px-3.5 py-2 font-open-sauce text-[13px] font-semibold text-[#17458f] shadow-[0_6px_16px_rgba(15,23,42,0.16)] transition hover:bg-[#f7fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] lg:hidden"
        >
          <Icon icon="lucide:list" width={16} height={16} aria-hidden="true" />
          Daftar
        </button>

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
