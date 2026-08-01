import { headers } from "next/headers";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";

/**
 * Records a consequential action.
 *
 * What's captured is deliberately limited to what answers "who put this here,
 * and when" — the account, the site, the action, the address it came from and
 * the browser string. No fingerprinting, no page-by-page tracking. Anything
 * more would be surveillance rather than accountability, and would be harder
 * to justify to a regulator than it would be useful to you.
 *
 * Never throws: an audit write failing must not stop someone publishing their
 * site. A missing row is a smaller problem than a broken product.
 */
export type AuditAction =
  | "site.create"
  | "site.publish"
  | "site.unpublish"
  | "site.delete"
  | "site.duplicate"
  | "domain.claim"
  | "domain.verify"
  | "admin.unpublish"
  | "admin.restore";

export async function recordAudit(entry: {
  userId?: string | null;
  siteId?: string | null;
  action: AuditAction;
  detail?: string | null;
}): Promise<void> {
  try {
    const h = await headers();
    // x-forwarded-for is a list; the client address is the first entry.
    const forwarded = h.get("x-forwarded-for") ?? "";
    const ip =
      forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || null;

    await getDb()
      .insert(auditLog)
      .values({
        userId: entry.userId ?? null,
        siteId: entry.siteId ?? null,
        action: entry.action,
        detail: entry.detail?.slice(0, 500) ?? null,
        ip: ip?.slice(0, 60) ?? null,
        userAgent: h.get("user-agent")?.slice(0, 400) ?? null,
      });
  } catch {
    // Intentionally swallowed — see the note above.
  }
}
