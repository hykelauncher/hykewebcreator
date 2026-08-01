"use client";

import { useActionState } from "react";
import { deleteSubscriber } from "./actions";

type Subscriber = {
  id: string;
  email: string;
  pageSlug: string;
  createdAt: Date;
};

type State = { error?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await deleteSubscriber(formData);
    return {};
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function SubscribersList({
  siteId,
  subscribers,
  total,
}: {
  siteId: string;
  subscribers: Subscriber[];
  total: number;
}) {
  const [state, formAction] = useActionState(submit, {});

  if (subscribers.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No signups yet. Add a newsletter block to a page and they&apos;ll
        collect here.
      </p>
    );
  }

  // A plain comma-separated list is the format every mailing tool accepts.
  const asText = subscribers.map((s) => s.email).join(", ");

  return (
    <div className="flex flex-col gap-3">
      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-2 text-xs font-medium text-slate-400">
          Copy this into your mailing tool
        </p>
        <textarea
          readOnly
          rows={2}
          value={asText}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {subscribers.map((subscriber) => (
          <li
            key={subscriber.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm text-slate-100">
                {subscriber.email}
              </span>
              <span className="block text-xs text-slate-500">
                {new Date(subscriber.createdAt).toLocaleDateString()}
                {subscriber.pageSlug ? ` · from /${subscriber.pageSlug}` : null}
              </span>
            </span>
            <form action={formAction}>
              <input type="hidden" name="siteId" value={siteId} />
              <input type="hidden" name="subscriberId" value={subscriber.id} />
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      {total > subscribers.length ? (
        <p className="text-xs text-slate-500">
          Showing the {subscribers.length} most recent of {total}.
        </p>
      ) : null}
    </div>
  );
}
