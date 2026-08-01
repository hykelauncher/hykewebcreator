import { and, lt, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLog, preservedSites, reports } from "@/db/schema";

/**
 * Data retention.
 *
 * The privacy notice states how long each of these is kept. This is what makes
 * that true — a stated period nothing enforces is worse than a longer one that
 * is honoured, because it is a promise on record that the system quietly
 * breaks.
 *
 * The windows live here rather than in the cron route so there is one place to
 * change them, and one place the privacy page has to agree with.
 */
export const RETENTION = {
  /** Audit entries: long enough to investigate, short enough not to hoard. */
  auditMonths: 12,
  /** Closed reports, and the evidence preserved alongside them. */
  closedReportMonths: 24,
} as const;

function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

export type PruneResult = {
  auditDeleted: number;
  reportsDeleted: number;
  preservedDeleted: number;
  staleOpenReports: number;
};

/**
 * Deletes what is past its retention window.
 *
 * Open reports are never deleted, whatever their age. The stated window
 * applies to closed ones: an unresolved report ageing out would destroy an
 * investigation nobody finished, which is the opposite of why it was kept. Any
 * that are old and still open are counted and returned, because a two-year-old
 * open report means nobody looked, and that is worth surfacing rather than
 * tidying away.
 */
export async function pruneExpiredData(): Promise<PruneResult> {
  const db = getDb();

  const auditCutoff = monthsAgo(RETENTION.auditMonths);
  const reportCutoff = monthsAgo(RETENTION.closedReportMonths);

  const auditDeleted = await db
    .delete(auditLog)
    .where(lt(auditLog.createdAt, auditCutoff))
    .returning({ id: auditLog.id });

  const reportsDeleted = await db
    .delete(reports)
    .where(
      and(lt(reports.createdAt, reportCutoff), ne(reports.status, "open")),
    )
    .returning({ id: reports.id });

  const preservedDeleted = await db
    .delete(preservedSites)
    .where(lt(preservedSites.deletedAt, reportCutoff))
    .returning({ id: preservedSites.id });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(
      and(lt(reports.createdAt, reportCutoff), sql`${reports.status} = 'open'`),
    );

  return {
    auditDeleted: auditDeleted.length,
    reportsDeleted: reportsDeleted.length,
    preservedDeleted: preservedDeleted.length,
    staleOpenReports: count,
  };
}
