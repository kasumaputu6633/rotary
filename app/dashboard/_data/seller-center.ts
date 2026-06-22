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
