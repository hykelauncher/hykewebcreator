"use client";

import { useState } from "react";

/**
 * Newsletter capture on a published site.
 *
 * Posts to /api/subscribe, which resolves the site from the request Host, so
 * the form carries no site id and can't be aimed at another tenant.
 */
export function NewsletterForm({
  buttonLabel,
  successMessage,
}: {
  buttonLabel: string;
  successMessage: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        body: new FormData(form),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error || "Something went wrong. Please try again.");
        setState("idle");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="font-medium">
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="flex-1 border border-line bg-surface px-4 py-3 text-base outline-none transition focus:border-accent"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="bg-foreground px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {state === "sending" ? "…" : buttonLabel}
      </button>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600 sm:absolute sm:mt-14">
          {error}
        </p>
      ) : null}
    </form>
  );
}
