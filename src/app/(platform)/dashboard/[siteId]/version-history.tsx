"use client";

import { useActionState, useState } from "react";
import { restorePageVersion } from "./actions";

type Version = {
  id: string;
  pageId: string;
  title: string;
  createdAt: Date;
};

type PageWithVersions = {
  id: string;
  title: string;
  slug: string;
  versions: Version[];
};

type State = { error?: string; success?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await restorePageVersion(formData);
    return {
      success:
        "Restored into the draft. Open the page and publish it to make it live.",
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function VersionHistory({
  siteId,
  pages,
}: {
  siteId: string;
  pages: PageWithVersions[];
}) {
  const [state, formAction, pending] = useActionState(submit, {});
  const [open, setOpen] = useState<string | null>(null);

  const withHistory = pages.filter((p) => p.versions.length > 0);

  if (withHistory.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Nothing yet. A version is saved each time you publish a page, so you can
        always get back to a version that was live.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-400">
        A snapshot is kept every time you publish. Restoring puts it back into
        the draft — your live site doesn&apos;t change until you publish again.
      </p>

      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-400">{state.success}</p>
      ) : null}

      {withHistory.map((page) => (
        <div
          key={page.id}
          className="rounded-xl border border-white/10 bg-white/[0.03]"
        >
          <button
            type="button"
            onClick={() => setOpen(open === page.id ? null : page.id)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="min-w-0">
              <span className="block font-medium text-slate-100">
                {page.title}
              </span>
              <span className="block text-xs text-slate-500">
                /{page.slug} · {page.versions.length} version
                {page.versions.length === 1 ? "" : "s"}
              </span>
            </span>
            <span className="shrink-0 text-slate-400">
              {open === page.id ? "−" : "+"}
            </span>
          </button>

          {open === page.id ? (
            <ul className="border-t border-white/10">
              {page.versions.map((version, i) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="text-slate-300">
                    {new Date(version.createdAt).toLocaleString()}
                    {i === 0 ? (
                      <span className="ml-2 text-xs text-emerald-400">
                        most recent
                      </span>
                    ) : null}
                  </span>
                  <form action={formAction}>
                    <input type="hidden" name="siteId" value={siteId} />
                    <input type="hidden" name="versionId" value={version.id} />
                    <button
                      type="submit"
                      disabled={pending}
                      className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-50"
                    >
                      Restore
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
