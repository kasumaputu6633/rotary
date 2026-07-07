import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { listings, listingImages } from "@/db/schema";
import { verifyRenewToken } from "@/lib/listings";
import { eq, asc } from "drizzle-orm";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";

type RenewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Perpanjang Listing | Rotary",
    description: "Perpanjang durasi aktif listing barang bekas di marketplace Rotary.",
  };
}

export default async function RenewListingPage({ params, searchParams }: RenewPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  // 1. Cari data listing dan gambar utamanya
  const [listing, image] = await Promise.all([
    db.query.listings.findFirst({
      where: eq(listings.id, id),
    }),
    db.query.listingImages.findFirst({
      where: eq(listingImages.listingId, id),
      orderBy: asc(listingImages.sortOrder),
    })
  ]);

  let error: string | null = null;
  let success = false;

  if (!listing) {
    error = "Listing tidak ditemukan di database.";
  } else if (!token) {
    error = "Token verifikasi tidak disertakan.";
  } else {
    // 2. Validasi token
    const isValid = verifyRenewToken(id, token);
    if (!isValid) {
      error = "Tautan perpanjangan tidak valid atau sudah kedaluwarsa.";
    } else {
      // 3. Proses pembaruan listing (updatedAt = now, verificationSentAt = null, reactivate jika inactive)
      try {
        await db
          .update(listings)
          .set({
            updatedAt: new Date(),
            verificationSentAt: null,
            status: listing.status === "inactive" ? "active" : listing.status,
          })
          .where(eq(listings.id, id));
        success = true;
      } catch {
        error = "Gagal memperbarui listing di database. Silakan coba lagi beberapa saat lagi.";
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[440px] bg-white border border-[#bcbcbc] rounded-[26px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] px-6 py-8 flex flex-col items-center">
          {success && listing ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eefaf2] text-[#2f7d49] mb-5">
                <Icon icon="lucide:check-circle" width={28} height={28} aria-hidden="true" />
              </span>

              <h1 className="font-open-sauce font-semibold text-[22px] text-black text-center">
                Listing Diperpanjang!
              </h1>
              
              <p className="font-open-sauce text-[13px] text-[#505050] text-center mt-3 leading-relaxed">
                Terima kasih atas konfirmasi Anda. Listing Anda kini telah aktif kembali untuk 30 hari ke depan.
              </p>

              {/* Box Preview Barang */}
              <div className="w-full mt-6 rounded-lg border border-[#e4e8ef] bg-[#f8fafc] p-3 flex gap-3 text-left">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px] border border-[#e4e8ef] bg-[#f4f6f8] flex items-center justify-center text-[#9aa7b8]">
                  {image?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon icon="lucide:image" width={20} height={20} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1 font-open-sauce">
                  <p className="text-[13px] font-semibold text-[#1f2937] truncate">{listing.title}</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">{listing.category}</p>
                  <span className="inline-flex items-center gap-1 rounded bg-[#eefaf2] px-1.5 py-0.5 text-[9px] font-semibold text-[#2f7d49] mt-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2f7d49]" />
                    Aktif
                  </span>
                </div>
              </div>

              <div className="mt-8 w-full flex flex-col gap-2.5">
                <Link
                  href={`/products/${listing.slug}`}
                  className="flex w-full min-h-11 items-center justify-center rounded-lg bg-[#17458f] text-white text-[13px] font-semibold transition hover:brightness-95 shadow-[0_4px_12px_rgba(23,69,143,0.15)] font-open-sauce"
                >
                  Lihat Listing Barang
                </Link>
                <Link
                  href="/dashboard/listings"
                  className="flex w-full min-h-11 items-center justify-center rounded-lg border border-[#bcbcbc] bg-white text-[#17458f] text-[13px] font-semibold transition hover:bg-slate-50 font-open-sauce"
                >
                  Ke Seller Center Dashboard
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf2f2] text-[#ef4444] mb-5">
                <Icon icon="lucide:alert-circle" width={28} height={28} aria-hidden="true" />
              </span>

              <h1 className="font-open-sauce font-semibold text-[22px] text-black text-center">
                Gagal Memperbarui
              </h1>

              <p className="font-open-sauce text-[13px] text-[#ef4444] text-center mt-3 bg-[#fdf2f2] rounded-lg p-3 border border-[#fde8e8] w-full">
                {error}
              </p>

              <p className="font-open-sauce text-[12px] text-[#505050] text-center mt-4 leading-relaxed">
                Silakan hubungi admin Rotary atau perpanjang secara manual dari halaman dashboard Seller Center Anda.
              </p>

              <div className="mt-8 w-full">
                <Link
                  href="/dashboard/listings"
                  className="flex w-full min-h-11 items-center justify-center rounded-lg bg-[#17458f] text-white text-[13px] font-semibold transition hover:brightness-95 shadow-[0_4px_12px_rgba(23,69,143,0.15)] font-open-sauce"
                >
                  Masuk ke Seller Center
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
