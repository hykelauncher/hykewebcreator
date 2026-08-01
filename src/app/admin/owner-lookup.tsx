"use client";

import { useState } from "react";
import { lookupOwner, type OwnerDetail } from "./actions";

/**
 * On-demand identity lookup for a site owner.
 *
 * Deliberately not loaded with the table. Every lookup is a live call against
 * Clerk's rate limit, and — more importantly — pulling emails and IP history
 * into this page on every load would mean holding that data here rather than
 * leaving it where it already lives. Fetch it when someone actually needs to
 * know, which is when a site has been reported.
 */
export function OwnerLookup({ userId }: { userId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [detail, setDetail] = useState<OwnerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setState("loading");
    setError(null);
    try {
      const result = await lookupOwner(userId);
      if (!result.ok) {
        setError(result.error);
        setState("idle");
        return;
      }
      setDetail(result.owner);
      setState("done");
    } catch {
      // The action handles its own failures, but the call across the wire can
      // still fail — a dropped connection, or the page navigating mid-request.
      // Without this the rejection is unhandled and the button just stops.
      setError("Couldn't reach the server. Try again.");
      setState("idle");
    }
  }

  if (state !== "done") {
    return (
      <div>
        <button
          type="button"
          onClick={load}
          disabled={state === "loading"}
          className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          {state === "loading" ? "Looking up…" : "Who owns this?"}
        </button>
        {error ? (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs">
      <p className="font-medium text-slate-100">
        {detail?.email ?? "no email on record"}
      </p>
      <p className="mt-0.5 text-slate-500">
        joined {detail?.createdAt ?? "—"}
        {detail?.lastActiveAt ? ` · last active ${detail.lastActiveAt}` : ""}
      </p>

      {detail?.sessions.length ? (
        <ul className="mt-2 flex flex-col gap-1 border-t border-white/10 pt-2">
          {detail.sessions.map((s, i) => (
            <li key={i} className="text-slate-400">
              <span className="text-slate-300">{s.ip ?? "no ip"}</span>
              {s.location ? ` · ${s.location}` : ""}
              {s.browser ? ` · ${s.browser}` : ""}
              <span className="text-slate-600"> · {s.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-slate-500">No session history.</p>
      )}

      <p className="mt-2 border-t border-white/10 pt-2 text-slate-600">
        Live from Clerk — not stored here.
      </p>
    </div>
  );
}
