"use client";

import { useActionState, useState } from "react";
import { PLUGINS, type PluginDefinition } from "@/lib/plugins";
import { updatePlugin } from "./actions";

type State = { error?: string; success?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await updatePlugin(formData);
    const on = String(formData.get("enabled") || "") === "on";
    return { success: on ? "Turned on and live." : "Turned off." };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

function PluginCard({
  siteId,
  plugin,
  config,
}: {
  siteId: string;
  plugin: PluginDefinition;
  config: Record<string, unknown>;
}) {
  const [state, formAction, pending] = useActionState(submit, {});
  const [enabled, setEnabled] = useState(config.enabled === true);

  const field =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400/50 focus:outline-none";

  return (
    <form
      action={formAction}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
    >
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="pluginId" value={plugin.id} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-slate-100">{plugin.name}</p>
          <p className="mt-0.5 text-sm text-slate-400">{plugin.description}</p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-blue-500"
          />
          {enabled ? "On" : "Off"}
        </label>
      </div>

      {enabled ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {plugin.fields.map((f) => {
            const value = config[f.name];
            const defaultValue = typeof value === "string" ? value : "";
            return (
              <div
                key={f.name}
                className={f.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <label
                  className="mb-1 block text-xs font-medium text-slate-400"
                  htmlFor={`${plugin.id}-${f.name}`}
                >
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={`${plugin.id}-${f.name}`}
                    name={f.name}
                    rows={2}
                    defaultValue={defaultValue}
                    placeholder={f.placeholder}
                    className={field}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={`${plugin.id}-${f.name}`}
                    name={f.name}
                    defaultValue={defaultValue || f.options?.[0]?.value}
                    className={field}
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${plugin.id}-${f.name}`}
                    name={f.name}
                    type={f.type === "tel" ? "tel" : "text"}
                    defaultValue={defaultValue}
                    placeholder={f.placeholder}
                    className={field}
                  />
                )}
                {f.help ? (
                  <p className="mt-1 text-xs text-slate-500">{f.help}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {state.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-emerald-400">{state.success}</p>
        ) : null}
      </div>
    </form>
  );
}

export function PluginsForm({
  siteId,
  plugins,
}: {
  siteId: string;
  plugins: unknown;
}) {
  const stored =
    typeof plugins === "object" && plugins !== null
      ? (plugins as Record<string, Record<string, unknown>>)
      : {};

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-400">
        Add-ons that appear on every page of your site. Turn one on, fill in the
        details and save — no need to place anything in the editor.
      </p>

      {PLUGINS.map((plugin) => (
        <PluginCard
          key={plugin.id}
          siteId={siteId}
          plugin={plugin}
          config={stored[plugin.id] ?? {}}
        />
      ))}

      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5">
        <p className="font-medium text-slate-300">
          Email notifications
          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal text-slate-400">
            Coming soon
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Get an email the moment someone sends an enquiry, instead of having to
          check this page. Enquiries are still recorded either way.
        </p>
      </div>
    </div>
  );
}
