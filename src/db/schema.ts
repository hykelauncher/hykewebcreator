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

export const pagesRelations = relations(pages, ({ one }) => ({
  site: one(sites, { fields: [pages.siteId], references: [sites.id] }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  site: one(sites, { fields: [assets.siteId], references: [sites.id] }),
}));
