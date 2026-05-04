import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import ProductCard from "@/app/_components/ProductCard";
import { getProductBySlug, getRecommendedProducts } from "@/app/_data/products";
import ProductGallery from "./_components/ProductGallery";
import ProductInfoTabs from "./_components/ProductInfoTabs";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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

function ActionItem({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="group flex flex-1 items-center justify-center gap-1.5 border-r border-[#e5e7eb] py-2 font-poppins text-[11px] font-semibold text-[#6b7280] transition-colors last:border-r-0 hover:bg-[#fff7e8] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
    >
      <Icon icon={icon} width={17} height={17} className="transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
      {label}
    </button>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const recommendations = getRecommendedProducts(product.slug, 12);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="mx-auto max-w-[1728px] px-8 py-8 lg:px-40 lg:py-10">
          <nav className="flex items-center gap-2 font-poppins text-[12px]" aria-label="Breadcrumb">
            <Link href="/" className="text-[#17458f] hover:underline">Home</Link>
            <Icon icon="lucide:chevron-right" className="text-[#f7a81b]" aria-hidden="true" />
            <Link href="#" className="text-[#17458f] hover:underline">{product.category}</Link>
            <Icon icon="lucide:chevron-right" className="text-[#f7a81b]" aria-hidden="true" />
            <span className="text-black">Sepeda</span>
          </nav>

          <section className="mt-7 grid gap-8 lg:min-h-[760px] lg:grid-cols-[minmax(280px,420px)_minmax(320px,1fr)] xl:min-h-[680px] xl:grid-cols-[minmax(320px,430px)_minmax(360px,1fr)_360px]">
            <ProductGallery product={product} />

            <div className="min-w-0">
              <h1 className="font-poppins text-[24px] font-semibold leading-tight text-black md:text-[28px]">
                {product.title}
              </h1>
              <p className="mt-2 font-poppins text-[24px] font-semibold leading-none text-black md:text-[26px]">
                {product.price}
              </p>

              <ProductInfoTabs product={product} />

              <div className="mt-9 font-poppins text-[13px] leading-relaxed text-black">
                <h2 className="mb-3 text-[22px] font-semibold leading-tight">Deskripsi</h2>
                <p>{product.title} kondisi bekas siap pakai kembali. Mohon chat dulu untuk memastikan kondisi unit agar lebih aman.</p>
                <p className="mt-4">Kondisi barang ini bekas jadi mohon tidak berekspektasi terlalu tinggi. Kondisi tidak mungkin semulus barang baru, tetapi masih sangat layak dipakai.</p>
                <h3 className="mt-5 font-semibold">Penting</h3>
                <p>Perkiraan ongkir tergantung jarak. Chat penjual terlebih dahulu agar transaksi lebih pasti.</p>
              </div>
            </div>

            <aside className="lg:col-span-2 xl:col-span-1">
              <div className="rounded-lg border border-[#cbd5e1] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] xl:sticky xl:top-6">
                <MapPlaceholder />

                <div className="mt-4 border-b border-[#bfc7d4] pb-4 font-poppins">
                  <p className="text-[13px] font-semibold text-black">{product.location}, Bali</p>
                  <p className="text-[12px] text-[#6b7280]">Perkiraan Lokasi</p>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5e7eb] text-[#6b7280]">
                    <Icon icon="lucide:user" width={22} height={22} aria-hidden="true" />
                  </div>
                  <div className="font-poppins">
                    <p className="text-[12px] text-black">Informasi Penjual</p>
                    <p className="text-[13px] font-semibold text-black">{product.sellerName}</p>
                    <p className="text-[10px] text-[#9ca3af]">{product.sellerSince}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <button type="button" className="h-10 rounded-lg bg-[#f7a81b] font-poppins text-[13px] font-semibold text-black shadow-[0_8px_18px_rgba(247,168,27,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2">
                    Beli
                  </button>
                  <button type="button" className="h-10 rounded-lg border border-[#f7a81b] font-poppins text-[13px] font-semibold text-[#f7a81b] transition-all hover:-translate-y-0.5 hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2">
                    Tambahkan ke Keranjang
                  </button>
                </div>

                <p className="mt-6 text-center font-poppins text-[11px] font-semibold text-[#9ca3af]">
                  Masuk untuk membuat penawaran
                </p>

                <div className="mt-5 flex h-10 overflow-hidden rounded-lg border border-[#bfc7d4] font-poppins text-[13px]">
                  <span className="flex items-center border-r border-[#e5e7eb] px-3 font-semibold text-black">Rp</span>
                  <input className="min-w-0 flex-1 px-3 outline-none focus:bg-[#fffdf8]" placeholder="0" />
                  <button type="button" className="w-24 bg-[#f7a81b] font-semibold text-black transition-colors hover:bg-[#e89a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b]">
                    Tawar
                  </button>
                </div>

                <div className="mt-3 flex border-t border-[#e5e7eb]">
                  <ActionItem icon="lucide:message-square" label="Chat" />
                  <ActionItem icon="lucide:heart" label="Wishlist" />
                  <ActionItem icon="lucide:share-2" label="Share" />
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-10 border-t border-[#bfc7d4] pt-9" aria-labelledby="recommendations-heading">
            <h2 id="recommendations-heading" className="font-poppins text-[22px] font-semibold text-black">
              Pilihan lainnya
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {recommendations.map((item, index) => (
                <ProductCard key={`${item.slug}-${index}`} product={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
