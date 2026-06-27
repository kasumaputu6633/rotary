"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { ContactPreference, ListingCardData } from "@/lib/listing-format";

export default function ProductContactActions({
  product,
  sellerWhatsapp,
  isOwner,
  onConversationCreated,
}: {
  product: ListingCardData;
  sellerWhatsapp?: string | null;
  isOwner?: boolean;
  onConversationCreated?: (conversationId: string) => void;
}) {
  const isSale = product.mode === "sale";
  const isReserved = product.status === "reserved";
  const contactPref: ContactPreference = product.contactPreference ?? "in_app";
  const [creating, setCreating] = useState(false);

  function waHref(number: string) {
    const normalized = number.replace(/\D/g, "").replace(/^0/, "62");
    const itemLabel = encodeURIComponent(
      `Halo, saya tertarik dengan barang "${product.title}" di Rotary.`,
    );
    return `https://wa.me/${normalized}?text=${itemLabel}`;
  }

  async function handleOpenChat() {
    setCreating(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: product.id }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        // User belum login → redirect ke login
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const eventDetail = {
          conversationId: data.conversationId,
          listing: data.listing ?? null,
        };
        if (onConversationCreated) {
          onConversationCreated(data.conversationId);
        } else {
          window.dispatchEvent(
            new CustomEvent("rotaryOpenChat", { detail: eventDetail }),
          );
        }
        return;
      }

      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Chat belum dapat dibuka. Coba lagi.");
      window.dispatchEvent(new CustomEvent("rotaryOpenChat"));
    } catch (error) {
      toast.error(
        error instanceof DOMException && error.name === "AbortError"
          ? "Koneksi chat terlalu lama. Coba lagi."
          : "Chat belum dapat dibuka. Periksa koneksi lalu coba lagi.",
      );
      window.dispatchEvent(new CustomEvent("rotaryOpenChat"));
    } finally {
      window.clearTimeout(timeout);
      setCreating(false);
    }
  }

  if (isOwner) {
    return (
      <div className="mt-5 grid gap-2">
        <Link
          href={`/dashboard/listings/${product.id}/edit`}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#17458f] font-open-sauce text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(23,69,143,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#113268] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
        >
          <Icon icon="lucide:pencil" width={16} height={16} aria-hidden="true" />
          Edit Barang
        </Link>
        <Link
          href="/dashboard/listings"
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d8deea] font-open-sauce text-[13px] font-semibold text-[#17458f] transition-all hover:-translate-y-0.5 hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
        >
          <Icon icon="lucide:layout-dashboard" width={16} height={16} aria-hidden="true" />
          Kelola di Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5">
      {isReserved ? (
        <div className="border-y border-[var(--color-border)] py-4 font-open-sauce">
          <div className="flex items-center gap-2 text-[var(--color-text)]">
            <Icon icon="lucide:clock-3" width={15} height={15} className="shrink-0 text-[var(--color-brand)]" aria-hidden="true" />
            <p className="text-[13px] font-semibold">Sedang dipesan</p>
          </div>
          <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-muted)]">
            Penjual sedang menyelesaikan kesepakatan dengan peminat lain. Kontak baru dijeda sementara.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {contactPref === "whatsapp" && sellerWhatsapp ? (
            <a
              href={waHref(sellerWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25d366] font-open-sauce text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(37,211,102,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#1ebe5e] hover:shadow-[0_12px_24px_rgba(37,211,102,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2"
            >
              <Icon icon="ic:baseline-whatsapp" width={18} height={18} aria-hidden="true" />
              {isSale ? "WhatsApp Penjual" : "WhatsApp Pemilik"}
            </a>
          ) : (
            <button
              type="button"
              onClick={handleOpenChat}
              disabled={creating}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f7a81b] font-open-sauce text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(247,168,27,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? (
                <Icon icon="lucide:loader-circle" width={16} height={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Icon icon="lucide:messages-square" width={16} height={16} aria-hidden="true" />
              )}
              {creating ? "Membuka chat..." : isSale ? "Chat Penjual" : "Chat Pemilik"}
            </button>
          )}

          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#f7a81b] font-open-sauce text-[13px] font-semibold text-[#17458f] transition-all hover:-translate-y-0.5 hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
            onClick={handleOpenChat}
            disabled={creating}
          >
            <Icon
              icon={creating ? "lucide:loader-circle" : isSale ? "lucide:handshake" : "lucide:hand-heart"}
              width={16}
              height={16}
              className={creating ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {creating ? "Membuka chat..." : isSale ? "Saya Tertarik" : "Ajukan Ambil"}
          </button>
        </div>
      )}

      {!isReserved && isSale ? (
        <div className="mt-5 rounded-lg border border-[#17458f]/20 bg-[#eef6ff] p-3 font-open-sauce">
          <div className="flex gap-2">
            <Icon icon="lucide:info" width={16} height={16} className="mt-0.5 shrink-0 text-[#17458f]" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-[#5f6370]">
              Rotary hanya menampilkan listing. Harga, titik temu, pengiriman, dan detail deal disepakati langsung dengan penjual di luar aplikasi.
            </p>
          </div>
        </div>
      ) : !isReserved ? (
        <div className="mt-5 rounded-lg border border-[#f7a81b]/40 bg-[#fff7e8] p-3 font-open-sauce">
          <div className="flex gap-2">
            <Icon icon="lucide:info" width={16} height={16} className="mt-0.5 shrink-0 text-[#f7a81b]" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-[#5f6370]">
              Barang ini didonasikan. Chat pemilik untuk menyepakati jadwal ambil, titik temu, atau penjemputan.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
