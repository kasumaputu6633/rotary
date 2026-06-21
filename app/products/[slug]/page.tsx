import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import ProductCard from "@/app/_components/ProductCard";
import { toggleFavoriteListingAction } from "@/app/dashboard/actions";
import { getSessionUserId } from "@/lib/auth";
import { formatPrice } from "@/lib/listing-format";
import { getListingImages, getPublicListingBySlug, getPublicListings } from "@/lib/listings";
import ProductContactActions from "./_components/ProductContactActions";
import ProductGallery from "./_components/ProductGallery";
import ProductInfoTabs from "./_components/ProductInfoTabs";
import { ListingMap } from "./_components/ListingMap";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const [images, recommendations] = await Promise.all([
    getListingImages(product.id),
    getPublicListings({ excludeSlug: product.slug, limit: 12, userId }),
  ]);
  const imageUrls = images.map((image) => image.imageUrl);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="mx-auto max-w-[1728px] px-8 py-8 lg:px-40 lg:py-10">
          <nav className="flex items-center gap-2 font-poppins text-[12px]" aria-label="Breadcrumb">
            <Link href="/" className="text-[#17458f] hover:underline">Home</Link>
            <Icon icon="lucide:chevron-right" className="text-[#f7a81b]" aria-hidden="true" />
            <span className="text-[#17458f]">{product.category}</span>
            <Icon icon="lucide:chevron-right" className="text-[#f7a81b]" aria-hidden="true" />
            <span className="text-black">{product.title}</span>
          </nav>

          <section className="mt-7 grid gap-8 lg:min-h-[760px] lg:grid-cols-[minmax(280px,420px)_minmax(320px,1fr)] xl:min-h-[680px] xl:grid-cols-[minmax(320px,430px)_minmax(360px,1fr)_360px]">
            <ProductGallery product={product} images={imageUrls} />

            <div className="min-w-0">
              <h1 className="font-poppins text-[24px] font-semibold leading-tight text-black md:text-[28px]">
                {product.title}
              </h1>
              <p className="mt-2 font-poppins text-[24px] font-semibold leading-none text-black md:text-[26px]">
                {formatPrice(product.price, product.mode)}
              </p>

              <ProductInfoTabs product={product} />

              <div className="mt-9 font-poppins text-[13px] leading-relaxed text-black">
                <h2 className="mb-3 text-[22px] font-semibold leading-tight">Deskripsi</h2>
                <p>{product.description || `${product.title} kondisi bekas siap pakai kembali. Mohon chat dulu untuk memastikan kondisi unit agar lebih aman.`}</p>
                <h3 className="mt-5 font-semibold">Penting</h3>
                <p>Rotary hanya menjadi tempat listing. Chat pemilik barang untuk menyepakati harga, titik temu, pengiriman, atau penjemputan di luar aplikasi.</p>
              </div>
            </div>

            <aside className="lg:col-span-2 xl:col-span-1">
              <div className="rounded-lg border border-[#cbd5e1] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] xl:sticky xl:top-6">
                {product.latitude && product.longitude ? (
                  <ListingMap latitude={product.latitude} longitude={product.longitude} locationLabel={product.location} />
                ) : (
                  <MapPlaceholder />
                )}

                <div className="mt-4 border-b border-[#bfc7d4] pb-4 font-poppins">
                  <p className="text-[13px] font-semibold text-black">{product.location}</p>
                  <p className="text-[12px] text-[#6b7280]">Perkiraan Lokasi</p>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5e7eb] text-[#6b7280]">
                    <Icon icon="lucide:user" width={22} height={22} aria-hidden="true" />
                  </div>
                  <div className="font-poppins">
                    <p className="text-[12px] text-black">Informasi Pemilik</p>
                    <p className="text-[13px] font-semibold text-black">{product.sellerName ?? "Pengguna Rotary"}</p>
                    <p className="text-[10px] text-[#9ca3af]">Listing aktif di Rotary</p>
                  </div>
                </div>

                <ProductContactActions product={product} sellerWhatsapp={product.sellerWhatsapp} />

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e5e7eb] pt-3">
                  <form action={toggleFavoriteListingAction.bind(null, product.id, product.slug)}>
                    <button type="submit" className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] font-poppins text-[12px] font-semibold text-[#17458f] hover:bg-[#fff7e8]">
                      <Icon icon="lucide:heart" width={15} height={15} className={product.isFavorite ? "text-[#ef476f]" : ""} aria-hidden="true" />
                      {product.isFavorite ? "Tersimpan" : "Favorit"}
                    </button>
                  </form>
                  <button type="button" className="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] font-poppins text-[12px] font-semibold text-[#17458f] hover:bg-[#eef6ff]">
                    <Icon icon="lucide:share-2" width={15} height={15} aria-hidden="true" />
                    Share
                  </button>
                </div>
              </div>
            </aside>
          </section>

          {recommendations.length > 0 && (
            <section className="mt-10 border-t border-[#bfc7d4] pt-9" aria-labelledby="recommendations-heading">
              <h2 id="recommendations-heading" className="font-poppins text-[22px] font-semibold text-black">
                Pilihan lainnya
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
