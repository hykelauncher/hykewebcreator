"use client";

import { useActionState, useState } from "react";
import { createSite } from "./actions";
import { TEMPLATES } from "@/lib/templates";
import { GRADIENTS } from "@/lib/gradients";

type State = { error?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await createSite(formData);
    return {};
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { error: (error as Error).message };
  }
}

export function CreateSiteForm() {
  const [state, formAction, pending] = useActionState(submit, {});
  const [templateId, setTemplateId] = useState(TEMPLATES[1].id);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Create a new site
        </h2>
        <p className="text-sm text-gray-500">
          Pick a starting point — you can customize everything after.
        </p>
      </div>

      <input type="hidden" name="template" value={templateId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`group flex flex-col overflow-hidden rounded-xl border-2 text-left transition ${
              templateId === t.id
                ? "border-black"
                : "border-transparent ring-1 ring-gray-200 hover:ring-gray-300"
            }`}
          >
            <div
              className="h-16 w-full"
              style={{
                backgroundImage:
                  t.id === "blank" ? undefined : GRADIENTS[t.theme],
                backgroundColor: t.id === "blank" ? "#f3f4f6" : undefined,
              }}
            />
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {t.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          placeholder="Site name"
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <input
          name="subdomain"
          placeholder="subdomain (e.g. my-shop)"
          required
          pattern="[a-zA-Z0-9-]+"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create site"}
      </button>
    </form>
  );
}
