export type SellerProfileData = {
  avatarUrl?: string | null;
  bio?: string | null;
  displayName?: string | null;
  name?: string | null;
  phone?: string | null;
};

export type ProfileChecklistItem = {
  complete: boolean;
  description: string;
  key: "name" | "displayName" | "avatar" | "phone" | "bio";
  label: string;
  publicNow: boolean;
};

export function getProfileChecklist(profile: SellerProfileData): ProfileChecklistItem[] {
  return [
    {
      key: "name",
      label: "Nama lengkap",
      description: "Identitas akun privat untuk kebutuhan administrasi.",
      complete: Boolean(profile.name?.trim()),
      publicNow: false,
    },
    {
      key: "displayName",
      label: "Nama tampilan",
      description: "Tampil di navbar dan informasi pemilik barang.",
      complete: Boolean(profile.displayName?.trim() || profile.name?.trim()),
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
      key: "phone",
      label: "Nomor HP terverifikasi",
      description: "Mengaktifkan tombol WhatsApp pada listing dan keamanan akun.",
      complete: Boolean(profile.phone?.trim()),
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

export function resolveDisplayName(profile: Pick<SellerProfileData, "displayName" | "name">) {
  return profile.displayName?.trim() || profile.name?.trim() || "Pengguna Rotary";
}

export function createDefaultDisplayName(fullName: string) {
  return fullName.trim().split(/\s+/)[0]?.slice(0, 80) || "Pengguna";
}
