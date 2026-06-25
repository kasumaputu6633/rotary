export type SellerProfileData = {
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  emailVerifiedAt?: Date | null;
  fullName?: string | null;
  shopName?: string | null;
  phone?: string | null;
  phoneVerifiedAt?: Date | null;
};

export type ProfileChecklistItem = {
  complete: boolean;
  description: string;
  key: "fullName" | "shopName" | "avatar" | "email" | "phone" | "bio";
  label: string;
  publicNow: boolean;
};

export function getProfileChecklist(profile: SellerProfileData): ProfileChecklistItem[] {
  return [
    {
      key: "fullName",
      label: "Nama lengkap",
      description: "Identitas akun privat untuk kebutuhan administrasi.",
      complete: Boolean(profile.fullName?.trim()),
      publicNow: false,
    },
    {
      key: "shopName",
      label: "Nama lapak",
      description: "Tampil di navbar dan informasi pemilik barang.",
      complete: Boolean(profile.shopName?.trim() || profile.fullName?.trim()),
      publicNow: true,
    },
    {
      key: "avatar",
      label: "Foto profil",
      description: "Membantu calon peminat mengenali pemilik listing.",
      complete: Boolean(profile.avatarUrl),
      publicNow: true,
    },
    {
      key: "email",
      label: "Email terverifikasi",
      description: "Diperlukan untuk keamanan akun dan akses berjualan.",
      complete: Boolean(profile.email?.trim() && profile.emailVerifiedAt),
      publicNow: false,
    },
    {
      key: "phone",
      label: "Nomor HP terverifikasi",
      description: "Mengaktifkan tombol WhatsApp pada listing dan keamanan akun.",
      complete: Boolean(profile.phone?.trim() && profile.phoneVerifiedAt),
      publicNow: true,
    },
    {
      key: "bio",
      label: "Bio lapak",
      description: "Disimpan untuk halaman profil publik pada tahap berikutnya.",
      complete: Boolean(profile.bio?.trim()),
      publicNow: false,
    },
  ];
}

export function getProfileCompletion(profile: SellerProfileData) {
  const checklist = getProfileChecklist(profile);
  const completedCount = checklist.filter((item) => item.complete).length;

  return {
    checklist,
    completedCount,
    missingCount: checklist.length - completedCount,
    percentage: Math.round((completedCount / checklist.length) * 100),
  };
}

export function resolveShopName(profile: Pick<SellerProfileData, "shopName" | "fullName">) {
  return profile.shopName?.trim() || profile.fullName?.trim() || "Pengguna Rotary";
}

export function createDefaultShopName(fullName: string) {
  return fullName.trim().split(/\s+/)[0]?.slice(0, 80) || "Pengguna";
}
