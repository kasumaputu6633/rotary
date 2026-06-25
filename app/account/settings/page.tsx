import { Icon } from "@iconify/react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { isEmailVerified, isPhoneVerified } from "@/lib/account-verification";
import {
  AccountPageHeader,
  AccountPanel,
  AccountSecondaryLink,
  AccountStatusBadge,
} from "../_components/AccountUi";
import { AccountProfileForm } from "./_components/AccountProfileForm";
import { AccountSettingsTabs, type AccountSettingsTab } from "./_components/AccountSettingsTabs";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { DevicesSettings } from "./_components/DevicesSettings";
import { EmailVerificationCard } from "./_components/EmailVerificationCard";
import { LoginActivityList } from "./_components/LoginActivityList";
import { PhoneVerificationCard } from "./_components/PhoneVerificationCard";
import {
  SecuritySectionNav,
  type SecuritySection,
} from "./_components/SecuritySectionNav";
import { TwoFactorSettings } from "./_components/TwoFactorSettings";
import { getAccountSecurityData } from "./security-actions";
import { redirect } from "next/navigation";

type AccountSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeTab(value: string | string[] | undefined): AccountSettingsTab {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab === "password") return "security";
  if (tab === "contact" || tab === "security") return tab;
  return "profile";
}

function normalizeSecuritySection(value: string | string[] | undefined): SecuritySection {
  const section = Array.isArray(value) ? value[0] : value;
  if (section === "two-factor" || section === "devices" || section === "activity") return section;
  return "password";
}

export default async function AccountSettingsPage({
  searchParams,
}: AccountSettingsPageProps) {
  const user = await requireRole("user");
  const params = await searchParams;
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  if (requestedTab === "notifications") redirect("/account/notifications");
  const activeTab = normalizeTab(params.tab);
  const activeSecuritySection = normalizeSecuritySection(params.section);
  const emailVerified = isEmailVerified(user);
  const phoneVerified = isPhoneVerified(user);
  const sellerReady = emailVerified && phoneVerified;
  const securityData = activeTab === "security" ? await getAccountSecurityData() : null;

  return (
    <div className="grid gap-5">
      <AccountPageHeader
        icon="lucide:settings-2"
        title="Pengaturan Akun"
        description="Kelola identitas, foto, kontak, dan keamanan akun Rotary dari satu tempat."
        actions={
          activeTab === "profile" ? (
            <AccountSecondaryLink href="/dashboard/profile" icon="lucide:store">
              Atur Profil Lapak
            </AccountSecondaryLink>
          ) : activeTab === "contact" ? (
            <AccountStatusBadge tone={sellerReady ? "success" : "warning"}>
              {sellerReady ? "Siap berjualan" : "Verifikasi belum lengkap"}
            </AccountStatusBadge>
          ) : activeTab === "security" ? (
            <AccountStatusBadge tone={user.twoFactorEnabled ? "success" : "warning"}>
              {user.twoFactorEnabled ? "2FA aktif" : "2FA belum aktif"}
            </AccountStatusBadge>
          ) : undefined
        }
      />

      <AccountPanel>
        <AccountSettingsTabs activeTab={activeTab} contactComplete={sellerReady} />

        {activeTab === "profile" ? (
          <div>
            <div className="border-b border-[var(--seller-rule)] px-4 py-4 sm:px-5">
              <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">Profil pribadi</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
                Informasi identitas akun. Nama lapak tetap dikelola terpisah di Seller Center.
              </p>
            </div>
            <AccountProfileForm
              defaultAvatarUrl={user.avatarUrl}
              defaultFullName={user.fullName ?? ""}
            />
          </div>
        ) : activeTab === "contact" ? (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="min-w-0 xl:border-r xl:border-[var(--seller-rule)]">
              <div className="border-b border-[var(--seller-rule)] px-4 py-4 sm:px-5">
                <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">Kontak dan verifikasi</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
                  Email dan nomor HP disimpan privat serta tidak ditampilkan kepada pengguna lain.
                </p>
              </div>
              <EmailVerificationCard email={user.email} verified={emailVerified} />
              <PhoneVerificationCard phone={user.phone} verified={phoneVerified} />
            </div>

            <aside className="bg-[var(--seller-surface-2)] p-4 sm:p-5">
              <div className="rounded-[8px] border border-[var(--seller-rule)] bg-white">
                <div className="border-b border-[var(--seller-rule)] p-4">
                  <h2 className="text-[14px] font-semibold text-[var(--seller-ink)]">Akses berjualan</h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                    Selesaikan kedua verifikasi sebelum mengelola listing.
                  </p>
                </div>
                <div className="divide-y divide-[var(--seller-rule)] px-4">
                  {[
                    { complete: emailVerified, label: "Email terverifikasi" },
                    { complete: phoneVerified, label: "Nomor HP terverifikasi" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 py-3.5">
                      <Icon
                        icon={item.complete ? "lucide:circle-check" : "lucide:circle"}
                        width={17}
                        height={17}
                        className={item.complete ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"}
                        aria-hidden="true"
                      />
                      <span className="text-[12px] font-semibold text-[var(--seller-ink)]">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--seller-rule)] p-4">
                  {sellerReady ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white transition hover:brightness-110"
                    >
                      <Icon icon="lucide:store" width={15} height={15} aria-hidden="true" />
                      Buka Seller Center
                    </Link>
                  ) : (
                    <div className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-surface-2)] px-4 text-[12px] font-semibold text-[var(--seller-muted)]">
                      <Icon icon="lucide:lock-keyhole" width={15} height={15} aria-hidden="true" />
                      Lengkapi verifikasi dahulu
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : activeTab === "security" && securityData ? (
          <div>
            <div className="border-b border-[var(--seller-rule)] px-4 py-4 sm:px-5">
              <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">
                Keamanan akun
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
                Kelola kata sandi, verifikasi dua langkah, perangkat, dan riwayat login.
              </p>
            </div>
            <SecuritySectionNav
              activeSection={activeSecuritySection}
              twoFactorEnabled={user.twoFactorEnabled}
            />
            {activeSecuritySection === "password" ? (
              <div>
                <div className="border-b border-[var(--seller-rule)] px-4 py-4 sm:px-5">
                  <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">
                    {user.passwordHash ? "Ubah kata sandi" : "Buat kata sandi"}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                    Gunakan kata sandi yang kuat dan berbeda dari kata sandi akun lainnya.
                  </p>
                </div>
                <ChangePasswordForm hasPassword={Boolean(user.passwordHash)} />
              </div>
            ) : activeSecuritySection === "two-factor" ? (
              <TwoFactorSettings
                email={user.email}
                enabled={user.twoFactorEnabled}
                hasPassword={Boolean(user.passwordHash)}
                recoveryCodeCount={securityData.recoveryCodeCount}
              />
            ) : activeSecuritySection === "devices" ? (
              <DevicesSettings
                currentSessionId={securityData.currentSessionId}
                devices={securityData.devices}
                sessions={securityData.sessions}
              />
            ) : (
              <LoginActivityList activities={securityData.activities} />
            )}
          </div>
        ) : (
          null
        )}
      </AccountPanel>
    </div>
  );
}
