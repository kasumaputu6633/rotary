"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CropSource = {
  file: File;
  url: string;
};

type Point = {
  x: number;
  y: number;
};

const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function cropDiameter(stageSize: number) {
  return Math.max(180, Math.min(stageSize - 28, stageSize * 0.78));
}

function outputFileName(fileName: string, type: string) {
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const cleanName = fileName.replace(/\.[a-z0-9]+$/i, "") || "avatar";
  return `${cleanName}-profile.${extension}`;
}

export function AvatarCropModal({
  source,
  onCancel,
  onConfirm,
}: {
  source: CropSource;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ pointerId: number; start: Point; origin: Point } | null>(null);
  const [stageSize, setStageSize] = useState(0);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const baseScale = useMemo(() => {
    if (!imageSize || !stageSize) return 1;
    const diameter = cropDiameter(stageSize);
    return Math.max(diameter / imageSize.width, diameter / imageSize.height);
  }, [imageSize, stageSize]);

  const constrainOffset = useCallback(
    (nextOffset: Point, nextZoom = zoom) => {
      if (!imageSize || !stageSize) return nextOffset;

      const diameter = cropDiameter(stageSize);
      const imageWidth = imageSize.width * baseScale * nextZoom;
      const imageHeight = imageSize.height * baseScale * nextZoom;
      const cropStart = (stageSize - diameter) / 2;
      const centeredImageLeft = (stageSize - imageWidth) / 2;
      const centeredImageTop = (stageSize - imageHeight) / 2;

      const minX = cropStart + diameter - imageWidth - centeredImageLeft;
      const maxX = cropStart - centeredImageLeft;
      const minY = cropStart + diameter - imageHeight - centeredImageTop;
      const maxY = cropStart - centeredImageTop;

      return {
        x: clamp(nextOffset.x, minX, maxX),
        y: clamp(nextOffset.y, minY, maxY),
      };
    },
    [baseScale, imageSize, stageSize, zoom],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateSize = () => {
      const rect = stage.getBoundingClientRect();
      setStageSize(rect.width);
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    setImageSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageSize) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: offset,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const nextOffset = {
      x: drag.origin.x + event.clientX - drag.start.x,
      y: drag.origin.y + event.clientY - drag.start.y,
    };
    setOffset(constrainOffset(nextOffset));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!imageSize) return;
    event.preventDefault();
    const nextZoom = clamp(zoom + (event.deltaY > 0 ? -0.08 : 0.08), MIN_ZOOM, MAX_ZOOM);
    setZoom(nextZoom);
    setOffset((current) => constrainOffset(current, nextZoom));
  }

  async function handleConfirm() {
    const image = imageRef.current;
    if (!image || !imageSize || !stageSize || saving) return;

    setSaving(true);
    const diameter = cropDiameter(stageSize);
    const imageWidth = imageSize.width * baseScale * zoom;
    const imageHeight = imageSize.height * baseScale * zoom;
    const imageLeft = (stageSize - imageWidth) / 2 + offset.x;
    const imageTop = (stageSize - imageHeight) / 2 + offset.y;
    const cropStart = (stageSize - diameter) / 2;
    const scale = baseScale * zoom;

    const sourceX = (cropStart - imageLeft) / scale;
    const sourceY = (cropStart - imageTop) / scale;
    const sourceSize = diameter / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const context = canvas.getContext("2d");
    if (!context) {
      setSaving(false);
      return;
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    const outputType = source.file.type === "image/png" || source.file.type === "image/webp"
      ? source.file.type
      : "image/jpeg";

    canvas.toBlob(
      (blob) => {
        setSaving(false);
        if (!blob) return;
        onConfirm(new File([blob], outputFileName(source.file.name, outputType), { type: outputType }));
      },
      outputType,
      0.92,
    );
  }

  const diameter = stageSize ? cropDiameter(stageSize) : 0;
  const imageWidth = imageSize ? imageSize.width * baseScale * zoom : 0;
  const imageHeight = imageSize ? imageSize.height * baseScale * zoom : 0;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 px-4 py-6 font-open-sauce"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
    >
      <div className="w-full max-w-[680px] overflow-hidden rounded-[12px] border border-[var(--seller-rule-strong)] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.28)]">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--seller-rule)] px-4 py-4 sm:px-5">
          <div>
            <h2 id="avatar-crop-title" className="text-[17px] font-semibold text-[var(--seller-ink)]">
              Sesuaikan foto profil
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Atur posisi wajah agar pas di lingkaran avatar.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--seller-muted)] transition-colors hover:bg-[var(--seller-surface-2)] hover:text-[var(--seller-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
            aria-label="Tutup crop foto"
          >
            <Icon icon="lucide:x" width={20} height={20} aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-4 p-4 sm:p-5">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className="relative mx-auto aspect-square w-full max-w-[440px] cursor-grab touch-none overflow-hidden rounded-[10px] bg-slate-950 active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={source.url}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none max-h-none select-none"
              style={{
                width: imageWidth || "auto",
                height: imageHeight || "auto",
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: diameter
                  ? `radial-gradient(circle ${diameter / 2}px at center, transparent calc(100% - 1px), rgba(2,6,23,0.7) 100%)`
                  : "rgba(2,6,23,0.7)",
              }}
            />
            {diameter ? (
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border-2 border-dashed border-white shadow-[0_0_0_1px_rgba(15,23,42,0.24)]"
                style={{
                  width: diameter,
                  height: diameter,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ) : null}
          </div>

          <label className="grid gap-2">
            <span className="text-[11px] font-semibold text-[var(--seller-ink)]">Perbesar</span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(event) => {
                const nextZoom = Number(event.target.value);
                setZoom(nextZoom);
                setOffset((current) => constrainOffset(current, nextZoom));
              }}
              className="h-2 w-full cursor-pointer accent-[var(--seller-brand)]"
              aria-label="Perbesar foto"
            />
          </label>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--seller-rule-strong)] bg-white px-4 text-[12px] font-semibold text-[var(--seller-ink)] transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!imageSize || saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-5 text-[12px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Icon
              icon={saving ? "lucide:loader-circle" : "lucide:check"}
              width={15}
              height={15}
              className={saving ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {saving ? "Menyiapkan..." : "Gunakan foto"}
          </button>
        </footer>
      </div>
    </div>
  );
}
