import { createHash, randomBytes } from "node:crypto";
import { db } from "@/db";
import {
  accountSessions,
  loginActivities,
  userDevices,
  users,
} from "@/db/schema";
import { and, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { cookies, headers } from "next/headers";

const SESSION_COOKIE = "rotary_session";
const DEVICE_COOKIE = "rotary_device";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const secureCookie = process.env.NODE_ENV === "production";
const baseCookie = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: secureCookie,
};

export type LoginActivityEvent =
  | "login_success"
  | "login_failed"
  | "login_challenge"
  | "logout"
  | "password_changed"
  | "password_reset"
  | "two_factor_enabled"
  | "two_factor_disabled"
  | "device_revoked"
  | "sessions_revoked";

type RequestContext = {
  deviceName: string;
  ipAddress: string | null;
  userAgent: string | null;
};

function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

function createSecret() {
  return randomBytes(32).toString("hex");
}

function getBrowserName(userAgent: string) {
  if (/Edg\//.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//.test(userAgent)) return "Opera";
  if (/Chrome\//.test(userAgent)) return "Google Chrome";
  if (/Firefox\//.test(userAgent)) return "Mozilla Firefox";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Browser";
}

function getPlatformName(userAgent: string) {
  if (/iPhone/.test(userAgent)) return "iPhone";
  if (/iPad/.test(userAgent)) return "iPad";
  if (/Android/.test(userAgent)) return "Android";
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Macintosh|Mac OS X/.test(userAgent)) return "Mac";
  if (/Linux/.test(userAgent)) return "Linux";
  return "perangkat";
}

export function describeDevice(userAgent?: string | null) {
  if (!userAgent) return "Perangkat tidak dikenal";
  return `${getBrowserName(userAgent)} di ${getPlatformName(userAgent)}`;
}

export async function getRequestContext(): Promise<RequestContext> {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress = (forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip"))?.slice(0, 64) || null;

  return {
    deviceName: describeDevice(userAgent),
    ipAddress,
    userAgent,
  };
}

export async function recordLoginActivity(
  userId: string,
  event: LoginActivityEvent,
  {
    method,
    status = "success",
  }: {
    method?: string | null;
    status?: "success" | "failed" | "info";
  } = {},
) {
  try {
    const context = await getRequestContext();
    await db.insert(loginActivities).values({
      userId,
      event,
      status,
      method: method ?? null,
      ...context,
    });
  } catch (error) {
    console.error("[Auth activity]", error);
  }
}

export async function getTrustedDevice(userId: string) {
  const rawToken = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!rawToken) return null;

  const context = await getRequestContext();
  const device = await db.query.userDevices.findFirst({
    where: and(
      eq(userDevices.userId, userId),
      eq(userDevices.deviceTokenHash, hashSecret(rawToken)),
      gt(userDevices.expiresAt, new Date()),
    ),
  });
  if (!device) return null;

  await db
    .update(userDevices)
    .set({
      deviceName: context.deviceName,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      lastUsedAt: new Date(),
    })
    .where(eq(userDevices.id, device.id));

  return device;
}

export async function trustCurrentDevice(userId: string) {
  const existing = await getTrustedDevice(userId);
  if (existing) return existing;

  const rawToken = createSecret();
  const context = await getRequestContext();
  const expiresAt = new Date(Date.now() + DEVICE_MAX_AGE_SECONDS * 1000);
  const [device] = await db
    .insert(userDevices)
    .values({
      userId,
      deviceTokenHash: hashSecret(rawToken),
      deviceName: context.deviceName,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    })
    .returning();

  (await cookies()).set(DEVICE_COOKIE, rawToken, {
    ...baseCookie,
    maxAge: DEVICE_MAX_AGE_SECONDS,
  });

  return device;
}

export async function createAccountSession(
  userId: string,
  {
    deviceId,
    method = "password",
  }: {
    deviceId?: string | null;
    method?: string;
  } = {},
) {
  const rawToken = createSecret();
  const context = await getRequestContext();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const [session] = await db
    .insert(accountSessions)
    .values({
      userId,
      tokenHash: hashSecret(rawToken),
      deviceId: deviceId ?? null,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    })
    .returning();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    ...baseCookie,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  cookieStore.delete("session_user_id");
  cookieStore.delete("session_role");

  await recordLoginActivity(userId, "login_success", { method });
  return session;
}

export async function getCurrentAccountSession() {
  const rawToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const [result] = await db
    .select({
      session: accountSessions,
      user: users,
    })
    .from(accountSessions)
    .innerJoin(users, eq(users.id, accountSessions.userId))
    .where(and(
      eq(accountSessions.tokenHash, hashSecret(rawToken)),
      isNull(accountSessions.revokedAt),
      gt(accountSessions.expiresAt, new Date()),
    ))
    .limit(1);

  if (!result) return null;

  if (Date.now() - result.session.lastActiveAt.getTime() >= SESSION_TOUCH_INTERVAL_MS) {
    await db
      .update(accountSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(accountSessions.id, result.session.id));
  }

  return result;
}

export async function revokeCurrentSession() {
  const current = await getCurrentAccountSession();
  const cookieStore = await cookies();

  if (current) {
    await db
      .update(accountSessions)
      .set({ revokedAt: new Date() })
      .where(eq(accountSessions.id, current.session.id));
    await recordLoginActivity(current.user.id, "logout");
  }

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete("session_user_id");
  cookieStore.delete("session_role");
}

export async function revokeOtherSessions(userId: string, currentSessionId: string) {
  await db
    .update(accountSessions)
    .set({ revokedAt: new Date() })
    .where(and(
      eq(accountSessions.userId, userId),
      ne(accountSessions.id, currentSessionId),
      isNull(accountSessions.revokedAt),
    ));
}

export async function revokeAllSessions(userId: string) {
  await db
    .update(accountSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(accountSessions.userId, userId), isNull(accountSessions.revokedAt)));
}

export async function clearTrustedDevices(userId: string, exceptDeviceId?: string | null) {
  if (exceptDeviceId) {
    await db
      .delete(userDevices)
      .where(and(eq(userDevices.userId, userId), ne(userDevices.id, exceptDeviceId)));
    return;
  }

  await db.delete(userDevices).where(eq(userDevices.userId, userId));
  (await cookies()).delete(DEVICE_COOKIE);
}

export async function deleteExpiredAuthRecords() {
  const now = new Date();
  await db.delete(accountSessions).where(lt(accountSessions.expiresAt, now));
  await db.delete(userDevices).where(lt(userDevices.expiresAt, now));
}

export function hashRecoveryCode(code: string) {
  return hashSecret(code.replace(/[^A-Z0-9]/gi, "").toUpperCase());
}
