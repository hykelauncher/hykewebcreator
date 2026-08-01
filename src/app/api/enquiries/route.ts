import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { and, eq, gte, isNotNull, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { enquiries, sites } from "@/db/schema";
import { resolveTenantHost } from "@/lib/tenant";

/**
 * Receives enquiries from a published site's form block.
 *
 * The site is resolved from the request's Host header rather than from a body
 * field, so a form can only ever write to the site it was served from —
 * posting someone else's site id does nothing. `proxy.ts` exempts this path
 * from the tenant rewrite so the real Host survives.
 */
export const dynamic = "force-dynamic";

const MAX_LENGTHS = {
  name: 120,
  email: 200,
  phone: 40,
  subject: 160,
  message: 4000,
} as const;

/** Per-site, per-hour cap. A form open to the internet needs a ceiling. */
const MAX_PER_SITE_PER_HOUR = 30;

/**
 * Attachment limits.
 *
 * Anyone on the internet can post here without signing in, and the platform
 * pays for the storage, so the ceiling is deliberately low and the type list
 * is an allowlist rather than a blocklist. Raise these once there's a paid
 * tier to charge them against.
 */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ATTACHMENTS_PER_SITE_PER_HOUR = 10;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

function clean(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

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

  // Honeypot: a field hidden from people but attractive to bots. Anything in
  // it is a bot, so accept the request and drop it silently rather than
  // telling the bot it was detected.
  if (clean(form.get("company_website"), 200)) {
    return NextResponse.json({ ok: true });
  }

  const message = clean(form.get("message"), MAX_LENGTHS.message);
  if (!message) {
    return NextResponse.json(
      { error: "Please write a message." },
      { status: 400 },
    );
  }

  const email = clean(form.get("email"), MAX_LENGTHS.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
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
    .from(enquiries)
    .where(
      and(eq(enquiries.siteId, site.id), gte(enquiries.createdAt, anHourAgo)),
    );

  if (count >= MAX_PER_SITE_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many enquiries just now. Please try again shortly." },
      { status: 429 },
    );
  }

  let attachmentUrl: string | null = null;
  let attachmentName: string | null = null;

  const file = form.get("attachment");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        {
          error: `That file is ${Math.round(file.size / 1024 / 1024)}MB. The limit is ${
            MAX_ATTACHMENT_BYTES / 1024 / 1024
          }MB.`,
        },
        { status: 413 },
      );
    }
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Attach a JPG, PNG, WEBP, HEIC or PDF." },
        { status: 415 },
      );
    }

    // Attachments carry their own tighter cap, since they cost storage rather
    // than a database row.
    const [{ count: withFiles }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(enquiries)
      .where(
        and(
          eq(enquiries.siteId, site.id),
          gte(enquiries.createdAt, anHourAgo),
          isNotNull(enquiries.attachmentUrl),
        ),
      );

    if (withFiles >= MAX_ATTACHMENTS_PER_SITE_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many attachments just now. Try again shortly." },
        { status: 429 },
      );
    }

    // Uploaded server-side rather than by issuing a token to the browser: an
    // upload token handed to anonymous visitors is an open door to the
    // storage bill.
    const uploaded = await put(
      `enquiries/${site.id}/${crypto.randomUUID()}`,
      file,
      { access: "public", addRandomSuffix: false, contentType: file.type },
    );
    attachmentUrl = uploaded.url;
    attachmentName = file.name.slice(0, 200);
  }

  await db.insert(enquiries).values({
    siteId: site.id,
    name: clean(form.get("name"), MAX_LENGTHS.name),
    email,
    phone: clean(form.get("phone"), MAX_LENGTHS.phone),
    subject: clean(form.get("subject"), MAX_LENGTHS.subject),
    message,
    attachmentUrl,
    attachmentName,
    pageSlug: clean(form.get("page_slug"), 200) ?? "",
  });

  return NextResponse.json({ ok: true });
}
