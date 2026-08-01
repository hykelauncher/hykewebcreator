import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon's driver makes one HTTP request per query, so a momentary network
 * problem surfaces as `TypeError: fetch failed` and, without this, takes down
 * whatever page was being rendered. Retrying once turns a blip into a pause.
 *
 * Only connection-level failures are retried. An HTTP response — including a
 * 4xx or 5xx from Neon — is returned as-is, because repeating a query the
 * server actually received risks doing the work twice.
 */
const RETRY_DELAY_MS = 150;

async function fetchWithRetry(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    try {
      return await fetch(input, init);
    } catch {
      // Surface the original failure: it's the one that describes the fault.
      throw error;
    }
  }
}

// `fetchFunction` is global-only in the driver (NeonConfigGlobalOnly), so it's
// set here rather than passed per connection.
neonConfig.fetchFunction = fetchWithRetry;

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
