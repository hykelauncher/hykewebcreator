import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { resolveTenantHost } from "@/lib/tenant";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/editor(.*)"]);

const withClerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  return NextResponse.next();
});

const isStaticAsset = /\.(?:[a-z0-9]+)$/i;

// Platform routes that must resolve on a tenant host instead of being rewritten
// into /render — they need the real Host header to know which tenant they're
// answering for. (`sitemap.xml` and `robots.txt` already fall through via the
// extension check below.)
const TENANT_PASSTHROUGH = ["/api/og", "/api/enquiries"];

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Defense in depth: never rewrite Next internals or files with an
  // extension, regardless of what the matcher below actually excludes.
  if (pathname.startsWith("/_next") || isStaticAsset.test(pathname)) {
    return NextResponse.next();
  }

  if (TENANT_PASSTHROUGH.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const tenant = resolveTenantHost(request.headers.get("host") || "");

  if (tenant) {
    const url = request.nextUrl.clone();
    url.pathname = `/render/${tenant}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return withClerk(request, event);
}

export const proxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
