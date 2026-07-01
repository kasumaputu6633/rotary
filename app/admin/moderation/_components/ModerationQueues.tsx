"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatListingStatus, type ListingStatus } from "@/lib/listing-format";
import type { ModerationQueueItem, ModerationWasteItem } from "../actions";
import {
  blockListingFromModeration,
  dismissListingComplaints,
  setWasteLocationActive,
} from "../actions";

function FlaggedRow({ item }: { item: ModerationQueueItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isBlocked = item.status === "blocked";

  function block() {
    startTransition(async () => {
      const result = await blockListingFromModeration(item.id);
      if (result.success) {
        toast.success("Listing diblokir dan komplain diselesaikan.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal memblokir listing.");
      }
    });
  }

  function dismiss() {
    startTransition(async () => {
      const result = await dismissListingComplaints(item.id);
      if (result.success) {
        toast.success("Komplain ditolak, listing tetap tayang.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal menolak komplain.");
      }
    });
  }

  return (
    <tr className="font-open-sauce text-[13px] align-top">
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <Icon icon="lucide:image" width={16} height={16} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="font-semibold text-gray-900 hover:text-[#17458f] hover:underline"
            >
              {item.title}
            </Link>
            <p className="text-[11px] text-gray-400">
              {item.sellerName ?? "Penjual tidak dikenal"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
          <Icon icon="lucide:flag" width={11} height={11} />
          {item.openComplaints} laporan
        </span>
        {item.topCategory ? (
          <p className="mt-1 text-[11px] text-gray-400">{item.topCategory}</p>
        ) : null}
      </td>
      <td className="py-3.5 pr-4">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            isBlocked
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
        >
          {formatListingStatus(item.status as ListingStatus)}
        </span>
      </td>
      <td className="py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          {isBlocked ? (
            <span className="font-open-sauce text-[11px] italic text-gray-400">
              Sudah diblokir
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={dismiss}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <Icon icon="lucide:check" width={13} height={13} />
                Aman
              </button>
              <button
                type="button"
                onClick={block}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                <Icon icon="lucide:shield-x" width={13} height={13} />
                Blokir
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function WasteRow({ item }: { item: ModerationWasteItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setWasteLocationActive(item.id, !item.isActive);
      if (result.success) {
        toast.success(
          item.isActive ? "Lokasi disembunyikan." : "Lokasi ditampilkan.",
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal memperbarui lokasi.");
      }
    });
  }

  return (
    <tr className="font-open-sauce text-[13px]">
      <td className="py-3.5 pr-4 font-semibold text-gray-900">
        {item.namaUsaha}
      </td>
      <td className="py-3.5 pr-4">
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
          {item.type}
        </span>
      </td>
      <td className="py-3.5 pr-4">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            item.isActive
              ? "border-blue-100 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-gray-100 text-gray-500"
          }`}
        >
          {item.isActive ? "Tampil" : "Disembunyikan"}
        </span>
      </td>
      <td className="py-3.5">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={toggle}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Icon
              icon={item.isActive ? "lucide:eye-off" : "lucide:eye"}
              width={13}
              height={13}
            />
            {item.isActive ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ModerationQueues({
  flaggedListings,
  wasteLocations,
}: {
  flaggedListings: ModerationQueueItem[];
  wasteLocations: ModerationWasteItem[];
}) {
  return (
    <div className="space-y-6">
      {/* Flagged listings */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Icon
            icon="lucide:flag"
            width={17}
            height={17}
            className="text-red-500"
          />
          <h2 className="font-open-sauce text-base font-bold text-gray-900">
            Listing Dilaporkan
          </h2>
        </div>

        {flaggedListings.length === 0 ? (
          <p className="py-10 text-center font-open-sauce text-sm text-gray-400">
            Tidak ada listing yang menunggu moderasi. Semua bersih.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left font-open-sauce text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4">Listing</th>
                  <th className="pb-3 pr-4">Laporan</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flaggedListings.map((item) => (
                  <FlaggedRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Waste locations content review */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Icon
            icon="lucide:recycle"
            width={17}
            height={17}
            className="text-[#f7a81b]"
          />
          <h2 className="font-open-sauce text-base font-bold text-gray-900">
            Review Lokasi Limbah
          </h2>
        </div>
        <p className="mb-4 font-open-sauce text-[12px] text-gray-400">
          Periksa nama dan tipe lokasi. Sembunyikan jika ada konten tidak pantas
          pada field yang dapat diisi bebas.
        </p>

        {wasteLocations.length === 0 ? (
          <p className="py-10 text-center font-open-sauce text-sm text-gray-400">
            Belum ada lokasi limbah terdaftar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left font-open-sauce text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4">Nama Usaha</th>
                  <th className="pb-3 pr-4">Tipe</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wasteLocations.map((item) => (
                  <WasteRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
