"use client";

import { useActionState } from "react";
import { adminSetPublished } from "./actions";

type State = { error?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await adminSetPublished(formData);
    return {};
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function AdminSiteActions({
  siteId,
  published,
}: {
  siteId: string;
  published: boolean;
}) {
  const [state, formAction, pending] = useActionState(submit, {});

  return (
    <form action={formAction} className="flex items-center gap-2.5">
      <input type="hidden" name="siteId" value={siteId} />
      <input
        type="hidden"
        name="published"
        value={published ? "false" : "true"}
      />
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          published
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-white/10 text-slate-400"
        }`}
      >
        {published ? "Live" : "Offline"}
      </span>
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
      >
        {pending ? "…" : published ? "Take offline" : "Restore"}
      </button>
      {state.error ? (
        <span className="text-xs text-red-400">{state.error}</span>
      ) : null}
    </form>
  );
}
