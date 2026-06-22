import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Panel } from "../_components/SellerCenterUi";
import { ProfileForm } from "./_components/ProfileForm";

export default async function ProfilePage() {
  const user = await requireRole("user");

  const [profile] = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      bio: users.bio,
      whatsapp: users.whatsapp,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:user-round-cog"
        kicker="Lapak Saya"
        title="Profil Lapak"
        description="Informasi lapak yang tampil ke calon pembeli di halaman barangmu."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Edit profil">
          <ProfileForm
            defaultValues={{
              name: profile?.name,
              whatsapp: profile?.whatsapp,
              bio: profile?.bio,
              avatarUrl: profile?.avatarUrl,
            }}
          />
        </Panel>

        <aside className="grid content-start gap-4">
          <Panel title="Informasi akun">
            <div className="grid gap-2 p-4 text-[12px]">
              <div className="flex justify-between gap-3 rounded-[8px] bg-[var(--seller-surface-2)] px-3 py-2">
                <span className="text-[var(--seller-muted)]">Email</span>
                <span className="font-semibold text-[var(--seller-ink)]">{profile?.email ?? "-"}</span>
              </div>
              <div className="flex justify-between gap-3 rounded-[8px] bg-[var(--seller-surface-2)] px-3 py-2">
                <span className="text-[var(--seller-muted)]">Telepon akun</span>
                <span className="font-semibold text-[var(--seller-ink)]">{profile?.phone ?? "-"}</span>
              </div>
            </div>
            <p className="px-4 pb-4 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Email dan telepon akun dipakai untuk login/verifikasi dan tidak tampil sebagai kontak publik marketplace.
            </p>
          </Panel>

          <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] p-4">
            <p className="text-[13px] font-semibold text-[var(--seller-brand)]">Tentang profil lapak</p>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Profil ini membantu calon pembeli mengenal lapakmu sebelum deal. Foto profil dan nama tampil di halaman produk, sementara WhatsApp dipakai untuk kontak langsung.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
