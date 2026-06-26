"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface AdminRowActionsProps {
    onEdit: () => void;
    onDeleteConfirm: () => Promise<void> | void;
    itemName: string;
    itemType: string;
    itemPreview?: React.ReactNode;
}

export default function AdminRowActions({
    onEdit,
    onDeleteConfirm,
    itemName,
    itemType,
    itemPreview,
}: AdminRowActionsProps) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    async function handleConfirmDelete() {
        await onDeleteConfirm();
        setIsDeleteOpen(false);
    }

    return (
        <div className="flex items-center gap-1">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                title={`Edit ${itemType}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
                <Icon icon="lucide:pencil" width={16} height={16} />
            </button>

            {/* Delete Button */}
            <button
                onClick={() => setIsDeleteOpen(true)}
                title={`Hapus ${itemType}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
            >
                <Icon icon="lucide:trash-2" width={16} height={16} />
            </button>

            {/* Reusable Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Hapus ${itemType}?`}
                description={
                    <>
                        Apakah kamu yakin ingin menghapus{" "}
                        <span className="font-semibold text-gray-800">
                            {itemName}
                        </span>
                        ? Data yang dihapus tidak dapat dikembalikan.
                    </>
                }
                itemPreview={itemPreview}
            />
        </div>
    );
}
