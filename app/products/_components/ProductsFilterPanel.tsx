import { Icon } from "@iconify/react";
import Link from "next/link";
import { listingCategoryGroups } from "@/lib/listing-taxonomy";
import type { PublicListingSort } from "@/lib/listings";

export type ProductsFilterState = {
  category: string;
  maxPrice: string;
  minPrice: string;
  mode: string;
  q: string;
  sort: PublicListingSort;
  subcategory: string;
};

type ProductsFilterPatch = Partial<
  Record<"category" | "maxPrice" | "minPrice" | "mode" | "page" | "q" | "sort" | "subcategory", string | number | null>
>;

export function buildProductsHref(current: ProductsFilterState, patch: ProductsFilterPatch) {
  const params = new URLSearchParams();
  const next = { ...current, ...patch };

  if (next.q) params.set("q", String(next.q));
  if (next.category) params.set("category", String(next.category));
  if (next.subcategory) params.set("subcategory", String(next.subcategory));
  if (next.mode && next.mode !== "all") params.set("mode", String(next.mode));
  if (next.minPrice) params.set("minPrice", String(next.minPrice));
  if (next.maxPrice) params.set("maxPrice", String(next.maxPrice));
  if (next.sort && next.sort !== "newest") params.set("sort", String(next.sort));
  if (next.page && Number(next.page) > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

type ProductsFilterPanelProps = {
  category: string;
  categoryCountMap: Map<string, number>;
  categoryCounts: { category: string; count: number }[];
  current: ProductsFilterState;
  maxPriceInput: string;
  minPriceInput: string;
  mode: "all" | "sale" | "donation";
  q: string;
  sort: PublicListingSort;
  subcategory: string;
};

export function ProductsFilterPanel({
  category,
  categoryCountMap,
  categoryCounts,
  current,
  maxPriceInput,
  minPriceInput,
  mode,
  q,
  sort,
  subcategory,
}: ProductsFilterPanelProps) {
  const activeCategory = listingCategoryGroups.find((item) => item.name === category);

  return (
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
            href={buildProductsHref(current, { category: null, subcategory: null, page: null })}
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
                href={buildProductsHref(current, { category: item.name, subcategory: null, page: null })}
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

      {activeCategory ? (
        <div className="mt-5">
          <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Subkategori</p>
          <div className="mt-2 grid gap-1.5">
            <Link
              href={buildProductsHref(current, { subcategory: null, page: null })}
              className={`flex min-h-9 items-center rounded-lg px-3 font-poppins text-[12px] transition ${
                !subcategory ? "bg-[#fff7e8] font-semibold text-[#17458f]" : "text-black hover:bg-[#fff7e8] hover:text-[#17458f]"
              }`}
            >
              Semua {activeCategory.name}
            </Link>
            {activeCategory.subcategories.map((item) => {
              const isActive = subcategory === item;
              return (
                <Link
                  key={item}
                  href={buildProductsHref(current, { subcategory: item, page: null })}
                  className={`flex min-h-9 items-center rounded-lg px-3 font-poppins text-[12px] transition ${
                    isActive ? "bg-[#fff7e8] font-semibold text-[#17458f]" : "text-black hover:bg-[#fff7e8] hover:text-[#17458f]"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <form action="/products" className="mt-6 grid gap-3">
        {q && <input type="hidden" name="q" value={q} />}
        {category && <input type="hidden" name="category" value={category} />}
        {subcategory && <input type="hidden" name="subcategory" value={subcategory} />}
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
  );
}
