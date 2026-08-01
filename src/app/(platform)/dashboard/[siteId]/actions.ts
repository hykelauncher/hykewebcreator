"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  assets,
  enquiries,
  pageVersions,
  pages,
  sites,
  subscribers,
} from "@/db/schema";
import { revalidateSite } from "@/lib/publish";
import { THEMES } from "@/lib/themes";
import { getPlugin } from "@/lib/plugins";
import {
  newVerificationToken,
  validateCustomDomain,
  verifyDomainToken,
} from "@/lib/domain";

async function requireOwnedSite(siteId: string, userId: string) {
  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, siteId), eq(sites.ownerId, userId)),
  });
  if (!site) throw new Error("Site not found");
  return site;
}

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/** Slugs of every page on a site — what the Nav block renders, so any change
 * to the set invalidates every page. */
async function siteSlugs(siteId: string) {
  const db = getDb();
  const rows = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.siteId, siteId));
  return rows.map((r) => r.slug);
}

export async function updateCustomDomain(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const raw = String(formData.get("customDomain") || "").trim();
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();

  // Clearing the field removes the domain entirely.
  if (raw === "") {
    const slugs = await siteSlugs(site.id);
    revalidateSite(site, slugs); // drop cache entries on the old host first
    await db
      .update(sites)
      .set({
        customDomain: null,
        customDomainVerified: false,
        domainVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, site.id));
    revalidatePath(`/dashboard/${siteId}`);
    return;
  }

  const parsed = validateCustomDomain(raw);
  if (!parsed.ok) throw new Error(parsed.error);

  // A changed domain always starts unverified with a fresh token, so a token
  // proven for one domain can never carry over to another.
  const unchanged = site.customDomain === parsed.value;
  try {
    await db
      .update(sites)
      .set({
        customDomain: parsed.value,
        customDomainVerified: unchanged ? site.customDomainVerified : false,
        domainVerificationToken:
          unchanged && site.domainVerificationToken
            ? site.domainVerificationToken
            : newVerificationToken(),
        updatedAt: new Date(),
      })
      .where(eq(sites.id, site.id));
  } catch {
    throw new Error(`Domain "${parsed.value}" is already in use.`);
  }

  revalidatePath(`/dashboard/${siteId}`);
}

export async function verifyCustomDomain(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const site = await requireOwnedSite(siteId, userId);

  if (!site.customDomain) throw new Error("Add a domain first.");
  if (!site.domainVerificationToken) {
    throw new Error("This domain has no verification token. Re-save it.");
  }

  const result = await verifyDomainToken(
    site.customDomain,
    site.domainVerificationToken,
  );
  if (!result.verified) throw new Error(result.reason);

  const db = getDb();
  await db
    .update(sites)
    .set({ customDomainVerified: true, updatedAt: new Date() })
    .where(eq(sites.id, site.id));

  // Now that the domain resolves, prime its cache entries.
  const slugs = await siteSlugs(site.id);
  revalidateSite({ ...site, customDomainVerified: true }, slugs);
  revalidatePath(`/dashboard/${siteId}`);
}

export async function createPage(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9-/]/g, "-")
    .replace(/-{2,}/g, "-");

  if (!title || !slug) {
    throw new Error("Page title and path are required.");
  }
  if (title.length > 200) throw new Error("That page title is too long.");
  if (slug.length > 200) throw new Error("That page path is too long.");

  const db = getDb();

  const existing = await db
    .select({ sortOrder: pages.sortOrder })
    .from(pages)
    .where(eq(pages.siteId, site.id))
    .orderBy(asc(pages.sortOrder));
  const nextOrder =
    existing.reduce((max, p) => Math.max(max, p.sortOrder), 0) + 1;

  let pageId: string;
  try {
    const [page] = await db
      .insert(pages)
      .values({
        siteId: site.id,
        slug,
        title,
        isHome: false,
        sortOrder: nextOrder,
        content: {},
      })
      .returning();
    pageId = page.id;
  } catch {
    throw new Error(`A page already exists at "/${slug}".`);
  }

  revalidatePath(`/dashboard/${siteId}`);
  redirect(`/editor/${site.id}/${pageId}`);
}

export async function deletePage(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const pageId = String(formData.get("pageId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, pageId), eq(pages.siteId, siteId)),
  });
  if (!page) throw new Error("Page not found");
  if (page.isHome) throw new Error("Can't delete the home page.");

  const slugs = await siteSlugs(site.id);

  await db.delete(pages).where(eq(pages.id, pageId));

  // Includes the deleted page's own slug, so its cached copy stops being served.
  revalidateSite(site, slugs);
  revalidatePath(`/dashboard/${siteId}`);
}

export async function movePage(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const pageId = String(formData.get("pageId") || "");
  const direction = String(formData.get("direction") || "");
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();
  const ordered = await db
    .select({ id: pages.id, sortOrder: pages.sortOrder })
    .from(pages)
    .where(eq(pages.siteId, site.id))
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  const index = ordered.findIndex((p) => p.id === pageId);
  if (index === -1) throw new Error("Page not found");

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= ordered.length) return; // already at the end

  // Rewrite the whole run so rows created before sortOrder existed (all zero)
  // get a stable order instead of swapping two identical values.
  const reordered = [...ordered];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  for (const [position, page] of reordered.entries()) {
    if (page.sortOrder !== position) {
      await db
        .update(pages)
        .set({ sortOrder: position })
        .where(eq(pages.id, page.id));
    }
  }

  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath(`/dashboard/${siteId}`);
}

export async function togglePageNav(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const pageId = String(formData.get("pageId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, pageId), eq(pages.siteId, siteId)),
  });
  if (!page) throw new Error("Page not found");

  await db
    .update(pages)
    .set({ showInNav: !page.showInNav })
    .where(eq(pages.id, pageId));

  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath(`/dashboard/${siteId}`);
}

export async function updateFavicon(siteId: string, faviconUrl: string) {
  const userId = await requireAuth();

  const site = await requireOwnedSite(siteId, userId);
  const db = getDb();
  await db
    .update(sites)
    .set({ faviconUrl, updatedAt: new Date() })
    .where(eq(sites.id, site.id));

  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath(`/dashboard/${siteId}`);
}

export async function setEnquiryHandled(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const enquiryId = String(formData.get("enquiryId") || "");
  await requireOwnedSite(siteId, userId);

  const db = getDb();
  const enquiry = await db.query.enquiries.findFirst({
    where: and(eq(enquiries.id, enquiryId), eq(enquiries.siteId, siteId)),
  });
  if (!enquiry) throw new Error("Enquiry not found");

  await db
    .update(enquiries)
    .set({ handled: !enquiry.handled })
    .where(eq(enquiries.id, enquiryId));

  revalidatePath(`/dashboard/${siteId}`);
}

export async function deleteEnquiry(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const enquiryId = String(formData.get("enquiryId") || "");
  await requireOwnedSite(siteId, userId);

  const db = getDb();
  await db
    .delete(enquiries)
    .where(and(eq(enquiries.id, enquiryId), eq(enquiries.siteId, siteId)));

  revalidatePath(`/dashboard/${siteId}`);
}

export async function updatePlugin(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const pluginId = String(formData.get("pluginId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const definition = getPlugin(pluginId);
  if (!definition) throw new Error("Unknown plugin.");

  const enabled = String(formData.get("enabled") || "") === "on";

  const input: Record<string, string> = {};
  for (const field of definition.fields) {
    input[field.name] = String(formData.get(field.name) ?? "");
  }

  const existing =
    typeof site.plugins === "object" && site.plugins !== null
      ? (site.plugins as Record<string, unknown>)
      : {};

  let next: Record<string, unknown>;
  if (!enabled) {
    // Keep what was typed so switching back on doesn't mean retyping it.
    next = { ...existing, [pluginId]: { ...input, enabled: false } };
  } else {
    const parsed = definition.parse(input);
    if (!parsed) {
      throw new Error(
        `Check the ${definition.name.toLowerCase()} details — something isn't valid.`,
      );
    }
    next = { ...existing, [pluginId]: { ...parsed, enabled: true } };
  }

  const db = getDb();
  await db
    .update(sites)
    .set({ plugins: next, updatedAt: new Date() })
    .where(eq(sites.id, site.id));

  // Plugins render into every page, so all of them need rebuilding.
  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath(`/dashboard/${siteId}`);
}

export async function publishAllPages(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();
  const all = await db
    .select()
    .from(pages)
    .where(eq(pages.siteId, site.id))
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  // A page still holding the empty default was never written; publishing it
  // would put a blank page on the site rather than help anyone.
  const publishable = all.filter((page) => {
    const content = page.content as { content?: unknown[] } | null;
    return Array.isArray(content?.content) && content.content.length > 0;
  });

  if (publishable.length === 0) {
    throw new Error("Nothing to publish yet — add something to a page first.");
  }

  const now = new Date();
  for (const page of publishable) {
    await db
      .update(pages)
      .set({
        publishedContent: page.content,
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(pages.id, page.id));

    await db.insert(pageVersions).values({
      pageId: page.id,
      content: page.content,
      title: page.title,
    });
  }

  if (!site.published) {
    await db
      .update(sites)
      .set({ published: true, updatedAt: now })
      .where(eq(sites.id, site.id));
  }

  revalidateSite(site, all.map((p) => p.slug));
  revalidatePath(`/dashboard/${siteId}`);
  revalidatePath("/dashboard");
}

export async function duplicatePage(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const pageId = String(formData.get("pageId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, pageId), eq(pages.siteId, siteId)),
  });
  if (!page) throw new Error("Page not found");

  const existing = await db
    .select({ slug: pages.slug, sortOrder: pages.sortOrder })
    .from(pages)
    .where(eq(pages.siteId, site.id));

  const taken = new Set(existing.map((p) => p.slug));
  const base = page.slug || "home";
  let slug = `${base}-copy`;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-copy-${n++}`;

  const nextOrder =
    existing.reduce((max, p) => Math.max(max, p.sortOrder), 0) + 1;

  // The copy starts as a draft: publishing it is a separate decision.
  await db.insert(pages).values({
    siteId: site.id,
    slug,
    title: `${page.title} (copy)`,
    isHome: false,
    sortOrder: nextOrder,
    showInNav: page.showInNav,
    content: page.content,
  });

  revalidatePath(`/dashboard/${siteId}`);
}

export async function duplicateSite(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();

  const base = site.subdomain.slice(0, 50);
  let subdomain = `${base}-copy`;
  let n = 2;
  // Subdomains are unique platform-wide, so the name has to be checked
  // against every site rather than only this owner's.
  while (
    await db.query.sites.findFirst({ where: eq(sites.subdomain, subdomain) })
  ) {
    subdomain = `${base}-copy-${n++}`;
    if (n > 50) throw new Error("Couldn't find a free name. Rename the original first.");
  }

  const [copy] = await db
    .insert(sites)
    .values({
      ownerId: userId,
      name: `${site.name} (copy)`,
      subdomain,
      template: site.template,
      themeId: site.themeId,
      faviconUrl: site.faviconUrl,
      plugins: site.plugins,
      // Never carries the domain, and starts offline: a copy shouldn't
      // silently take over the original's address or go live unreviewed.
      published: false,
    })
    .returning();

  const sitePages = await db
    .select()
    .from(pages)
    .where(eq(pages.siteId, site.id))
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  if (sitePages.length > 0) {
    await db.insert(pages).values(
      sitePages.map((page) => ({
        siteId: copy.id,
        slug: page.slug,
        title: page.title,
        metaDescription: page.metaDescription,
        isHome: page.isHome,
        sortOrder: page.sortOrder,
        showInNav: page.showInNav,
        content: page.content,
      })),
    );
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${copy.id}`);
}

export async function restorePageVersion(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const versionId = String(formData.get("versionId") || "");
  await requireOwnedSite(siteId, userId);

  const db = getDb();
  const version = await db.query.pageVersions.findFirst({
    where: eq(pageVersions.id, versionId),
  });
  if (!version) throw new Error("Version not found");

  // Ownership is on the site, so confirm the version's page belongs to it.
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, version.pageId), eq(pages.siteId, siteId)),
  });
  if (!page) throw new Error("Version not found");

  // Restores into the draft only. Nothing visitors see changes until the
  // owner publishes, which keeps restore from being destructive.
  await db
    .update(pages)
    .set({ content: version.content, title: version.title, updatedAt: new Date() })
    .where(eq(pages.id, page.id));

  revalidatePath(`/dashboard/${siteId}`);
}

export async function deleteSubscriber(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const subscriberId = String(formData.get("subscriberId") || "");
  await requireOwnedSite(siteId, userId);

  const db = getDb();
  await db
    .delete(subscribers)
    .where(
      and(eq(subscribers.id, subscriberId), eq(subscribers.siteId, siteId)),
    );

  revalidatePath(`/dashboard/${siteId}`);
}

export async function setSiteTheme(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const themeId = String(formData.get("themeId") || "");
  const site = await requireOwnedSite(siteId, userId);

  if (!THEMES.some((t) => t.id === themeId)) {
    throw new Error("Unknown theme.");
  }

  const db = getDb();
  await db
    .update(sites)
    .set({ themeId, updatedAt: new Date() })
    .where(eq(sites.id, site.id));

  // Theme lives in the rendered HTML, so every page needs rebuilding.
  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath(`/dashboard/${siteId}`);
}

export async function setSitePublished(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const published = String(formData.get("published") || "") === "true";
  const site = await requireOwnedSite(siteId, userId);

  const db = getDb();
  await db
    .update(sites)
    .set({ published, updatedAt: new Date() })
    .where(eq(sites.id, site.id));

  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath(`/dashboard/${siteId}`);
  revalidatePath("/dashboard");
}

export async function deleteSite(formData: FormData) {
  const userId = await requireAuth();

  const siteId = String(formData.get("siteId") || "");
  const confirmation = String(formData.get("confirm") || "").trim();
  const site = await requireOwnedSite(siteId, userId);

  // Typing the subdomain is the guard against a misclick destroying a site.
  if (confirmation !== site.subdomain) {
    throw new Error(
      `Type "${site.subdomain}" to confirm you want to delete this site.`,
    );
  }

  const db = getDb();
  const slugs = await siteSlugs(site.id);

  // Blobs live outside the database, so cascading deletes won't touch them —
  // remove them explicitly or they're billed forever with nothing pointing at
  // them. A failure here shouldn't block deleting the site itself.
  const siteAssets = await db
    .select({ url: assets.url })
    .from(assets)
    .where(eq(assets.siteId, site.id));

  if (siteAssets.length > 0) {
    try {
      await del(siteAssets.map((a) => a.url));
    } catch {
      // Orphaned blobs are recoverable; a half-deleted site is not.
    }
  }

  // pages and assets are ON DELETE CASCADE from sites.
  await db.delete(sites).where(eq(sites.id, site.id));

  revalidateSite(site, slugs);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
