"use client";

import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string | React.ReactNode;
    itemPreview?: React.ReactNode;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemPreview,
}: DeleteConfirmModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    function handleConfirm() {
        setError(null);
        startTransition(async () => {
            try {
                await onConfirm();
            } catch (err: any) {
                setError(err?.message ?? "Terjadi kesalahan saat menghapus.");
            }
        });
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
                onClick={onClose}
            />
            {/* Modal */}
            <div
                className="relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header strip */}
                <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-red-500 to-rose-500" />

                <div className="px-6 py-6">
                    {/* Icon */}
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60">
                        <Icon icon="lucide:trash-2" width={26} height={26} className="text-red-500" />
                    </div>

                    {/* Title */}
                    <h3 className="text-center font-open-sauce text-[17px] font-bold text-gray-900">
                        {title}
                    </h3>
                    
                    {/* Description */}
                    <div className="mt-1.5 text-center font-open-sauce text-[12.5px] text-gray-500 leading-relaxed">
                        {description}
                    </div>

                    {/* Optional Item Preview */}
                    {itemPreview && (
                        <div className="mt-4">
                            {itemPreview}
                        </div>
                    )}

                    {error && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-open-sauce text-[12px] text-red-600">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex gap-2.5">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 font-open-sauce text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                            {isPending ? (
                                <Icon icon="lucide:loader-2" className="animate-spin" width={14} height={14} />
                            ) : (
                                <>
                                    <Icon icon="lucide:trash-2" width={13} height={13} />
                                    Hapus
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
