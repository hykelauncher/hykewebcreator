"use client";

import { useState } from "react";

export type EnquiryField = "name" | "email" | "phone" | "subject";

/**
 * The form a visitor fills in on a published site.
 *
 * Posts to /api/enquiries, which resolves the site from the request Host — the
 * form carries no site id, so it can't be pointed at another tenant.
 */
/** Mirrors the server's limit; the check here only saves a wasted upload. */
const MAX_ATTACHMENT_MB = 5;

export function EnquiryForm({
  fields,
  buttonLabel,
  successMessage,
  pageSlug,
  allowAttachment,
}: {
  fields: EnquiryField[];
  buttonLabel: string;
  successMessage: string;
  pageSlug: string;
  allowAttachment: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setError(null);

    const file = (form.elements.namedItem("attachment") as HTMLInputElement | null)
      ?.files?.[0];
    if (file && file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      setError(`That file is over the ${MAX_ATTACHMENT_MB}MB limit.`);
      setState("idle");
      return;
    }

    try {
      const response = await fetch("/api/enquiries", {
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
      setState("sent");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="rounded-card border border-line bg-surface-subtle p-6 text-center"
      >
        <p className="font-display text-lead font-bold">{successMessage}</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-3 text-sm font-medium underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          Send another
        </button>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-semibold";
  const control =
    "w-full rounded-[calc(var(--site-radius-card)/2)] border border-line bg-surface px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="page_slug" value={pageSlug} />

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.includes("name") ? (
          <div className={fields.includes("email") ? "" : "sm:col-span-2"}>
            <label className={label} htmlFor="enq-name">
              Your name
            </label>
            <input
              id="enq-name"
              name="name"
              type="text"
              autoComplete="name"
              className={control}
            />
          </div>
        ) : null}

        {fields.includes("email") ? (
          <div className={fields.includes("name") ? "" : "sm:col-span-2"}>
            <label className={label} htmlFor="enq-email">
              Email
            </label>
            <input
              id="enq-email"
              name="email"
              type="email"
              autoComplete="email"
              className={control}
            />
          </div>
        ) : null}

        {fields.includes("phone") ? (
          <div>
            <label className={label} htmlFor="enq-phone">
              Phone
            </label>
            <input
              id="enq-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={control}
            />
          </div>
        ) : null}

        {fields.includes("subject") ? (
          <div className={fields.includes("phone") ? "" : "sm:col-span-2"}>
            <label className={label} htmlFor="enq-subject">
              Subject
            </label>
            <input
              id="enq-subject"
              name="subject"
              type="text"
              className={control}
            />
          </div>
        ) : null}
      </div>

      <div>
        <label className={label} htmlFor="enq-message">
          Message
        </label>
        <textarea
          id="enq-message"
          name="message"
          required
          rows={5}
          className={`${control} resize-y`}
        />
      </div>

      {allowAttachment ? (
        <div>
          <label className={label} htmlFor="enq-attachment">
            Attach a file <span className="font-normal opacity-70">(optional)</span>
          </label>
          <input
            id="enq-attachment"
            name="attachment"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            className="block w-full text-sm file:mr-4 file:rounded-pill file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
          />
          <p className="mt-1.5 text-sm text-muted">
            JPG, PNG, WEBP, HEIC or PDF, up to {MAX_ATTACHMENT_MB}MB.
          </p>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="self-start rounded-pill bg-foreground px-7 py-3.5 font-medium text-background shadow-soft transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : buttonLabel}
      </button>
    </form>
  );
}
