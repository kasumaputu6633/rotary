export const listingCategoryGroups = [
  {
    name: "Rumah Tangga",
    icon: "lucide:sofa",
    subcategories: ["Furniture", "Ruang Tamu & Keluarga", "Dekorasi", "Kamar Tidur", "Peralatan Dapur", "Laundry"],
  },
  {
    name: "Elektronik",
    icon: "lucide:monitor-smartphone",
    subcategories: ["Laptop & Komputer", "Handphone", "Audio", "Aksesoris Elektronik", "Peralatan Elektronik"],
  },
  {
    name: "Buku",
    icon: "lucide:book-open",
    subcategories: ["Novel", "Buku Anak", "Pendidikan", "Komik", "Majalah"],
  },
  {
    name: "Fashion",
    icon: "lucide:shirt",
    subcategories: ["Pakaian Pria", "Pakaian Wanita", "Sepatu", "Tas", "Aksesoris"],
  },
  {
    name: "Olahraga",
    icon: "lucide:dumbbell",
    subcategories: ["Alat Olahraga", "Sepeda", "Outdoor", "Sepatu Olahraga"],
  },
  {
    name: "Mainan",
    icon: "lucide:puzzle",
    subcategories: ["Mainan Anak", "Boneka", "Board Game", "Koleksi"],
  },
] as const;

export const listingCategories = listingCategoryGroups.map((category) => category.name);
export const listingSubcategories = listingCategoryGroups.flatMap((category) => category.subcategories);
