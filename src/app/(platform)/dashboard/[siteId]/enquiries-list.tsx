"use client";

import { useActionState } from "react";
import { deleteEnquiry, setEnquiryHandled } from "./actions";

type Enquiry = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  pageSlug: string;
  handled: boolean;
  createdAt: Date;
};

type State = { error?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  const intent = String(formData.get("intent") || "");
  try {
    if (intent === "delete") await deleteEnquiry(formData);
    else await setEnquiryHandled(formData);
    return {};
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function EnquiriesList({
  siteId,
  enquiries,
}: {
  siteId: string;
  enquiries: Enquiry[];
}) {
  const [state, formAction] = useActionState(submit, {});

  if (enquiries.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No enquiries yet. They&apos;ll appear here as soon as someone uses a
        form on your site.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      {enquiries.map((enquiry) => (
        <article
          key={enquiry.id}
          className={`rounded-xl border p-4 transition ${
            enquiry.handled
              ? "border-white/5 bg-white/[0.02] opacity-60"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-100">
                {enquiry.name || "Someone"}
                {enquiry.subject ? (
                  <span className="text-slate-400"> — {enquiry.subject}</span>
                ) : null}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(enquiry.createdAt).toLocaleString()}
                {enquiry.pageSlug ? ` · from /${enquiry.pageSlug}` : null}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <form action={formAction}>
                <input type="hidden" name="siteId" value={siteId} />
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <input type="hidden" name="intent" value="toggle" />
                <button
                  type="submit"
                  className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
                >
                  {enquiry.handled ? "Mark unread" : "Mark handled"}
                </button>
              </form>
              <form action={formAction}>
                <input type="hidden" name="siteId" value={siteId} />
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
            {enquiry.message}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            {enquiry.email ? (
              <a
                href={`mailto:${enquiry.email}`}
                className="text-blue-300 underline decoration-blue-300/40 underline-offset-4 hover:text-blue-200"
              >
                {enquiry.email}
              </a>
            ) : null}
            {enquiry.phone ? (
              <a
                href={`tel:${enquiry.phone}`}
                className="text-blue-300 underline decoration-blue-300/40 underline-offset-4 hover:text-blue-200"
              >
                {enquiry.phone}
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
