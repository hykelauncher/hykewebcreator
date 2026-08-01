import { NextResponse } from "next/server";
import { and, eq, gte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { reports, sites } from "@/db/schema";
import { resolveTenantHost } from "@/lib/tenant";

/**
 * Abuse reports about a published site.
 *
 * No account required. Requiring a login is a reliable way never to hear about
 * a scam — the people best placed to spot one are the strangers it was aimed
 * at, and they will not sign up to tell you.
 *
 * The reported site comes from the request Host, so a report can only ever be
 * filed against the site the reporter was actually looking at.
 */
export const dynamic = "force-dynamic";

const REASONS = new Set([
  "scam",
  "impersonation",
  "illegal",
  "adult",
  "spam",
  "other",
]);

const MAX_PER_SITE_PER_HOUR = 20;

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

  const reason = String(form.get("reason") ?? "");
  if (!REASONS.has(reason)) {
    return NextResponse.json(
      { error: "Choose a reason." },
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
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(and(eq(reports.siteId, site.id), gte(reports.createdAt, anHourAgo)));

  // A cap stops a pile-on being used to bury a site, while still letting
  // genuine reports through.
  if (count >= MAX_PER_SITE_PER_HOUR) {
    return NextResponse.json({ ok: true });
  }

  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  const email = String(form.get("email") ?? "").trim().slice(0, 200);

  await db.insert(reports).values({
    siteId: site.id,
    reason,
    detail: String(form.get("detail") ?? "").trim().slice(0, 2000) || null,
    reporterEmail: email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null,
    ip: ip?.slice(0, 60) ?? null,
  });

  return NextResponse.json({ ok: true });
}
