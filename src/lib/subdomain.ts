/**
 * Subdomain rules for tenant sites.
 *
 * Anything in RESERVED would either collide with a host the builder app itself
 * answers on (see `resolveTenantHost`) or is a name people trust by convention
 * (mail, admin, login), so handing it to a tenant is a phishing surface on our
 * own domain.
 */
const RESERVED = new Set([
  // hosts the platform answers on itself
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "editor",
  "render",
  "sign-in",
  "sign-up",
  "login",
  "logout",
  "register",
  "auth",
  "account",
  "settings",
  "billing",
  // infrastructure / conventional names
  "mail",
  "email",
  "smtp",
  "imap",
  "pop",
  "ftp",
  "ns",
  "ns1",
  "ns2",
  "dns",
  "mx",
  "cdn",
  "static",
  "assets",
  "media",
  "files",
  "blob",
  "img",
  "images",
  "localhost",
  "internal",
  "vpn",
  "proxy",
  // platform surfaces people would assume are ours
  "help",
  "support",
  "docs",
  "status",
  "blog",
  "news",
  "about",
  "legal",
  "privacy",
  "terms",
  "security",
  "abuse",
  "postmaster",
  "webmaster",
  "hostmaster",
  // environments
  "test",
  "testing",
  "dev",
  "development",
  "stage",
  "staging",
  "preview",
  "demo",
  "sandbox",
  "beta",
  "alpha",
  // vendors / brand
  "vercel",
  "hyke",
  "sitemap",
  "robots",
  "favicon",
]);

export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 63; // DNS label limit

export type SubdomainResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Normalises a user-supplied subdomain, then validates it. Returns the value
 * to store, or a message safe to show the user.
 */
export function validateSubdomain(raw: string): SubdomainResult {
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    // collapse runs of hyphens introduced by the replace above
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!value) {
    return { ok: false, error: "Enter a subdomain using letters or numbers." };
  }
  if (value.length < SUBDOMAIN_MIN_LENGTH) {
    return {
      ok: false,
      error: `Subdomains need at least ${SUBDOMAIN_MIN_LENGTH} characters.`,
    };
  }
  if (value.length > SUBDOMAIN_MAX_LENGTH) {
    return {
      ok: false,
      error: `Subdomains can be at most ${SUBDOMAIN_MAX_LENGTH} characters.`,
    };
  }
  // `xn--` is the punycode prefix; letting tenants mint those invites
  // homograph lookalikes of other sites on the platform.
  if (value.startsWith("xn--")) {
    return { ok: false, error: `"${value}" isn't available.` };
  }
  if (RESERVED.has(value)) {
    return { ok: false, error: `"${value}" is reserved. Try another name.` };
  }

  return { ok: true, value };
}

export function isReservedSubdomain(value: string): boolean {
  return RESERVED.has(value.trim().toLowerCase());
}
