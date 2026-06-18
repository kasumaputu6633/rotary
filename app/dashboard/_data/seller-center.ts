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
];

export const listingCategories = listingCategoryGroups.map((category) => category.name);
export const listingSubcategories = listingCategoryGroups.flatMap((category) => category.subcategories);

// Data dummy percakapan chat — belum terhubung ke DB
export const dummyConversations = [
  {
    name: "Ayu Lestari",
    listing: "Rak Buku Kayu Minimalis",
    preview: "Barangnya masih tersedia? Kalau cocok saya bisa ambil sore.",
    time: "10:28",
    unread: 2,
    active: true,
  },
  {
    name: "Made Wira",
    listing: "Paket Buku Cerita Anak",
    preview: "Saya tertarik untuk ambil donasinya minggu ini.",
    time: "09:14",
    unread: 1,
    active: false,
  },
  {
    name: "Komang Arta",
    listing: "Tas Ransel Sekolah Biru",
    preview: "Terima kasih, nanti saya kabari lagi.",
    time: "Kemarin",
    unread: 0,
    active: false,
  },
];

export const unreadChatCount = dummyConversations.reduce((sum, c) => sum + c.unread, 0);
