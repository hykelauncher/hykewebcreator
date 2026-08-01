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
- `ADMIN_USER_IDS` — comma-separated Clerk user ids allowed into `/admin`
- `CRON_SECRET` — bearer token the retention job checks

The last two **fail closed**. With `ADMIN_USER_IDS` unset nobody is an admin
and `/admin` 404s; with `CRON_SECRET` unset the pruning endpoint refuses to
run rather than executing unauthenticated. That's deliberate — a fresh deploy
missing its config should do nothing rather than hand over the platform or
expose a deletion endpoint.

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

### Still to do in production

Both of these exist locally in `.env.local` (gitignored) but **not** on
Vercel, so neither admin nor the retention job works in production yet:

```bash
vercel env add ADMIN_USER_IDS   # your Clerk user id, e.g. user_3H00Ub6…
vercel env add CRON_SECRET      # any long random string
```

Then redeploy. Nothing breaks without them — `/admin` simply 404s and the
pruning job declines to run — but the retention periods promised on `/privacy`
are not being enforced until `CRON_SECRET` exists.

### The cron

`vercel.json` schedules `/api/cron/prune` daily at 03:00. Two things about it:

- Crons are only registered from a **production** deploy, not a preview.
- On the Hobby plan the schedule is approximate — roughly once a day rather
  than at 03:00 exactly. That's fine for retention.

You can run it by hand at any time:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/prune
```

The `$schema` line at the top of `vercel.json` points at Vercel's published
JSON Schema. It is purely an editor aid — VS Code and similar fetch it to
offer autocomplete and flag invalid keys. Vercel itself ignores it, and the
file works the same with the line removed.

## Trust & safety

Three mechanisms, kept deliberately narrow (`src/lib/audit.ts`,
`src/lib/retention.ts`, `src/app/api/report/route.ts`):

- **Audit trail** — account, action, time, IP and browser string, for
  consequential actions only: create, publish, unpublish, delete, claim or
  verify a domain, and admin moderation. No page-by-page tracking, no device
  fingerprinting. Clerk already holds sessions and devices, so `/admin` reads
  those live on demand rather than copying them into this database.
- **Abuse reports** — every published site carries a report link in its footer,
  no account required. Reports **outlive the site they concern**: the foreign
  key is `ON DELETE SET NULL` and the site's identity is copied onto the report
  when filed, so deleting a site can't erase the complaints against it. For a
  reported site, deletion also snapshots what was published into
  `preserved_sites`.
- **Evidence export** — one JSON file per site with the site record, owner and
  recent Clerk sessions, reports, audit trail and every published version.
  Enquiry contents are withheld by default: the people who contacted a site
  aren't the subject of an investigation.

Retention is enforced daily, not merely stated. Open reports are never pruned —
an unfinished investigation ageing out defeats the point of keeping it.

**Take a suspect site offline rather than deleting it.** Offline preserves
everything; delete cascades and destroys pages, versions and enquiries.

## Planned

- **Email notifications for enquiries.** A submission is recorded and shown in
  the site's inbox, and that's it — the owner has to check the dashboard to
  find out. For anyone actually taking bookings this is the biggest remaining
  gap: a missed check is a missed job. The intended shape is a Marketplace
  email provider plus a per-site notification address, sent on insert in
  `/api/enquiries`. Surfaced as "Coming soon" in the Plugins panel so the gap
  is visible rather than silently absent.

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
- **Plugins are site-wide add-ons** (`src/lib/plugins.ts`), configured once in
  site settings and rendered on every page by `SitePlugins` — distinct from
  blocks, which live inside one page's content. Ships with a WhatsApp button,
  a call button, social links and analytics. Every stored value is
  re-validated at render time, not just on save, because some of it reaches a
  script tag.
- No billing/plans, no team/multi-user sites. Page order and
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
