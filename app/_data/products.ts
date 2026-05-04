export type ProductStatus = "Dijual" | "Didonasi";

export type ProductSummary = {
  slug: string;
  title: string;
  price: string;
  status: ProductStatus;
  location: string;
  tone: string;
  isSale: boolean;
  category: string;
  condition: string;
  weight: string;
  sellerName: string;
  sellerSince: string;
};

const productPool = [
  "Sepeda Anak Bekas Layak Pakai",
  "Rak Buku Kayu Minimalis",
  "Tas Ransel Sekolah Biru",
  "Kipas Angin Meja Kecil",
  "Paket Buku Cerita Anak",
  "Lampu Belajar Putih",
  "Helm Sepeda Anak",
  "Meja Lipat Portable",
  "Boneka Teddy Bear",
  "Sneakers Hitam Bekas",
  "Pot Tanaman Keramik",
  "Kamera Digital Compact",
  "Kursi Plastik Lipat",
  "Jam Dinding Klasik",
  "Set Piring Keramik",
  "Mainan Edukasi Balok",
  "Keyboard Komputer USB",
  "Jaket Hoodie Abu",
  "Botol Minum Stainless",
  "Bantal Sofa Motif",
  "Kompor Portable Mini",
  "Printer Inkjet Bekas",
  "Gitar Akustik Pemula",
  "Rice Cooker Kecil",
];

const locations = ["Denpasar Barat", "Kuta Utara", "Gianyar", "Sanur", "Tabanan", "Ubud", "Badung", "Jimbaran", "Sukawati", "Canggu", "Denpasar Timur", "Mengwi"];
const salePrices = ["Rp. 55.000", "Rp. 75.000", "Rp. 90.000", "Rp. 125.000", "Rp. 180.000", "Rp. 250.000", "Rp. 350.000"];
const tones = ["bg-[#f4f6f8]", "bg-[#fff7e8]", "bg-[#eef6ff]", "bg-[#f0f7f2]", "bg-[#fff2f2]", "bg-[#f7f3ff]", "bg-[#edf7f0]"];
const conditions = ["Pemakaian ringan", "Sangat baik", "Normal", "Siap pakai", "Bekas layak pakai"];
const sellers = ["Dani Pingge", "Ayu Lestari", "Komang Arta", "Made Wira", "Putu Sari"];

export function slugifyProduct(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createProduct(index: number): ProductSummary {
  const title = productPool[index % productPool.length];
  const isSale = index % 3 === 1 || index % 5 === 0;

  return {
    slug: slugifyProduct(title),
    title,
    price: isSale ? salePrices[index % salePrices.length] : "Rp. 0",
    status: isSale ? "Dijual" : "Didonasi",
    location: locations[index % locations.length],
    tone: tones[index % tones.length],
    isSale,
    category: index % 2 === 0 ? "Olahraga" : "Rumah Tangga",
    condition: conditions[index % conditions.length],
    weight: `${(index % 8) + 1} kg`,
    sellerName: sellers[index % sellers.length],
    sellerSince: `Bergabung sejak ${2022 + (index % 4)}`,
  };
}

export function getProductBySlug(slug: string) {
  return productPool
    .map((_, index) => createProduct(index))
    .find((product) => product.slug === slug);
}

export function getRecommendedProducts(excludeSlug?: string, count = 12) {
  return Array.from({ length: productPool.length }, (_, index) => createProduct(index))
    .filter((product) => product.slug !== excludeSlug)
    .slice(0, count);
}
