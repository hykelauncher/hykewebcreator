export const ROOT_DOMAIN_WITH_PORT =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export const ROOT_DOMAIN = ROOT_DOMAIN_WITH_PORT.split(":")[0];

/**
 * Given a request Host header, returns the tenant identifier to look up in
 * the `sites` table, or null if the request is for the builder app itself.
 *
 * - app root / www / app.<root> / *.vercel.app -> null (builder app)
 * - <subdomain>.<root> -> "<subdomain>"
 * - any other host -> the full host (treated as a candidate custom domain)
 */
export function resolveTenantHost(hostHeader: string): string | null {
  const host = hostHeader.split(":")[0].toLowerCase();

  const isAppHost =
    host === ROOT_DOMAIN ||
    host === `www.${ROOT_DOMAIN}` ||
    host === `app.${ROOT_DOMAIN}` ||
    host === "localhost" ||
    host.endsWith(".vercel.app");

  if (isAppHost) return null;

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    return host.slice(0, -(ROOT_DOMAIN.length + 1));
  }

  return host;
}

export function getSiteUrl(site: {
  subdomain: string;
  customDomain?: string | null;
}): string {
  const protocol = ROOT_DOMAIN === "localhost" ? "http" : "https";
  const host = site.customDomain || `${site.subdomain}.${ROOT_DOMAIN_WITH_PORT}`;
  return `${protocol}://${host}`;
}
