"use client";

import { useActionState, useState } from "react";
import { createSite } from "./actions";
import { TEMPLATES } from "@/lib/templates";
import { GRADIENTS } from "@/lib/gradients";
import {
  SUBDOMAIN_MAX_LENGTH,
  SUBDOMAIN_MIN_LENGTH,
} from "@/lib/subdomain";

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
      className="glass-panel border-gradient flex flex-col gap-6 p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Create a new site
        </h2>
        <p className="text-sm text-slate-400">
          Pick a starting point — you can customize everything after.
        </p>
      </div>

      <input type="hidden" name="template" value={templateId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`group flex flex-col overflow-hidden rounded-xl border text-left transition ${
              templateId === t.id
                ? "border-blue-400/60 bg-white/10 shadow-[0_0_0_1px_rgba(96,165,250,0.4),0_0_24px_rgba(96,165,250,0.25)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div
              className="h-16 w-full"
              style={{
                backgroundImage:
                  t.id === "blank" ? undefined : GRADIENTS[t.theme],
                backgroundColor: t.id === "blank" ? "#1e293b" : undefined,
              }}
            />
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-100">{t.name}</p>
              <p className="text-xs text-slate-400 line-clamp-2">
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
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
        />
        <input
          name="subdomain"
          placeholder="subdomain (e.g. my-shop)"
          required
          minLength={SUBDOMAIN_MIN_LENGTH}
          maxLength={SUBDOMAIN_MAX_LENGTH}
          pattern="[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]"
          title="Letters, numbers and hyphens — must start and end with a letter or number."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_24px_rgba(96,165,250,0.35)] transition hover:bg-blue-400 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create site"}
      </button>
    </form>
  );
}
