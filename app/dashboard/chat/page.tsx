import { Icon } from "@iconify/react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { isPhoneVerified } from "@/lib/account-verification";
import { getSellerListings } from "@/lib/listings";
import {
  Badge,
  PageHeader,
  Panel,
  PrimaryLink,
  SecondaryLink,
} from "../_components/SellerCenterUi";

const currentFlow = [
  {
    icon: "lucide:message-circle",
    title: "Peminat menghubungi seller",
    description: "Kontak dilakukan melalui WhatsApp publik yang terpasang pada halaman barang.",
  },
  {
    icon: "lucide:handshake",
    title: "Barang ditandai Dipesan",
    description: "Setelah ada calon penerima yang serius, kontak baru dijeda sementara.",
  },
  {
    icon: "lucide:clipboard-pen-line",
    title: "Progres dicatat di Kesepakatan",
    description: "Simpan harga, jadwal, dan cara serah terima sebagai catatan privat seller.",
  },
];

export default async function SellerChatPage() {
  const user = await requireRole("user");
  const phoneVerified = isPhoneVerified(user);
  const sellerListings = await getSellerListings(user.id);
  const contactableListingCount = sellerListings.filter((listing) => listing.status === "active").length;

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:messages-square"
        kicker="Chat Pembeli"
        title="Percakapan Listing"
        description="Chat dalam aplikasi belum diaktifkan. Untuk saat ini komunikasi berlangsung melalui WhatsApp seller."
        meta={
          <>
            <Badge tone="neutral">Belum tersedia</Badge>
            <Badge tone={phoneVerified ? "success" : "danger"}>
              WhatsApp {phoneVerified ? "aktif" : "belum terverifikasi"}
            </Badge>
          </>
        }
        actions={
          phoneVerified ? (
            <SecondaryLink href="/dashboard/profile" icon="lucide:settings">Atur Kontak</SecondaryLink>
          ) : (
            <PrimaryLink href="/dashboard/profile" icon="lucide:phone">Verifikasi Nomor HP</PrimaryLink>
          )
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          title="Alur komunikasi saat ini"
          description="Tidak ada percakapan atau jumlah pesan palsu yang ditampilkan sebelum sistem chat benar-benar tersambung."
        >
          <ol className="divide-y divide-[var(--seller-rule)]">
            {currentFlow.map((item, index) => (
              <li key={item.title} className="grid gap-3 px-4 py-5 sm:grid-cols-[32px_44px_minmax(0,1fr)] sm:items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--seller-rule-strong)] text-[11px] font-semibold text-[var(--seller-muted)]">
                  {index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]">
                  <Icon icon={item.icon} width={19} height={19} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-semibold text-[var(--seller-ink)]">{item.title}</h2>
                  <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <aside className="grid content-start gap-4">
          <Panel title="Status kontak lapak">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Icon
                  icon={phoneVerified ? "lucide:circle-check" : "lucide:circle-alert"}
                  width={19}
                  height={19}
                  className={`mt-0.5 shrink-0 ${phoneVerified ? "text-[var(--seller-success)]" : "text-[var(--seller-danger)]"}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[var(--seller-ink)]">
                    {phoneVerified ? "WhatsApp siap digunakan" : "WhatsApp belum tersedia"}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                    {phoneVerified
                      ? `${contactableListingCount} listing aktif dapat menampilkan tombol WhatsApp.`
                      : "Listing tetap dapat tayang, tetapi calon peminat tidak mendapat tombol kontak langsung."}
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Aksi yang tersedia">
            <div className="grid gap-2 p-4">
              <Link
                href="/dashboard/listings"
                className="inline-flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
              >
                Kelola listing
                <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/deals"
                className="inline-flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
              >
                Buka kesepakatan
                <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
              </Link>
            </div>
          </Panel>

          <div className="border-l-2 border-[var(--seller-rule-strong)] py-1 pl-4">
            <p className="text-[12px] font-semibold text-[var(--seller-ink)]">Tentang fase berikutnya</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Saat chat dibuat nanti, halaman ini baru akan menampilkan percakapan, pesan belum dibaca, dan konteks listing dari database.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
