"use client";

/* eslint-disable @next/next/no-img-element -- Blob preview URLs are local dan existing image URLs tidak bisa pakai next/image. */
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

const MAX_IMAGES = 4;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ExistingImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type PreviewImage = {
  file: File;
  id: string;
  size: number;
  url: string;
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ListingImagePicker({
  existingImages = [],
}: {
  existingImages?: ExistingImage[];
} = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const remainingExisting = existingImages.filter((img) => !deletedIds.includes(img.id));
  const totalSlotsTaken = remainingExisting.length + previews.length;
  const canAddMore = totalSlotsTaken < MAX_IMAGES;

  const defaultMessage = "Foto pertama akan menjadi cover. Kamu bisa menambah sampai 4 foto.";
  const [message, setMessage] = useState(
    existingImages.length > 0
      ? `${existingImages.length} foto tersimpan. Kamu bisa menambah hingga ${MAX_IMAGES - existingImages.length} foto baru.`
      : defaultMessage,
  );

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function syncInputFiles(files: File[]) {
    if (!inputRef.current) return;

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
  }

  function setFiles(files: File[], nextMessage?: string) {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));

    const nextPreviews = files.map((file, index) => ({
      file,
      id: `${file.name}-${file.lastModified}-${file.size}-${index}`,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    urlsRef.current = nextPreviews.map((preview) => preview.url);
    setPreviews(nextPreviews);
    syncInputFiles(files);
    setMessage(nextMessage ?? `${nextPreviews.length} dari ${MAX_IMAGES} foto dipilih. Foto pertama akan menjadi cover.`);
  }

  function openFileDialog() {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  function addFiles(files: File[]) {
    if (!files.length) return;

    const currentFiles = previews.map((preview) => preview.file);
    const validFiles = files.filter((file) => ACCEPTED_TYPES.has(file.type));
    const availableSlots = MAX_IMAGES - remainingExisting.length;
    const nextFiles = [...currentFiles, ...validFiles].slice(0, availableSlots);
    const skippedInvalid = validFiles.length !== files.length;
    const skippedLimit = currentFiles.length + validFiles.length > availableSlots;

    if (nextFiles.length === currentFiles.length) {
      setMessage("Format foto belum sesuai. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    let nextMessage = `${remainingExisting.length + nextFiles.length} dari ${MAX_IMAGES} foto dipilih.`;
    if (skippedLimit) nextMessage = `Maksimal ${MAX_IMAGES} foto. Beberapa foto tidak ditambahkan.`;
    if (skippedInvalid) nextMessage = "Beberapa file dilewati. Gunakan JPG, PNG, atau WEBP.";

    setFiles(nextFiles, nextMessage);
  }

  function removeExisting(id: string) {
    setDeletedIds((prev) => [...prev, id]);
    const next = existingImages.filter((img) => !deletedIds.includes(img.id) && img.id !== id);
    const total = next.length + previews.length;
    setMessage(total === 0 ? defaultMessage : `${total} dari ${MAX_IMAGES} foto tersimpan.`);
  }

  function removeFile(index: number) {
    const nextFiles = previews.filter((_, previewIndex) => previewIndex !== index).map((preview) => preview.file);
    setFiles(nextFiles, nextFiles.length === 0 ? "Foto pertama akan menjadi cover. Kamu bisa menambah sampai 4 foto." : undefined);
  }

  function resetInput() {
    setFiles([], "Foto pertama akan menjadi cover. Kamu bisa menambah sampai 4 foto.");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  return (
    <div
      className={`mt-4 grid gap-3 rounded-[8px] border border-dashed p-3 transition ${
        isDragging ? "border-[var(--seller-brand)] bg-[var(--seller-brand-soft)]" : "border-[var(--seller-accent)] bg-[var(--seller-accent-soft)]"
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        name="images"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleChange}
        className="sr-only"
      />

      {/* Hidden inputs untuk track foto existing yang dihapus */}
      {deletedIds.map((id) => (
        <input key={id} type="hidden" name="deleteImageIds" value={id} />
      ))}

      {totalSlotsTaken === 0 ? (
        <button
          type="button"
          onClick={openFileDialog}
          className={`flex min-h-52 w-full cursor-pointer items-center justify-center rounded-[8px] border border-dashed text-center transition ${
            isDragging ? "border-[var(--seller-brand)] bg-[var(--seller-surface)] text-[var(--seller-brand)]" : "border-[var(--seller-rule-strong)] bg-[var(--seller-surface)]/75 text-[var(--seller-muted)] hover:border-[var(--seller-brand)] hover:bg-[var(--seller-surface)]"
          }`}
        >
          <span>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]">
              <Icon icon="lucide:image-plus" width={24} height={24} aria-hidden="true" />
            </span>
            <span className="mt-3 block text-[12px] font-semibold text-[var(--seller-brand)]">Pilih atau Tarik Foto</span>
            <span className="mt-1 block text-[11px] text-[var(--seller-muted)]">JPG, PNG, WEBP. Maksimal 4 foto.</span>
          </span>
        </button>
      ) : null}

      {totalSlotsTaken > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {/* Foto existing dari DB */}
          {remainingExisting.map((img, index) => (
            <figure key={img.id} className="overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)]">
              <div className="relative aspect-square">
                <img src={img.imageUrl} alt={`Foto barang ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && previews.length === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-[var(--seller-brand)] px-2 py-1 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeExisting(img.id)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--seller-surface)]/95 text-[var(--seller-muted)] shadow-sm transition hover:bg-[var(--seller-accent-soft)] hover:text-[var(--seller-brand)]"
                  aria-label={`Hapus foto ${index + 1}`}
                >
                  <Icon icon="lucide:x" width={14} height={14} aria-hidden="true" />
                </button>
              </div>
              <figcaption className="flex items-center justify-between gap-2 px-2 py-2">
                <span className="text-[11px] font-semibold text-[var(--seller-ink)]">Foto {index + 1}</span>
                <span className="text-[10px] text-[var(--seller-muted)]">Tersimpan</span>
              </figcaption>
            </figure>
          ))}

          {/* Foto baru yang baru dipilih */}
          {previews.map((preview, index) => {
            const displayIndex = remainingExisting.length + index;
            const isFirstOverall = displayIndex === 0;
            return (
              <figure key={preview.id} className="overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)]">
                <div className="relative aspect-square">
                  <img src={preview.url} alt={`Foto baru ${index + 1}`} className="h-full w-full object-cover" />
                  {isFirstOverall ? (
                    <span className="absolute left-2 top-2 rounded-full bg-[var(--seller-brand)] px-2 py-1 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--seller-surface)]/95 text-[var(--seller-muted)] shadow-sm transition hover:bg-[var(--seller-accent-soft)] hover:text-[var(--seller-brand)]"
                    aria-label={`Hapus foto baru ${index + 1}`}
                  >
                    <Icon icon="lucide:x" width={14} height={14} aria-hidden="true" />
                  </button>
                </div>
                <figcaption className="flex items-center justify-between gap-2 px-2 py-2">
                  <span className="text-[11px] font-semibold text-[var(--seller-ink)]">Foto {displayIndex + 1}</span>
                  <span className="text-[10px] text-[var(--seller-muted)]">{formatFileSize(preview.size)}</span>
                </figcaption>
              </figure>
            );
          })}

          {canAddMore ? (
            <button
              type="button"
              onClick={openFileDialog}
              className="flex aspect-square items-center justify-center rounded-[8px] border border-dashed border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] text-center transition hover:border-[var(--seller-accent)] hover:bg-[var(--seller-accent-soft)]"
            >
              <span>
                <Icon icon="lucide:plus" width={22} height={22} className="mx-auto text-[var(--seller-brand)]" aria-hidden="true" />
                <span className="mt-2 block text-[11px] font-semibold text-[var(--seller-brand)]">Tambah Foto</span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 rounded-[8px] bg-[var(--seller-surface)]/70 px-3 py-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
        <p>{message}</p>
        {previews.length > 0 ? (
          <button type="button" onClick={resetInput} className="w-fit text-[11px] font-semibold text-[var(--seller-brand)] hover:text-[var(--seller-accent)]">
            Hapus semua foto baru
          </button>
        ) : null}
      </div>
    </div>
  );
}
