"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import AdminRowActions from "../../_components/AdminRowActions";

export interface WasteLocation {
    id: string;
    name: string;
    district: string;
    address: string;
    operationalHours: string;
    phone: string;
    wasteTypes: string[];
    imageUrl?: string;
    locationLink?: string;
}

interface LocationCardProps {
    location: WasteLocation;
    onEdit: (location: WasteLocation) => void;
    onDelete: (id: string) => void;
}

export default function LocationCard({
    location,
    onEdit,
    onDelete,
}: LocationCardProps) {
    const { id, name, district, address, operationalHours, phone, wasteTypes, imageUrl } = location;

    // A small card preview to show inside the delete confirmation modal
    const deletePreview = (
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#17458f]/5 flex items-center justify-center border border-gray-100">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <Icon icon="lucide:recycle" width={22} height={22} className="text-[#17458f]" />
                )}
            </div>
            <div className="min-w-0">
                <p className="truncate font-poppins text-xs font-bold text-gray-900">
                    {name}
                </p>
                <p className="truncate font-poppins text-[10px] text-gray-400 mt-0.5">
                    {district}, Bali
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#f7a81b]/30 hover:shadow-[0_8px_30px_rgba(247,168,27,0.04)] transition-all duration-300">
            {/* Left: Image & Details */}
            <div className="flex items-start gap-4">
                {/* Location Image */}
                <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#17458f]/5 to-[#17458f]/10 border border-gray-100 flex items-center justify-center">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition duration-300 hover:scale-105"
                        />
                    ) : (
                        <Icon icon="lucide:recycle" width={32} height={32} className="text-[#17458f]/40" />
                    )}
                </div>

                {/* Text Info */}
                <div className="min-w-0 space-y-1">
                    <h4 className="font-poppins text-base font-bold text-gray-900 tracking-tight leading-snug truncate">
                        {name}
                    </h4>
                    <p className="font-poppins text-[11px] font-semibold text-[#17458f] flex items-center gap-1.5">
                        <Icon icon="lucide:map-pin" width={12} height={12} className="text-[#17458f]" />
                        {district}, Bali
                    </p>
                    <p className="font-poppins text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Icon icon="lucide:clock" width={12} height={12} className="text-gray-400" />
                        {operationalHours}
                    </p>
                    <p className="font-poppins text-[11px] text-gray-400 flex items-center gap-1.5">
                        <Icon icon="lucide:phone" width={12} height={12} className="text-gray-400" />
                        {phone}
                    </p>
                </div>
            </div>

            {/* Middle: Badges */}
            <div className="flex flex-wrap gap-1.5 sm:justify-center flex-1 max-w-md px-0 sm:px-4">
                {wasteTypes.map((type) => (
                    <span
                        key={type}
                        className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-1 font-poppins text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100"
                    >
                        {type}
                    </span>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end shrink-0 sm:pl-2">
                <AdminRowActions
                    onEdit={() => onEdit(location)}
                    onDeleteConfirm={() => onDelete(id)}
                    itemName={name}
                    itemType="lokasi sampah"
                    itemPreview={deletePreview}
                />
            </div>
        </div>
    );
}
