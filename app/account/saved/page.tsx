import { Icon } from "@iconify/react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getRecentWasteLocations, getSavedWasteLocations } from "@/lib/waste";
import { AccountPageHeader, AccountPanel, AccountSecondaryLink } from "../_components/AccountUi";
import { SavedLocationCard } from "./_components/SavedLocationCard";

export default async function AccountSavedLocationsPage() {
  const user = await requireRole("user");
  const [saved, recent] = await Promise.all([
    getSavedWasteLocations(user.id),
    getRecentWasteLocations(user.id),
  ]);

  return (
    <div className="grid gap-5">
      <AccountPageHeader
        icon="lucide:bookmark"
        title="Lokasi Tersimpan"
        description="Lokasi penampung limbah yang kamu simpan dan terakhir kamu lihat di peta Rotary."
        actions={
          <AccountSecondaryLink href="/waste" icon="lucide:map">
            Buka Peta Limbah
          </AccountSecondaryLink>
        }
      />

      <AccountPanel title="Tersimpan" description="Lokasi yang kamu tandai untuk dilihat kembali.">
        {saved.length === 0 ? (
          <div className="grid min-h-[220px] place-items-center px-5 py-10 text-center">
            <div>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[10px] bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
                <Icon icon="lucide:bookmark" width={25} height={25} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold">Belum ada lokasi tersimpan</h2>
              <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-[var(--seller-muted)]">
                Tekan tombol Simpan pada detail lokasi di peta untuk menyimpannya di sini.
              </p>
              <Link
                href="/waste"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white transition hover:brightness-110"
              >
                <Icon icon="lucide:map" width={15} height={15} aria-hidden="true" />
                Jelajahi Peta Limbah
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {saved.map((location) => (
              <SavedLocationCard key={location.id} location={location} removable />
            ))}
          </div>
        )}
      </AccountPanel>

      {recent.length > 0 && (
        <AccountPanel title="Terakhir dilihat" description="Lokasi yang baru saja kamu buka di peta.">
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {recent.map((location) => (
              <SavedLocationCard key={location.id} location={location} />
            ))}
          </div>
        </AccountPanel>
      )}
    </div>
  );
}
