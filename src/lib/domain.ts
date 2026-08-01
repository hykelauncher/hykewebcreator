import { randomUUID } from "node:crypto";
import { promises as dns } from "node:dns";

/**
 * Custom domain ownership.
 *
 * Saving a domain only records an intent — nothing is served on it until the
 * owner proves control by publishing a TXT record. Without this, the first
 * account to type a domain would lock it out of the platform for its real
 * owner, since `sites.custom_domain` is unique.
 */
export const VERIFICATION_RECORD_PREFIX = "_hyke-verify";

export function verificationRecordName(domain: string): string {
  return `${VERIFICATION_RECORD_PREFIX}.${domain}`;
}

export function newVerificationToken(): string {
  return `hyke-site-verification=${randomUUID()}`;
}

const DOMAIN_PATTERN =
  /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export type DomainResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateCustomDomain(raw: string): DomainResult {
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  if (!value) return { ok: false, error: "Enter a domain." };
  if (value.length > 253) {
    return { ok: false, error: "That domain is too long." };
  }
  if (!DOMAIN_PATTERN.test(value)) {
    return { ok: false, error: "Enter a valid domain, e.g. www.example.com" };
  }
  if (value.endsWith(".localhost") || value === "localhost") {
    return { ok: false, error: "localhost can't be used as a custom domain." };
  }

  return { ok: true, value };
}

export type VerificationResult =
  | { verified: true }
  | { verified: false; reason: string };

/**
 * Looks for the token in TXT records at `_hyke-verify.<domain>`.
 *
 * DNS lookups fail loudly in a lot of ordinary ways (record not added yet,
 * still propagating, no resolver on the machine), so every failure comes back
 * as a readable reason rather than an exception.
 */
export async function verifyDomainToken(
  domain: string,
  token: string,
): Promise<VerificationResult> {
  const recordName = verificationRecordName(domain);

  let records: string[][];
  try {
    records = await dns.resolveTxt(recordName);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        verified: false,
        reason: `No TXT record found at ${recordName} yet. DNS changes can take a few minutes to propagate.`,
      };
    }
    return {
      verified: false,
      reason: `Couldn't read DNS for ${recordName}. Try again in a moment.`,
    };
  }

  // Long TXT values arrive split into chunks, so join each record first.
  const values = records.map((chunks) => chunks.join("").trim());
  if (!values.includes(token)) {
    return {
      verified: false,
      reason: `Found a TXT record at ${recordName}, but not the expected value. Check it was copied exactly.`,
    };
  }

  return { verified: true };
}
