import { NextResponse } from "next/server";
import { pruneExpiredData } from "@/lib/retention";

/**
 * Scheduled retention pruning.
 *
 * Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`. Because
 * this endpoint deletes data, it fails closed: with no secret configured it
 * refuses outright rather than running unauthenticated. An open deletion
 * endpoint is worse than a pruning job that never runs.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured; refusing to run." },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    // 404 rather than 401: an endpoint that admits it exists invites guesses.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await pruneExpiredData();

  // Logged so a scheduled run leaves a trace even when it deletes nothing.
  console.log("[retention] pruned", result);

  return NextResponse.json({ ok: true, ...result });
}
