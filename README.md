# Hyke — website builder & hosting platform

A Wix/WordPress-style product: users sign up, pick a template, drag-and-drop
their way through a page in a visual editor, and publish to a free subdomain
(with custom domain support). Built on Next.js 16 (App Router, Turbopack) and
deployed on Vercel.

Live production: https://hykewebcreator.vercel.app
Repo: https://github.com/hykelauncher/hykewebcreator

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, `proxy.ts` middleware) |
| Auth | Clerk (`@clerk/nextjs`) |
| Database | Neon Postgres + Drizzle ORM |
| File storage | Vercel Blob (client-side uploads) |
| Visual editor | Puck (`@puckeditor/core`) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |

## How it's wired together

**Multi-tenancy.** One Next.js deployment serves three kinds of traffic,
routed by `src/proxy.ts` based on the request's `Host` header
(`src/lib/tenant.ts` has the resolution logic):

- The root domain / `app.` subdomain / any `*.vercel.app` host → the builder
  app itself (marketing page, dashboard, editor, auth).
- `<subdomain>.<root-domain>` or any other host → rewritten internally to
  `/render/<tenant>/...` and treated as a candidate published site (looked up
  by `sites.subdomain` or `sites.customDomain`).

A tenant subdomain is validated against `src/lib/subdomain.ts` on creation —
names the platform answers on itself (`www`, `app`, `api`), infrastructure
conventions (`mail`, `cdn`), and punycode prefixes are reserved.

**Data model** (`src/db/schema.ts`):
- `sites` — one row per user site: `ownerId` (Clerk user id), `subdomain`,
  `customDomain` + `customDomainVerified` + `domainVerificationToken`,
  `template`, `published`, `faviconUrl`.
- `pages` — belongs to a site: `slug` (`""` = home), `title`,
  `metaDescription`, `isHome`, `sortOrder`, `showInNav`, `content` (JSONB —
  the editor draft) and `publishedContent`/`publishedAt` (what the public
  actually gets).
- `assets` — one row per uploaded file, written by `recordAsset` after a
  client upload. Exists so a site's blobs can be deleted with the site;
  Blob remains the file store itself (`BLOB_READ_WRITE_TOKEN`).

**Draft → publish flow.** `/editor/[siteId]/[pageId]` renders `<Puck>` from
the block config in `src/lib/puck-config.tsx`. Editing autosaves a **draft**
(debounced `PUT` to `/api/pages/[pageId]`, writing `pages.content` only) —
nothing a visitor sees changes. Hitting Publish calls the `publishPage`
Server Function, which copies the draft into `pages.publishedContent`, syncs
`root.props.title`/`metaDescription` into their columns, flips
`sites.published = true` on first publish, and revalidates the site.

The public route `/render/[domain]/[[...slug]]` reads `publishedContent` back
with Puck's RSC-safe `<Render>` — no separate templating step. A page with no
`publishedContent` is a draft and 404s.

**Cache invalidation.** `/render` is ISR (`revalidate = 60`), so publishing
must invalidate explicitly or edits sit stale for a minute. Because traffic is
*rewritten* to `/render/...`, `revalidatePath` has to be given that
destination path, not the URL the visitor sees — `src/lib/publish.ts` builds
them for every host a site answers on. Publishing invalidates every page of
the site, not just the edited one, since the Nav block renders the full page
list.

**Templates** (`src/lib/templates.ts`) are just pre-built Puck `Data` trees
(Blank / Portfolio / Developer portfolio / Business / Blog) seeded on site
creation. Most fill in the home page only; a template may also declare a
`pages` array to seed a whole multi-page site (Developer portfolio seeds Home,
Projects, Articles and About). Everything seeded is an ordinary page the owner
can edit, reorder or delete. **Images never come from third-party stock libraries** — Hero/
Image/Gallery blocks default to hand-authored CSS gradients
(`src/lib/gradients.ts`) until the user uploads their own photo, specifically
to avoid any licensing risk on generated sites.

## Directory map

```
src/
  proxy.ts                        # host-based tenant routing + Clerk auth gate
  lib/
    tenant.ts                     # resolveTenantHost, getSiteUrl
    subdomain.ts                  # subdomain rules + reserved names
    domain.ts                     # custom domain validation + TXT verification
    publish.ts                    # which paths to revalidate on publish
    puck-data.ts                  # validates/bounds the Puck tree before it hits jsonb
    puck-config.tsx               # every block: Heading, Text, Button, Image,
                                   #   Hero, Spacer, Nav, Columns, Gallery,
                                   #   Testimonial, FAQAccordion, PricingTable, Embed
    templates.ts                  # starter template presets
    gradients.ts                  # original CSS gradients (no stock photos)
  db/
    schema.ts, index.ts           # Drizzle schema + lazy getDb()
  app/
    (platform)/                   # the builder app itself (has ClerkProvider)
      page.tsx                    # marketing landing page
      dashboard/                  # site list, template picker, create-site form
      dashboard/[siteId]/         # site settings: pages manager, favicon, domain
                                   #   verification, take-offline / delete
      sign-in/, sign-up/
    editor/[siteId]/[pageId]/     # the Puck editor — sibling to (platform), not
                                   #   nested in it; auth-gated via proxy.ts's
                                   #   route matcher rather than ClerkProvider,
                                   #   since it uses no client-side Clerk components
      actions.ts                  #   publishPage — draft → live, then revalidate
    render/[domain]/              # public site renderer (Server Component, no Clerk)
      layout.tsx                  #   neutral metadata — no builder branding
      not-found.tsx               #   the 404 customers' visitors see
    actions/assets.ts             # recordAsset — tracks uploads against a site
    api/pages/[pageId]/           # draft autosave
    api/upload/                   # Vercel Blob client-upload token endpoint
    api/og/                       # per-page OG image (reserved path, see below)
    sitemap.ts, robots.ts         # per-tenant, dynamic (both read the Host header)
```

**Reserved tenant paths.** `/api/og` is exempted from the tenant rewrite in
`proxy.ts` so it can read the real `Host` — which means no tenant site can have
a page there. It can't use Next's `opengraph-image` convention, because that
generates a URL under `/render/...`: the rewrite destination, which no crawler
can reach.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

Env vars live in `.env.local` (pulled from Vercel, not committed). Currently
configured:

- Neon: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (+ the `PG*`/`POSTGRES_*`
  variants Neon also provisions)
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Vercel Blob: `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_ROOT_DOMAIN` — `localhost:3000` locally; set to the real apex
  domain in production once one is connected (see Known limitations)

To test subdomains locally, visit `http://<subdomain>.localhost:3000` —
Chrome resolves `*.localhost` to `127.0.0.1` with no hosts-file edits needed.

```bash
npm run db:push       # push schema.ts changes to Neon (drizzle-kit push)
npm run db:studio     # Drizzle Studio GUI
```

Middleware (`proxy.ts`) changes require a dev server restart — Next.js
doesn't hot-reload it.

## Deploying

```bash
vercel deploy            # preview
vercel deploy --prod     # production — ask before running this
```

Vercel project: `joshuas-projects-1f0167f5/hykewebcreator`. Neon Postgres,
Clerk, and Vercel Blob are all provisioned as Marketplace integrations on
this project (`vercel integration list`), so env vars are already synced —
`vercel env pull` if `.env.local` goes stale.

## Known limitations / next steps

- **Custom domains still need a manual Vercel step.** Ownership is now proven
  in-app: saving a domain issues a token, the owner adds it as a TXT record at
  `_hyke-verify.<domain>`, and Verify checks it with a DNS lookup. Nothing is
  served on an unverified domain. But actually attaching the domain to the
  Vercel project (`vercel domains add <domain>`) remains a manual step,
  deliberately not automated — it would require handing the deployed app a
  live Vercel account token. Ask whoever manages the deployment to run it.
- **`*.vercel.app` can't host tenant subdomains.** Vercel doesn't allow
  wildcard subdomains under its own shared domain, so
  `sitename.hykewebcreator.vercel.app` will 404 until a real custom domain
  with a wildcard DNS record is connected and `NEXT_PUBLIC_ROOT_DOMAIN` is
  updated to match.
- **Puck drag-and-drop can't be driven by browser automation** (dnd-kit
  needs real pointer-motion sequences) — when verifying new blocks, seed
  `pages.content` directly via a one-off script instead of trying to
  automate the drag.
- No analytics, no billing/plans, no team/multi-user sites. Page order and
  which pages appear in the Nav block are managed from site settings; there's
  still no per-link renaming or nesting.
- **Publishing is per page.** There's no "publish the whole site" button — an
  owner publishes each page from its editor. Pages that have never been
  published stay drafts and 404, which is also true of pages left at the empty
  default after being created.

## Design & content skills

This repo has ~90 Claude Code skills installed under `.agents/skills/`
(gitignored — local tooling, not app code) for building out new templates:
modern UI/glassmorphism/gradient/animation skills (from MengTo/Skills),
`google-fonts` for typography systems, and `better-icons` for pulling icons
from 200+ libraries. Invoke by name (e.g. "use the glass-dark-ui skill on
the new pricing template").
