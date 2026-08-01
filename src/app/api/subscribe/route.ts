import { NextResponse } from "next/server";
import { and, eq, gte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { sites, subscribers } from "@/db/schema";
import { resolveTenantHost } from "@/lib/tenant";

/**
 * Newsletter signups from a published site.
 *
 * As with enquiries, the site comes from the request Host rather than the
 * body, so a form can only ever write to the site it was served from.
 */
export const dynamic = "force-dynamic";

const MAX_PER_SITE_PER_HOUR = 60;

export async function POST(request: Request) {
  const host = request.headers.get("host") || "";
  const tenant = resolveTenantHost(host);
  if (!tenant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  // Honeypot: accept and drop, rather than telling a bot it was spotted.
  const trap = form.get("company_website");
  if (typeof trap === "string" && trap.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: or(
      eq(sites.subdomain, tenant),
      and(eq(sites.customDomain, tenant), eq(sites.customDomainVerified, true)),
    ),
  });
  if (!site || !site.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscribers)
    .where(
      and(eq(subscribers.siteId, site.id), gte(subscribers.createdAt, anHourAgo)),
    );

  if (count >= MAX_PER_SITE_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many signups just now. Please try again shortly." },
      { status: 429 },
    );
  }

  // Signing up twice is not an error worth showing someone — the unique index
  // keeps one row and the visitor still sees a thank-you.
  await db
    .insert(subscribers)
    .values({
      siteId: site.id,
      email,
      pageSlug: String(form.get("page_slug") ?? "").slice(0, 200),
    })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
