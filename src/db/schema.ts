import {
  pgTable,
  uuid,
  text,
  jsonb,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    subdomain: text("subdomain").notNull(),
    customDomain: text("custom_domain"),
    // A custom domain is only served once its ownership has been proven by a
    // TXT record, so one tenant can't squat another's domain.
    customDomainVerified: boolean("custom_domain_verified")
      .notNull()
      .default(false),
    domainVerificationToken: text("domain_verification_token"),
    template: text("template").notNull().default("blank"),
    // Visual theme (see src/lib/themes.ts). Seeded from the chosen template,
    // switchable afterwards without touching page content.
    themeId: text("theme_id").notNull().default("studio"),
    published: boolean("published").notNull().default(false),
    faviconUrl: text("favicon_url"),
    // Site-wide add-ons (WhatsApp button, analytics, …) keyed by plugin id.
    // See src/lib/plugins.ts — shape is validated there, not by the column.
    plugins: jsonb("plugins").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("sites_subdomain_idx").on(table.subdomain),
    uniqueIndex("sites_custom_domain_idx").on(table.customDomain),
  ],
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull().default("Untitled"),
    metaDescription: text("meta_description"),
    isHome: boolean("is_home").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    showInNav: boolean("show_in_nav").notNull().default(true),
    // `content` is the editor draft. `publishedContent` is what /render serves
    // — a page is live only once it has been published at least once.
    content: jsonb("content").notNull().default({}),
    publishedContent: jsonb("published_content"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("pages_site_slug_idx").on(table.siteId, table.slug)],
);

/**
 * A snapshot of a page's content, written each time it's published.
 *
 * Publishing is the moment worth being able to go back to — it's when someone
 * decided the page was good enough for visitors. Autosaved drafts are far too
 * frequent to keep, and would bury the useful snapshots.
 */
export const pageVersions = pgTable("page_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  content: jsonb("content").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * A record of consequential actions, for accountability and abuse
 * investigation.
 *
 * Deliberately narrow: who did what, when, from which address and browser —
 * and only for actions that matter (creating, publishing, deleting, claiming a
 * domain). It is not analytics and not a device fingerprint. Collecting the
 * minimum that answers "who put this here" keeps it proportionate, which is
 * both the lawful position and the useful one.
 *
 * Entries are pruned on a schedule (see docs in /privacy). Keeping them
 * forever turns a safety measure into a liability.
 */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  siteId: uuid("site_id").references(() => sites.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  detail: text("detail"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Abuse reports from the public.
 *
 * Fraud is usually reported before it is detected, so every published site
 * carries a way to raise one. No account required — requiring a login is a
 * good way never to hear about a scam.
 */
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  detail: text("detail"),
  reporterEmail: text("reporter_email"),
  ip: text("ip"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Newsletter signups from a published site.
 *
 * Kept separate from enquiries: an enquiry is a message somebody expects a
 * reply to, a subscriber is a standing permission to send them things. Mixing
 * them would make both lists wrong.
 */
export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    pageSlug: text("page_slug").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Signing up twice shouldn't create two records to email twice.
  (table) => [uniqueIndex("subscribers_site_email_idx").on(table.siteId, table.email)],
);

/**
 * Enquiries submitted through a published site's form block.
 *
 * Deliberately loose about shape: a form is configurable per block, so only
 * `message` is guaranteed. `pageSlug` records where it came from, which
 * matters once a site has several forms.
 */
export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  pageSlug: text("page_slug").notNull().default(""),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  pathname: text("pathname").notNull(),
  contentType: text("content_type"),
  size: text("size"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  pages: many(pages),
  assets: many(assets),
  enquiries: many(enquiries),
}));

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  site: one(sites, { fields: [enquiries.siteId], references: [sites.id] }),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  site: one(sites, { fields: [pages.siteId], references: [sites.id] }),
  versions: many(pageVersions),
}));

export const pageVersionsRelations = relations(pageVersions, ({ one }) => ({
  page: one(pages, { fields: [pageVersions.pageId], references: [pages.id] }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  site: one(sites, { fields: [assets.siteId], references: [sites.id] }),
}));
