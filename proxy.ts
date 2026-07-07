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

const PROTECTED_PREFIXES = ["/account", "/dashboard", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const protectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!protectedPath) return NextResponse.next();

  const sessionToken = request.cookies.get("rotary_session")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Role dan validitas token tetap diverifikasi dari database oleh requireRole()
  // pada Server Component. Proxy hanya memberi redirect cepat saat cookie tidak ada.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
