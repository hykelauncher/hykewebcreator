"use client";

import { useActionState } from "react";
import { updateCustomDomain } from "./actions";

type State = { error?: string; success?: boolean };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await updateCustomDomain(formData);
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function DomainForm({
  siteId,
  customDomain,
}: {
  siteId: string;
  customDomain: string | null;
}) {
  const [state, formAction, pending] = useActionState(submit, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="siteId" value={siteId} />
      <label className="text-sm font-medium text-gray-700">
        Custom domain
      </label>
      <div className="flex gap-2">
        <input
          name="customDomain"
          defaultValue={customDomain ?? ""}
          placeholder="www.yourdomain.com"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-600">Saved.</p>
      ) : null}
    </form>
  );
}
