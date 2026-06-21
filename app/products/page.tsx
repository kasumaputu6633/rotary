import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import ProductCard from "@/app/_components/ProductCard";
import { getSessionUserId } from "@/lib/auth";
import { listingCategoryGroups } from "@/lib/listing-taxonomy";
import {
  getPublicListingCategoryCounts,
  getPublicListings,
  getPublicListingsCount,
  type PublicListingSort,
} from "@/lib/listings";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 18;
const sortOptions: { value: PublicListingSort; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Paling dilihat" },
  { value: "price-low", label: "Harga terendah" },
  { value: "price-high", label: "Harga tertinggi" },
];

export const metadata: Metadata = {
  title: "Marketplace Barang Bekas | Rotary",
  description: "Cari barang bekas layak pakai yang dijual atau didonasikan melalui marketplace Rotary.",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeSort(value: string | undefined): PublicListingSort {
  return sortOptions.some((option) => option.value === value) ? (value as PublicListingSort) : "newest";
}

function normalizeMode(value: string | undefined): "all" | "sale" | "donation" {
  return value === "sale" || value === "donation" ? value : "all";
}

function buildProductsHref(
  current: {
    q: string;
    category: string;
    mode: string;
    minPrice: string;
    maxPrice: string;
    sort: PublicListingSort;
  },
  patch: Partial<Record<"q" | "category" | "mode" | "minPrice" | "maxPrice" | "sort" | "page", string | number | null>>,
) {
  const params = new URLSearchParams();
  const next = { ...current, ...patch };

  if (next.q) params.set("q", String(next.q));
  if (next.category) params.set("category", String(next.category));
  if (next.mode && next.mode !== "all") params.set("mode", String(next.mode));
  if (next.minPrice) params.set("minPrice", String(next.minPrice));
  if (next.maxPrice) params.set("maxPrice", String(next.maxPrice));
  if (next.sort && next.sort !== "newest") params.set("sort", String(next.sort));
  if (next.page && Number(next.page) > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const userId = await getSessionUserId();
  const q = firstParam(params.q)?.trim() ?? "";
  const category = firstParam(params.category)?.trim() ?? "";
  const mode = normalizeMode(firstParam(params.mode));
  const minPriceInput = firstParam(params.minPrice)?.trim() ?? "";
  const maxPriceInput = firstParam(params.maxPrice)?.trim() ?? "";
  const minPrice = parsePositiveNumber(minPriceInput);
  const maxPrice = parsePositiveNumber(maxPriceInput);
  const sort = normalizeSort(firstParam(params.sort));
  const page = Math.max(Number(firstParam(params.page) ?? 1) || 1, 1);
  const query = {
    q,
    category,
    mode,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: PAGE_SIZE,
    userId,
  };

  const [products, totalProducts, categoryCounts] = await Promise.all([
    getPublicListings(query),
    getPublicListingsCount(query),
    getPublicListingCategoryCounts(),
  ]);
  const totalPages = Math.max(Math.ceil(totalProducts / PAGE_SIZE), 1);
  const current = { q, category, mode, minPrice: minPriceInput, maxPrice: maxPriceInput, sort };
  const categoryCountMap = new Map(categoryCounts.map((item) => [item.category, item.count]));
  const start = totalProducts === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalProducts);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="border-b border-[#e5e7eb] bg-[#f8fafc]">
          <div className="mx-auto grid max-w-[1728px] gap-5 px-8 py-8 lg:px-40 lg:py-10">
            <nav className="flex items-center gap-2 font-poppins text-[12px]" aria-label="Breadcrumb">
              <Link href="/" className="text-[#17458f] hover:underline">Home</Link>
              <Icon icon="lucide:chevron-right" className="text-[#f7a81b]" aria-hidden="true" />
              <span className="text-black">Marketplace</span>
            </nav>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <p className="font-poppins text-[12px] font-semibold uppercase tracking-[0.08em] text-[#17458f]">Barang bekas layak pakai</p>
                <h1 className="mt-2 font-roboto-serif text-[30px] font-semibold leading-tight text-black md:text-[38px]">
                  Marketplace Rotary
                </h1>
                <p className="mt-2 max-w-2xl font-poppins text-[14px] leading-relaxed text-[#5f6370]">
                  Telusuri barang yang dijual atau didonasikan langsung oleh pengguna. Deal, pengiriman, dan penjemputan disepakati manual antar pengguna.
                </p>
              </div>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f7a81b] px-4 font-poppins text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(247,168,27,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e89a14]"
              >
                <Icon icon="lucide:package-plus" width={15} height={15} aria-hidden="true" />
                Unggah Barang
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1728px] gap-7 px-8 py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-40 lg:py-10">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-lg border border-[#d7dde7] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-poppins text-[15px] font-semibold text-black">Filter</h2>
                <Link href="/products" className="font-poppins text-[11px] font-semibold text-[#17458f] hover:underline">
                  Reset
                </Link>
              </div>

              <div className="mt-5">
                <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Mode</p>
                <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-[#f4f6f8] p-1">
                  {[
                    ["all", "Semua"],
                    ["sale", "Dijual"],
                    ["donation", "Donasi"],
                  ].map(([value, label]) => (
                    <Link
                      key={value}
                      href={buildProductsHref(current, { mode: value, page: null })}
                      className={`flex h-8 items-center justify-center rounded-md font-poppins text-[11px] font-semibold transition ${
                        mode === value ? "bg-white text-[#17458f] shadow-sm" : "text-[#6b7280] hover:text-[#17458f]"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Kategori</p>
                <div className="mt-2 grid gap-1.5">
                  <Link
                    href={buildProductsHref(current, { category: null, page: null })}
                    className={`flex min-h-9 items-center justify-between rounded-lg px-3 font-poppins text-[12px] transition ${
                      !category ? "bg-[#17458f] text-white" : "text-black hover:bg-[#eef6ff] hover:text-[#17458f]"
                    }`}
                  >
                    <span>Semua kategori</span>
                    <span>{categoryCounts.reduce((sum, item) => sum + item.count, 0)}</span>
                  </Link>
                  {listingCategoryGroups.map((item) => {
                    const isActive = category === item.name;
                    return (
                      <Link
                        key={item.name}
                        href={buildProductsHref(current, { category: item.name, page: null })}
                        className={`flex min-h-9 items-center justify-between gap-2 rounded-lg px-3 font-poppins text-[12px] transition ${
                          isActive ? "bg-[#17458f] text-white" : "text-black hover:bg-[#eef6ff] hover:text-[#17458f]"
                        }`}
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Icon icon={item.icon} width={14} height={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span>{categoryCountMap.get(item.name) ?? 0}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <form action="/products" className="mt-6 grid gap-3">
                {q && <input type="hidden" name="q" value={q} />}
                {category && <input type="hidden" name="category" value={category} />}
                {mode !== "all" && <input type="hidden" name="mode" value={mode} />}
                {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
                <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Rentang Harga</p>
                <input
                  name="minPrice"
                  inputMode="numeric"
                  defaultValue={minPriceInput}
                  placeholder="Minimum"
                  className="h-10 rounded-lg border border-[#c5cbd6] px-3 font-poppins text-[12px] outline-none focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                />
                <input
                  name="maxPrice"
                  inputMode="numeric"
                  defaultValue={maxPriceInput}
                  placeholder="Maksimum"
                  className="h-10 rounded-lg border border-[#c5cbd6] px-3 font-poppins text-[12px] outline-none focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                />
                <button type="submit" className="h-9 rounded-lg bg-[#17458f] font-poppins text-[12px] font-semibold text-white hover:bg-[#123a7a]">
                  Terapkan harga
                </button>
              </form>
            </div>
          </aside>

          <section className="min-w-0">
            <form action="/products" className="grid gap-3 rounded-lg border border-[#d7dde7] bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)] md:grid-cols-[minmax(0,1fr)_190px_auto]">
              {category && <input type="hidden" name="category" value={category} />}
              {mode !== "all" && <input type="hidden" name="mode" value={mode} />}
              {minPriceInput && <input type="hidden" name="minPrice" value={minPriceInput} />}
              {maxPriceInput && <input type="hidden" name="maxPrice" value={maxPriceInput} />}
              <label className="relative block">
                <Icon icon="lucide:search" width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" aria-hidden="true" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari barang, kategori, atau lokasi"
                  className="h-10 w-full rounded-lg border border-[#c5cbd6] pl-9 pr-3 font-poppins text-[13px] outline-none focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                />
              </label>
              <select
                name="sort"
                defaultValue={sort}
                className="h-10 rounded-lg border border-[#c5cbd6] bg-white px-3 font-poppins text-[12px] font-semibold text-[#17458f] outline-none focus:border-[#f7a81b] focus:ring-2 focus:ring-[#fff2d6]"
                aria-label="Urutkan listing"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f7a81b] px-4 font-poppins text-[12px] font-semibold text-white hover:bg-[#e89a14]">
                <Icon icon="lucide:sliders-horizontal" width={15} height={15} aria-hidden="true" />
                Terapkan
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-poppins">
              <p className="text-[13px] text-[#5f6370]">
                {totalProducts > 0 ? `Menampilkan ${start}-${end} dari ${totalProducts} listing` : "Tidak ada listing yang cocok"}
              </p>
              {(q || category || mode !== "all" || minPriceInput || maxPriceInput || sort !== "newest") && (
                <div className="flex flex-wrap gap-2">
                  {q && <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold text-[#17458f]">Cari: {q}</span>}
                  {category && <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold text-[#17458f]">{category}</span>}
                  {mode !== "all" && <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-semibold text-[#17458f]">{mode === "sale" ? "Dijual" : "Didonasi"}</span>}
                </div>
              )}
            </div>

            {products.length > 0 ? (
              <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#17458f] shadow-sm">
                  <Icon icon="lucide:search-x" width={22} height={22} aria-hidden="true" />
                </div>
                <p className="mt-4 font-poppins text-[15px] font-semibold text-black">Belum ada barang yang cocok</p>
                <p className="mt-2 font-poppins text-[13px] text-[#6b7280]">Coba kurangi filter atau cari dengan kata kunci lain.</p>
                <Link href="/products" className="mt-5 inline-flex h-10 items-center rounded-full bg-[#f7a81b] px-5 font-poppins text-[12px] font-semibold text-white">
                  Reset Filter
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-9 flex flex-wrap items-center justify-center gap-2 font-poppins" aria-label="Pagination produk">
                <Link
                  href={buildProductsHref(current, { page: Math.max(page - 1, 1) })}
                  aria-disabled={page <= 1}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12px] font-semibold ${
                    page <= 1 ? "pointer-events-none border-[#e5e7eb] text-[#9ca3af]" : "border-[#cbd5e1] text-[#17458f] hover:bg-[#eef6ff]"
                  }`}
                >
                  <Icon icon="lucide:chevron-left" width={14} height={14} aria-hidden="true" />
                  Sebelumnya
                </Link>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1)
                  .map((item, index, pages) => {
                    const previous = pages[index - 1];
                    return (
                      <span key={item} className="inline-flex items-center gap-2">
                        {previous && item - previous > 1 && <span className="text-[12px] text-[#9ca3af]">...</span>}
                        <Link
                          href={buildProductsHref(current, { page: item })}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-[12px] font-semibold ${
                            item === page ? "bg-[#17458f] text-white" : "border border-[#cbd5e1] text-[#17458f] hover:bg-[#eef6ff]"
                          }`}
                        >
                          {item}
                        </Link>
                      </span>
                    );
                  })}
                <Link
                  href={buildProductsHref(current, { page: Math.min(page + 1, totalPages) })}
                  aria-disabled={page >= totalPages}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12px] font-semibold ${
                    page >= totalPages ? "pointer-events-none border-[#e5e7eb] text-[#9ca3af]" : "border-[#cbd5e1] text-[#17458f] hover:bg-[#eef6ff]"
                  }`}
                >
                  Berikutnya
                  <Icon icon="lucide:chevron-right" width={14} height={14} aria-hidden="true" />
                </Link>
              </nav>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
