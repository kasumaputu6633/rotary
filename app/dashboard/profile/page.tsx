import { Icon } from "@iconify/react";
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
  phone,
}: {
  avatarUrl?: string | null;
  shopName: string;
  publicListingCount: number;
  phone?: string | null;
}) {
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
            icon={phone ? "lucide:message-circle-check" : "lucide:message-circle-off"}
            width={15}
            height={15}
            className={`mt-0.5 shrink-0 ${phone ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"}`}
            aria-hidden="true"
          />
          <p className="text-[var(--seller-muted)]">
            {phone
              ? "Tombol WhatsApp aktif pada listing yang tersedia."
              : "Tombol WhatsApp belum aktif. Verifikasi nomor HP untuk mengaktifkannya."}
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
        email: users.email,
        emailVerifiedAt: users.emailVerifiedAt,
        phone: users.phone,
        phoneVerifiedAt: users.phoneVerifiedAt,
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
  const emailVerified = Boolean(profile?.email && profile.emailVerifiedAt);
  const phoneVerified = Boolean(profile?.phone && profile.phoneVerifiedAt);
  const publicListingCount = sellerListings.filter((listing) =>
    listing.status === "active" || listing.status === "reserved",
  ).length;

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:user-round-cog"
        kicker="Lapak Saya"
        title="Profil Lapak"
        description="Atur nama lengkap akun, nama lapak publik, dan kontak yang menyertai listing kamu."
        meta={
          <>
            <Badge tone={completion.percentage === 100 ? "success" : "accent"}>
              {completion.percentage}% lengkap
            </Badge>
            <Badge tone={emailVerified ? "success" : "neutral"}>
              Email {emailVerified ? "terverifikasi" : "belum terverifikasi"}
            </Badge>
            <Badge tone={phoneVerified ? "success" : "neutral"}>
              WhatsApp {phoneVerified ? "aktif" : "belum aktif"}
            </Badge>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Edit profil" description="Perubahan nama dan foto langsung berlaku pada listing publik.">
          <ProfileForm
            key={profile?.updatedAt?.getTime() ?? "profile"}
            defaultValues={{
              fullName: profile?.fullName,
              shopName: profile?.shopName,
              bio: profile?.bio,
              avatarUrl: profile?.avatarUrl,
              email: profile?.email,
              emailVerified,
              phone: profile?.phone,
              phoneVerified,
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
            phone={phoneVerified ? profile?.phone : null}
          />

          <Panel title="Privasi akun">
            <dl className="divide-y divide-[var(--seller-rule)] px-4 text-[12px]">
              <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-3">
                <dt className="text-[var(--seller-muted)]">Email</dt>
                <dd className="text-right">
                  <span className="block break-all font-semibold text-[var(--seller-ink)]">{profile?.email ?? "-"}</span>
                  <span className={`mt-1 block text-[10px] font-semibold ${
                    profile?.emailVerifiedAt ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"
                  }`}>
                    {profile?.emailVerifiedAt ? "Terverifikasi" : "Belum terverifikasi"}
                  </span>
                </dd>
              </div>
            </dl>
            <p className="border-t border-[var(--seller-rule)] px-4 py-3 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Email hanya dipakai untuk login dan verifikasi. Data ini tidak ditampilkan ke publik.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
