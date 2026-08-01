"use client";

import { useActionState, useState } from "react";
import { createSite } from "./actions";
import { TEMPLATES } from "@/lib/templates";
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

export function CreateSiteForm({
  initialTemplateId,
}: {
  /** Preselects the template someone arrived with from a preview. */
  initialTemplateId?: string;
}) {
  const [state, formAction, pending] = useActionState(submit, {});
  const [templateId, setTemplateId] = useState(
    TEMPLATES.some((t) => t.id === initialTemplateId)
      ? (initialTemplateId as string)
      : TEMPLATES[1].id,
  );
  const selected = TEMPLATES.find((t) => t.id === templateId);

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
          Pick a starting point — open a preview to see the whole thing before
          you commit. You can customize everything after.
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
            {/* A live scaled render rather than a screenshot, so a thumbnail
                can never go stale when a template changes. Lazy so a
                dashboard visit doesn't fetch every one up front. */}
            <div
              className="relative h-28 w-full overflow-hidden bg-white"
              // Container query unit lets the scale track the card's real
              // width, so the whole layout fits at any breakpoint instead of
              // being cropped by a hardcoded factor.
              style={{ containerType: "inline-size" }}
            >
              {t.id === "blank" ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs text-slate-400">
                  Empty page
                </div>
              ) : (
                <>
                  <iframe
                    src={`/templates/${t.id}/thumb`}
                    title={`${t.name} preview`}
                    loading="lazy"
                    tabIndex={-1}
                    aria-hidden
                    scrolling="no"
                    className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                    style={{
                      width: "1280px",
                      height: "1000px",
                      transform: "scale(calc(100cqw / 1280px))",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                  />
                </>
              )}
            </div>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-100">{t.name}</p>
              <p className="text-xs text-slate-400 line-clamp-2">
                {t.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && selected.id !== "blank" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-sm text-slate-300">
            See <span className="font-medium text-slate-100">{selected.name}</span>{" "}
            in full before you choose it.
          </p>
          {/* Opens in a new tab so a half-filled form isn't lost. */}
          <a
            href={`/templates/${selected.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Preview template ↗
          </a>
        </div>
      ) : null}

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
