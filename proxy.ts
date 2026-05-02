import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/unauthorized",
  "/marketplace",
  "/waste",
];

const STATIC_PREFIXES = ["/_next", "/favicon.ico", "/auth/"];

function isPublicPath(pathname: string): boolean {
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function getRequiredRole(pathname: string): string | null {
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const requiredRole = getRequiredRole(pathname);
  if (!requiredRole) return NextResponse.next();

  const sessionUserId = request.cookies.get("session_user_id")?.value;
  const sessionRole = request.cookies.get("session_role")?.value;

  if (!sessionUserId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionRole !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
