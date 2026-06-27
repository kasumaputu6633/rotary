"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import AdminRowActions from "../../_components/AdminRowActions";

export interface WasteLocation {
    id: string;
    type: "tps" | "vendor";
    namaUsaha: string;
    namaPic?: string | null;
    emailKontak?: string | null;
    teleponKontak?: string | null;
    alamat?: string | null;
    website?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    jenisSampahDiterima?: string[] | null;
    operatingHours?: any;
    imageUrl?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface LocationCardProps {
    location: WasteLocation;
    onEdit: (location: WasteLocation) => void;
    onDelete: (id: string) => void;
}

export function formatOperatingHours(hours: any): string {
    if (!hours) return "-";
    if (typeof hours === "string") return hours;
    if (typeof hours !== "object") return "-";

    const dayNamesIndo = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const schedules: { [key: string]: string[] } = {};

    for (let i = 0; i < 7; i++) {
        const key = dayKeys[i];
        const name = dayNamesIndo[i];
        const sched = hours[key];

        let timeStr = "Tutup";
        if (sched && !sched.isClosed && sched.open && sched.close) {
            timeStr = `${sched.open} - ${sched.close}`;
        }

        if (!schedules[timeStr]) {
            schedules[timeStr] = [];
        }
        schedules[timeStr].push(name);
    }

    if (Object.keys(schedules).length === 1 && Object.keys(schedules)[0] === "Tutup") {
        return "Tutup";
    }

    const parts = Object.entries(schedules).map(([time, days]) => {
        if (time === "Tutup") return null;

        const isConsecutiveMonFri = days.length === 5 && days[0] === "Senin" && days[4] === "Jumat";
        const isEveryDay = days.length === 7;

        if (isEveryDay) {
            return `Setiap Hari: ${time}`;
        } else if (isConsecutiveMonFri) {
            return `Senin - Jumat: ${time}`;
        } else {
            if (days.length > 1) {
                const indices = days.map(d => dayNamesIndo.indexOf(d));
                let consecutive = true;
                for (let j = 1; j < indices.length; j++) {
                    if (indices[j] !== indices[j - 1] + 1) consecutive = false;
                }
                if (consecutive) {
                    return `${days[0]} - ${days[days.length - 1]}: ${time}`;
                }
            }
            return `${days.join(", ")}: ${time}`;
        }
    }).filter(Boolean);

    if (schedules["Tutup"] && schedules["Tutup"].length > 0 && schedules["Tutup"].length < 7) {
        const closedDays = schedules["Tutup"];
        if (closedDays.length === 1 && closedDays[0] === "Minggu") {
            parts.push("Minggu: Tutup");
        } else if (closedDays.length === 2 && closedDays[0] === "Sabtu" && closedDays[1] === "Minggu") {
            parts.push("Sabtu - Minggu: Tutup");
        } else {
            parts.push(`${closedDays.join(", ")}: Tutup`);
        }
    }

    return parts.join(" | ");
}

export default function LocationCard({
    location,
    onEdit,
    onDelete,
}: LocationCardProps) {
    const { id, namaUsaha, type, alamat, operatingHours, teleponKontak, jenisSampahDiterima, imageUrl } = location;

    // A small card preview to show inside the delete confirmation modal
    const deletePreview = (
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#17458f]/5 flex items-center justify-center border border-gray-100">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={namaUsaha}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <Icon icon="lucide:recycle" width={22} height={22} className="text-[#17458f]" />
                )}
            </div>
            <div className="min-w-0">
                <p className="truncate font-open-sauce text-xs font-bold text-gray-900">
                    {namaUsaha}
                </p>
                <p className="truncate font-open-sauce text-[10px] text-gray-400 mt-0.5 animate-pulse">
                    {alamat || "-"}
                </p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#f7a81b]/30 hover:shadow-[0_8px_30px_rgba(247,168,27,0.04)] transition-all duration-300">

            {/* Left : Image + Info */}
            <div className="flex items-start gap-4 min-w-0">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#17458f]/5 to-[#17458f]/10 border border-gray-100 flex items-center justify-center">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={namaUsaha}
                            fill
                            className="object-cover transition duration-300 hover:scale-105"
                        />
                    ) : (
                        <Icon
                            icon="lucide:recycle"
                            width={32}
                            height={32}
                            className="text-[#17458f]/40"
                        />
                    )}
                </div>

                {/* Info */}
                <div className="min-w-0 space-y-1">
                    <h4 className="font-open-sauce text-base font-bold text-gray-900 truncate">
                        {namaUsaha}
                    </h4>

                    <p className="font-open-sauce text-[11px] font-semibold text-[#17458f] flex items-center gap-1.5 truncate">
                        <Icon icon="lucide:map-pin" width={12} />
                        {alamat || "-"}
                    </p>

                    <p className="font-open-sauce text-[11px] text-gray-500 flex items-center gap-1.5 truncate">
                        <Icon icon="lucide:clock" width={12} />
                        {formatOperatingHours(operatingHours)}
                    </p>

                    <p className="font-open-sauce text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
                        <Icon icon="lucide:phone" width={12} />
                        {teleponKontak || "-"}
                    </p>
                </div>
            </div>

            {/* Center : Badge */}
            <div className="flex justify-center px-4">
                {type === "tps" ? (
                    <span className="inline-flex items-center rounded-full bg-[#0B2545] px-4 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                        TPS
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-[#E53E3E] px-4 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                        Vendor
                    </span>
                )}
            </div>
            {/* Waste Types */}
            <div className="grid grid-cols-4 gap-2 px-6 min-w-[340px]">
                {(jenisSampahDiterima || []).map((t) => (
                    <span
                        key={t}
                        className="flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-600 whitespace-nowrap"
                    >
                        {t}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <AdminRowActions
                    onEdit={() => onEdit(location)}
                    onDeleteConfirm={() => onDelete(id)}
                    itemName={namaUsaha}
                    itemType="lokasi sampah"
                    itemPreview={deletePreview}
                />
            </div>
        </div>
    );
}

