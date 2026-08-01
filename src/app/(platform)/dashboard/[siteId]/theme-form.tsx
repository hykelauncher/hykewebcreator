"use client";

import { useActionState } from "react";
import { THEMES } from "@/lib/themes";
import { setSiteTheme } from "./actions";

type State = { error?: string; success?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await setSiteTheme(formData);
    return { success: "Theme updated. Republish isn't needed — it's live." };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function ThemeForm({
  siteId,
  themeId,
}: {
  siteId: string;
  themeId: string;
}) {
  const [state, formAction, pending] = useActionState(submit, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="siteId" value={siteId} />
      <p className="text-sm text-slate-400">
        Changes colours, type and shape across every page. Your content stays
        exactly as it is.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const active = theme.id === themeId;
          return (
            <label
              key={theme.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                active
                  ? "border-blue-400/60 bg-white/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="themeId"
                value={theme.id}
                defaultChecked={active}
                className="sr-only"
              />
              <span
                aria-hidden
                className="mt-0.5 flex h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15"
              >
                {theme.swatch.map((colour) => (
                  <span
                    key={colour}
                    className="h-full w-1/3"
                    style={{ backgroundColor: colour }}
                  />
                ))}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-100">
                  {theme.name}
                </span>
                <span className="block text-xs text-slate-400">
                  {theme.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(96,165,250,0.35)] transition hover:bg-blue-400 disabled:opacity-50"
      >
        {pending ? "Applying…" : "Apply theme"}
      </button>

      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-400">{state.success}</p>
      ) : null}
    </form>
  );
}
