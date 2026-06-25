"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
  revokeTrustedDeviceAction,
} from "../security-actions";

type DeviceItem = {
  createdAt: Date;
  deviceName: string;
  expiresAt: Date;
  id: string;
  ipAddress: string | null;
  lastUsedAt: Date;
};

type SessionItem = {
  createdAt: Date;
  deviceId: string | null;
  expiresAt: Date;
  id: string;
  ipAddress: string | null;
  lastActiveAt: Date;
  userAgent: string | null;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function deviceLabel(userAgent: string | null) {
  if (!userAgent) return "Perangkat tidak dikenal";
  const browser = /Edg\//.test(userAgent)
    ? "Microsoft Edge"
    : /Chrome\//.test(userAgent)
      ? "Google Chrome"
      : /Firefox\//.test(userAgent)
        ? "Mozilla Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const platform = /iPhone/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent)
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Macintosh|Mac OS X/.test(userAgent)
            ? "Mac"
            : /Linux/.test(userAgent)
              ? "Linux"
              : "perangkat";
  return `${browser} di ${platform}`;
}

export function DevicesSettings({
  currentSessionId,
  devices,
  sessions,
}: {
  currentSessionId: string | null;
  devices: DeviceItem[];
  sessions: SessionItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ error?: string; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 p-4 sm:p-5">
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">Perangkat terpercaya</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Perangkat dikenal tidak meminta kode verifikasi perangkat baru selama 30 hari. Jika 2FA aktif, kode tetap diminta setiap login.
            </p>
          </div>
          <button
            type="button"
            disabled={isPending || (devices.length <= 1 && sessions.length <= 1)}
            onClick={() => runAction(revokeOtherSessionsAction)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[7px] border border-[var(--seller-danger)] px-3 text-[11px] font-semibold text-[var(--seller-danger)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon="lucide:log-out" width={14} height={14} aria-hidden="true" />
            Keluarkan perangkat lain
          </button>
        </div>

        <div className="mt-4 divide-y divide-[var(--seller-rule)] overflow-hidden rounded-[8px] border border-[var(--seller-rule)]">
          {devices.length === 0 ? (
            <p className="p-4 text-[11px] text-[var(--seller-muted)]">Belum ada perangkat terpercaya.</p>
          ) : devices.map((device) => {
            const isCurrent = sessions.some((session) =>
              session.id === currentSessionId && session.deviceId === device.id);
            return (
              <div key={device.id} className="grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-surface-2)] text-[var(--seller-brand)]">
                  <Icon icon="lucide:monitor-smartphone" width={18} height={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[12px] font-semibold text-[var(--seller-ink)]">{device.deviceName}</p>
                    {isCurrent ? (
                      <span className="rounded-full bg-[var(--seller-success-soft)] px-2 py-0.5 text-[9px] font-semibold text-[var(--seller-success)]">
                        Perangkat ini
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--seller-muted)]">
                    Terakhir digunakan {formatDate(device.lastUsedAt)}
                    {device.ipAddress ? ` · IP ${device.ipAddress}` : ""}
                  </p>
                </div>
                {!isCurrent ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(() => revokeTrustedDeviceAction(device.id))}
                    className="inline-flex min-h-9 items-center justify-center rounded-[7px] px-3 text-[10px] font-semibold text-[var(--seller-danger)] hover:bg-[var(--seller-danger-soft)] disabled:opacity-50"
                  >
                    Keluarkan
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[var(--seller-rule)] pt-5">
        <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">Sesi aktif</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
          Sesi login berlaku maksimal 7 hari dan dapat dihentikan kapan saja.
        </p>
        <div className="mt-4 divide-y divide-[var(--seller-rule)] overflow-hidden rounded-[8px] border border-[var(--seller-rule)]">
          {sessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            return (
              <div key={session.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{deviceLabel(session.userAgent)}</p>
                    {isCurrent ? (
                      <span className="rounded-full bg-[var(--seller-success-soft)] px-2 py-0.5 text-[9px] font-semibold text-[var(--seller-success)]">
                        Sesi sekarang
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--seller-muted)]">
                    Aktif {formatDate(session.lastActiveAt)}
                    {session.ipAddress ? ` · IP ${session.ipAddress}` : ""}
                  </p>
                </div>
                {!isCurrent ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(() => revokeSessionAction(session.id))}
                    className="inline-flex min-h-9 items-center justify-center rounded-[7px] px-3 text-[10px] font-semibold text-[var(--seller-danger)] hover:bg-[var(--seller-danger-soft)] disabled:opacity-50"
                  >
                    Akhiri sesi
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

