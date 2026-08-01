import { auth } from "@clerk/nextjs/server";

/**
 * Platform administration access.
 *
 * Admins are named explicitly in `ADMIN_USER_IDS` (comma-separated Clerk user
 * ids) rather than by a flag on a database row. A row can be written by any
 * code path that touches the users table; an environment variable can only be
 * changed by whoever controls the deployment.
 *
 * Deny by default: with the variable unset, nobody is an admin and /admin is
 * unreachable. That way a fresh deploy or a lost env file fails closed rather
 * than handing the platform to the first person who signs up.
 */
export function adminUserIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  const ids = adminUserIds();
  if (ids.length === 0) return false;

  const { userId } = await auth();
  return Boolean(userId && ids.includes(userId));
}

/** Throws unless the caller is an admin. Use at the top of every admin action. */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  const ids = adminUserIds();
  if (!userId || ids.length === 0 || !ids.includes(userId)) {
    throw new Error("Not authorised.");
  }
  return userId;
}
