import { Icon } from "@iconify/react";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { getSellerListings } from "@/lib/listings";
import { getProfileCompletion, resolveShopName } from "@/lib/profile";
import { eq } from "drizzle-orm";
import { Badge, PageHeader, Panel } from "../_components/SellerCenterUi";
import { ProfileForm } from "./_components/ProfileForm";

function SellerIdentityPreview({
  avatarUrl,
  shopName,
  publicListingCount,
  phoneVerified,
  whatsappContactEnabled,
}: {
  avatarUrl?: string | null;
  shopName: string;
  publicListingCount: number;
  phoneVerified: boolean;
  whatsappContactEnabled: boolean;
}) {
  const whatsappActive = phoneVerified && whatsappContactEnabled;

  return (
    <Panel
      title="Preview informasi pemilik"
      description="Gambaran data yang sekarang muncul pada halaman barang."
    >
      <div className="p-4">
        <div className="flex items-center gap-3 border-b border-[var(--seller-rule)] pb-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--seller-rule)] bg-[var(--seller-brand)] text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon icon="lucide:user-round" width={22} height={22} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--seller-muted)]">Informasi Pemilik</p>
            <p className="mt-1 truncate text-[14px] font-semibold text-[var(--seller-ink)]">
              {shopName}
            </p>
            <p className="mt-1 text-[11px] text-[var(--seller-muted)]">
              {publicListingCount} listing tampil di marketplace
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-4 text-[11px] leading-relaxed">
          <Icon
            icon={whatsappActive ? "lucide:message-circle-check" : "lucide:message-circle-off"}
            width={15}
            height={15}
            className={`mt-0.5 shrink-0 ${whatsappActive ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"}`}
            aria-hidden="true"
          />
          <p className="text-[var(--seller-muted)]">
            {whatsappActive
              ? "Tombol WhatsApp tampil pada semua listing aktif milikmu."
              : phoneVerified
                ? "Tombol WhatsApp dinonaktifkan. Peminat tetap dapat memakai chat Rotary."
                : "WhatsApp bersifat opsional. Verifikasi nomor HP hanya jika ingin mengaktifkannya."}
          </p>
        </div>
      </div>
    </Panel>
  );
}

export default async function ProfilePage() {
  const user = await requireRole("user");

  const [[profile], sellerListings] = await Promise.all([
    db
      .select({
        fullName: users.fullName,
        phone: users.phone,
        phoneVerifiedAt: users.phoneVerifiedAt,
        whatsappContactEnabled: users.whatsappContactEnabled,
        bio: users.bio,
        shopName: users.shopName,
        avatarUrl: users.avatarUrl,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    getSellerListings(user.id),
  ]);

  const completion = getProfileCompletion(profile ?? {});
  const resolvedShopName = resolveShopName(profile ?? {});
  const phoneVerified = Boolean(profile?.phone && profile.phoneVerifiedAt);
  const whatsappContactEnabled = phoneVerified && Boolean(profile?.whatsappContactEnabled);
  const publicListingCount = sellerListings.filter((listing) =>
    listing.status === "active" || listing.status === "reserved",
  ).length;

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:user-round-cog"
        kicker="Lapak Saya"
        title="Profil Lapak"
        description="Atur nama lapak dan informasi publik yang menyertai listing kamu."
        meta={
          <>
            <Badge tone={completion.percentage === 100 ? "success" : "accent"}>
              {completion.percentage}% lengkap
            </Badge>
            <Badge tone={whatsappContactEnabled ? "success" : "neutral"}>
              WhatsApp {whatsappContactEnabled ? "aktif" : "opsional"}
            </Badge>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Edit profil" description="Perubahan nama lapak langsung berlaku pada listing publik.">
          <ProfileForm
            key={profile?.updatedAt?.getTime() ?? "profile"}
            defaultValues={{
              shopName: resolvedShopName,
              bio: profile?.bio,
              phoneVerified,
              whatsappContactEnabled,
            }}
          />
        </Panel>

        <aside className="grid content-start gap-4">
          <Panel
            title="Kelengkapan profil"
            description={`${completion.completedCount} dari ${completion.checklist.length} bagian sudah diisi.`}
            actions={<span className="text-[18px] font-semibold tabular-nums text-[var(--seller-ink)]">{completion.percentage}%</span>}
          >
            <div className="px-4 pt-4">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-[var(--seller-paper-2)]"
                role="progressbar"
                aria-label="Kelengkapan profil lapak"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completion.percentage}
              >
                <div
                  className="h-full rounded-full bg-[var(--seller-brand)]"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-[var(--seller-rule)] px-4 pb-2 pt-3">
              {completion.checklist.map((item) => (
                <div key={item.key} className="flex gap-3 py-3">
                  <Icon
                    icon={item.complete ? "lucide:circle-check" : "lucide:circle"}
                    width={16}
                    height={16}
                    className={`mt-0.5 shrink-0 ${item.complete ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{item.label}</p>
                      {!item.publicNow ? (
                        <Badge tone="neutral">{item.key === "bio" ? "Tahap berikutnya" : "Privat"}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <SellerIdentityPreview
            avatarUrl={profile?.avatarUrl}
            shopName={resolvedShopName}
            publicListingCount={publicListingCount}
            phoneVerified={phoneVerified}
            whatsappContactEnabled={whatsappContactEnabled}
          />

          <Panel
            title="Akun dan keamanan"
            description="Identitas privat serta verifikasi kontak dikelola terpisah dari profil lapak."
          >
            <div className="grid gap-2 p-4">
              <Link
                href="/account/settings?tab=profile"
                className="inline-flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
              >
                Profil dan foto akun
                <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
              </Link>
              <Link
                href="/account/settings?tab=contact"
                className="inline-flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
              >
                Kontak dan verifikasi
                <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
              </Link>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
