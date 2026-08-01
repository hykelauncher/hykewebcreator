/**
 * Cache invalidation for published sites.
 *
 * Public traffic arrives on the tenant host and is rewritten by `proxy.ts` to
 * `/render/<tenant>/<slug>`. `revalidatePath` operates on the route file
 * structure, so it must be given that *destination* path — passing the URL the
 * visitor sees would never match a cache entry.
 */
import { revalidatePath } from "next/cache";

type PublishableSite = {
  subdomain: string;
  customDomain: string | null;
  customDomainVerified: boolean;
};

/** Every host a site is currently reachable on. */
export function tenantHostsFor(site: PublishableSite): string[] {
  const hosts = [site.subdomain];
  if (site.customDomain && site.customDomainVerified) {
    hosts.push(site.customDomain);
  }
  return hosts;
}

export function renderPathFor(host: string, slug: string): string {
  return slug ? `/render/${host}/${slug}` : `/render/${host}`;
}

/**
 * Invalidates the given slugs on every host the site answers on.
 *
 * Pass all of a site's slugs when the change can affect other pages — the Nav
 * block renders the full page list, so publishing one page's new title changes
 * the header of every other page.
 */
export function revalidateSite(site: PublishableSite, slugs: string[]): void {
  const hosts = tenantHostsFor(site);
  for (const host of hosts) {
    for (const slug of slugs) {
      revalidatePath(renderPathFor(host, slug));
    }
  }
}
