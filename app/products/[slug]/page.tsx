import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import ProductCard from "@/app/_components/ProductCard";
import { getSessionUserId } from "@/lib/auth";
import { formatPrice, formatPublicLocation } from "@/lib/listing-format";
import { getListingImages, getPublicListingBySlug, getPublicListings, incrementListingView } from "@/lib/listings";
import ProductDetailExperience from "./_components/ProductDetailExperience";
import ProductInfoTabs from "./_components/ProductInfoTabs";
import ProductStickyNav from "./_components/ProductStickyNav";
import { ListingMap } from "./_components/ListingMap";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicListingBySlug(slug);

  return {
    title: product ? `${product.title} | Rotary` : "Detail Barang | Rotary",
    description: product ? `Detail ${product.title} di marketplace Rotary.` : "Detail barang marketplace Rotary.",
  };
}

function MapPlaceholder() {
  return (
    <div className="group relative h-30 overflow-hidden rounded-lg border border-[#cbd5e1] bg-[#edf3fb] transition-shadow hover:shadow-[0_10px_24px_rgba(23,69,143,0.12)]">
      <div className="absolute left-0 top-8 h-2 w-full rotate-[-8deg] bg-white/80" />
      <div className="absolute left-8 top-0 h-full w-2 rotate-[18deg] bg-white/70" />
      <div className="absolute bottom-6 left-0 h-2 w-full rotate-[7deg] bg-white/70" />
      <div className="absolute right-10 top-0 h-full w-2 rotate-[-16deg] bg-white/75" />
      <div className="absolute left-1/2 top-1/2 flex h-22 w-22 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#17458f]/35 bg-[#17458f]/20 text-[#17458f] transition-transform duration-300 group-hover:scale-105">
        <Icon icon="lucide:map-pinned" width={28} height={28} aria-hidden="true" />
      </div>
      <span className="absolute left-4 top-4 h-2 w-2 rounded-full bg-[#f7a81b]" />
      <span className="absolute bottom-5 right-5 h-2 w-2 rounded-full bg-[#48b461]" />
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const userId = await getSessionUserId();
  const product = await getPublicListingBySlug(slug, userId);

  if (!product) notFound();

  if (userId !== product.sellerId) {
    await incrementListingView(product.id);
  }

  const [images, recommendations] = await Promise.all([
    getListingImages(product.id),
    getPublicListings({ category: product.category, excludeSlug: product.slug, limit: 12, userId }),
  ]);
  const imageUrls = images.map((image) => image.imageUrl);
  const categoryHref = `/products?category=${encodeURIComponent(product.category)}`;
  const subcategoryHref = product.subcategory
    ? `${categoryHref}&subcategory=${encodeURIComponent(product.subcategory)}`
    : null;
  const publicLocation = formatPublicLocation(product.location);

  return (
    <>
      <Navbar />
      <ProductStickyNav hasRecommendations={recommendations.length > 0} title={product.title} />
      <main className="bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:py-8 xl:px-0">
          <nav className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap font-poppins text-[12px]" aria-label="Breadcrumb">
            <Link href="/" className="shrink-0 text-[#17458f] hover:underline">Home</Link>
            <Icon icon="lucide:chevron-right" className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
            <Link href={categoryHref} className="shrink-0 text-[#17458f] hover:underline">{product.category}</Link>
            {product.subcategory && subcategoryHref ? (
              <>
                <Icon icon="lucide:chevron-right" className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
                <Link href={subcategoryHref} className="shrink-0 text-[#17458f] hover:underline">{product.subcategory}</Link>
              </>
            ) : null}
            <Icon icon="lucide:chevron-right" className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
            <span className="min-w-0 truncate text-[#4b5563]">{product.title}</span>
          </nav>

          <ProductDetailExperience
            imageUrls={imageUrls}
            product={product}
            publicLocation={publicLocation}
            sellerWhatsapp={product.sellerWhatsapp}
          >
            <div className="min-w-0">
              <h1 className="font-poppins text-[19px] font-semibold leading-snug text-black md:text-[21px]">
                {product.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-poppins text-[12px] text-[#6b7280]">
                <span>{formatPrice(product.price, product.mode) === "Gratis" ? "Barang donasi" : "Barang dijual"}</span>
                {product.status === "reserved" ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[#cbd5e1]" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1 font-semibold text-[#17458f]">
                      <Icon icon="lucide:clock-3" width={13} height={13} aria-hidden="true" />
                      Sedang dipesan
                    </span>
                  </>
                ) : null}
                <span className="h-1 w-1 rounded-full bg-[#cbd5e1]" aria-hidden="true" />
                <span>Dilihat {product.viewCount ?? 0} kali</span>
                <span className="h-1 w-1 rounded-full bg-[#cbd5e1]" aria-hidden="true" />
                <span>{publicLocation}</span>
              </div>
              <p className="mt-4 font-poppins text-[28px] font-bold leading-none text-black md:text-[30px]">
                {formatPrice(product.price, product.mode)}
              </p>

              <div id="detail-produk" className="scroll-mt-[210px]">
                <ProductInfoTabs product={product} />
              </div>

              <div className="mt-7 border-t border-[#edf0f5] pt-5 font-poppins text-[13px] leading-relaxed text-black">
                <h2 className="mb-3 text-[20px] font-semibold leading-tight">Deskripsi</h2>
                <p className="whitespace-pre-line">{product.description || `${product.title} kondisi bekas siap pakai kembali. Mohon chat dulu untuk memastikan kondisi unit agar lebih aman.`}</p>
                <div className="mt-5 rounded-lg border border-[#17458f]/15 bg-[#eef6ff] p-3 text-[12px] text-[#4b5563]">
                  {product.status === "reserved"
                    ? "Barang ini sedang dipesan. Listing tetap ditampilkan sebagai informasi, tetapi kontak baru dijeda sampai pemilik memperbarui statusnya."
                    : "Rotary tidak memproses transaksi di dalam aplikasi. Chat pemilik barang untuk menyepakati harga, titik temu, pengiriman, atau penjemputan."}
                </div>
              </div>

              <section id="lokasi" className="mt-7 scroll-mt-[210px] border-t border-[#edf0f5] pt-5" aria-labelledby="listing-location-heading">
                <h2 id="listing-location-heading" className="font-poppins text-[18px] font-semibold text-black">Perkiraan Area</h2>
                <div className="mt-3 grid gap-3 rounded-lg border border-[#d8deea] bg-white p-3 md:grid-cols-[minmax(0,220px)_1fr]">
                  {product.latitude && product.longitude ? (
                    <ListingMap latitude={product.latitude} longitude={product.longitude} locationLabel={publicLocation} />
                  ) : (
                    <MapPlaceholder />
                  )}
                  <div className="font-poppins">
                    <p className="text-[14px] font-semibold text-black">{publicLocation}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">
                      Lokasi publik hanya menampilkan area kota/kabupaten. Alamat detail dibagikan langsung oleh pemilik saat chat, pengiriman, atau penjemputan.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </ProductDetailExperience>

          {recommendations.length > 0 && (
            <section id="rekomendasi" className="mt-10 scroll-mt-[210px] border-t border-[#e5e7eb] pt-8" aria-labelledby="recommendations-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-poppins text-[12px] font-semibold uppercase tracking-[0.08em] text-[#17458f]">Kategori {product.category}</p>
                  <h2 id="recommendations-heading" className="mt-1 font-poppins text-[22px] font-semibold text-black">
                    Barang serupa
                  </h2>
                </div>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#cbd5e1] px-3 font-poppins text-[12px] font-semibold text-[#17458f] hover:bg-[#eef6ff]"
                >
                  Lihat semua
                  <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(142px,1fr))] gap-x-3 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(158px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
                {recommendations.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
