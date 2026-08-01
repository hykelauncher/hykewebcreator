"use client";

import { useState } from "react";

/**
 * The report link carried by every published site.
 *
 * Sits quietly in the corner of the footer: visible enough that someone who
 * suspects a scam can act on it, quiet enough that it doesn't imply anything
 * about the honest sites it appears on.
 */
const REASONS = [
  { value: "scam", label: "Scam or fraud" },
  { value: "impersonation", label: "Pretending to be someone else" },
  { value: "illegal", label: "Illegal content or goods" },
  { value: "adult", label: "Adult content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

export function ReportSite({ platformName }: { platformName: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError(null);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error || "Couldn't send that. Please try again.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("idle");
    }
  }

  return (
    <div className="border-t border-line px-6 py-4 text-center">
      <p className="text-xs text-muted">
        Built with {platformName}.{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Report this site
        </button>
      </p>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-card border border-line bg-surface p-6 text-left shadow-lifted">
            {state === "sent" ? (
              <>
                <h2 className="font-display text-lead font-semibold">
                  Thanks — that&apos;s been logged.
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Someone will look at this site. We don&apos;t reply to every
                  report, but every one is read.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 w-full rounded-pill bg-foreground px-5 py-3 text-sm font-medium text-background"
                >
                  Close
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h2 className="font-display text-lead font-semibold">
                  Report this site
                </h2>
                <p className="text-sm text-muted">
                  Tell us what&apos;s wrong. You don&apos;t need an account, and
                  the site owner isn&apos;t told who reported them.
                </p>

                <label className="mt-1 text-sm font-medium" htmlFor="rp-reason">
                  What&apos;s the problem?
                </label>
                <select
                  id="rp-reason"
                  name="reason"
                  required
                  defaultValue=""
                  className="rounded-[calc(var(--site-radius-card)/2)] border border-line bg-surface px-3 py-2.5 text-base"
                >
                  <option value="" disabled>
                    Choose a reason…
                  </option>
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <label className="text-sm font-medium" htmlFor="rp-detail">
                  Anything else? <span className="font-normal opacity-70">(optional)</span>
                </label>
                <textarea
                  id="rp-detail"
                  name="detail"
                  rows={3}
                  className="resize-y rounded-[calc(var(--site-radius-card)/2)] border border-line bg-surface px-3 py-2.5 text-base"
                />

                <label className="text-sm font-medium" htmlFor="rp-email">
                  Your email <span className="font-normal opacity-70">(optional)</span>
                </label>
                <input
                  id="rp-email"
                  name="email"
                  type="email"
                  placeholder="Only if you want a reply"
                  className="rounded-[calc(var(--site-radius-card)/2)] border border-line bg-surface px-3 py-2.5 text-base"
                />

                {error ? (
                  <p role="alert" className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                ) : null}

                <div className="mt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="flex-1 rounded-pill bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-50"
                  >
                    {state === "sending" ? "Sending…" : "Send report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-pill border border-line-strong px-5 py-3 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
