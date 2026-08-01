import type { Metadata } from "next";

/**
 * Metadata shell for published tenant sites.
 *
 * Individual pages replace all of this in `generateMetadata`. It exists so the
 * pages that *don't* — the tenant 404 — fall back to something neutral rather
 * than inheriting a title from the builder app.
 *
 * Nothing here may carry a `robots` directive: metadata is inherited, so a
 * noindex default set for the 404's benefit would quietly deindex every
 * published site. The 404 HTTP status is the signal crawlers act on.
 */
export const metadata: Metadata = {
  title: "Page not found",
};

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
