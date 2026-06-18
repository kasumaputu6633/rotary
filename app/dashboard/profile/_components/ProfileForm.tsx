"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction } from "../../actions";

type DefaultValues = {
  name?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
};

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-[var(--seller-ink)]">
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-[var(--seller-muted)]">{children}</p>;
}

export function ProfileForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Profil berhasil disimpan.");
        router.refresh();
      } catch {
        toast.error("Gagal menyimpan profil. Coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 p-4">
      <div className="grid gap-1.5">
        <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultValues.name ?? ""}
          placeholder="Nama kamu"
          maxLength={255}
          className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <FieldHint>Ditampilkan sebagai nama pemilik listing di marketplace.</FieldHint>
      </div>

      <div className="grid gap-1.5">
        <FieldLabel htmlFor="whatsapp">Nomor WhatsApp</FieldLabel>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          defaultValue={defaultValues.whatsapp ?? ""}
          placeholder="Contoh: 08123456789"
          maxLength={20}
          className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <FieldHint>Opsional. Jika diisi, tombol WhatsApp akan muncul di halaman barangmu.</FieldHint>
      </div>

      <div className="grid gap-1.5">
        <FieldLabel htmlFor="bio">Bio lapak</FieldLabel>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultValues.bio ?? ""}
          placeholder="Ceritakan sedikit tentang barang yang kamu jual atau donasikan…"
          maxLength={280}
          rows={4}
          className="resize-none rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 py-2.5 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)]"
        />
        <FieldHint>Maks. 280 karakter. Tampil di halaman profil lapakmu.</FieldHint>
      </div>

      <div className="flex justify-end border-t border-[var(--seller-rule)] pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--seller-accent)] px-5 text-[13px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
