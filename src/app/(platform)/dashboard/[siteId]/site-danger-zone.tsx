"use client";

import { useActionState, useState } from "react";
import {
  deleteSite,
  duplicateSite,
  publishAllPages,
  setSitePublished,
} from "./actions";

type State = { error?: string; success?: string };

function isRedirect(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

async function submitPublish(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    await setSitePublished(formData);
    return {
      success:
        String(formData.get("published")) === "true"
          ? "Your site is live again."
          : "Your site is offline. Visitors now see a 404.",
    };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: (error as Error).message };
  }
}

async function submitDelete(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    await deleteSite(formData);
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: (error as Error).message };
  }
}

async function submitSiteAction(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  const intent = String(formData.get("intent") || "");
  try {
    if (intent === "duplicate") await duplicateSite(formData);
    else await publishAllPages(formData);
    return {
      success:
        intent === "duplicate" ? "Copied." : "Every page with content is live.",
    };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: (error as Error).message };
  }
}

export function SiteDangerZone({
  siteId,
  subdomain,
  published,
}: {
  siteId: string;
  subdomain: string;
  published: boolean;
}) {
  const [siteState, siteAction, sitePending] = useActionState(
    submitSiteAction,
    {},
  );
  const [publishState, publishAction, publishPending] = useActionState(
    submitPublish,
    {},
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    submitDelete,
    {},
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-6">
        <div>
          <p className="font-medium text-slate-100">Publish every page</p>
          <p className="text-sm text-slate-400">
            Puts all pages that have content live in one go. Empty pages are
            skipped.
          </p>
        </div>
        <div className="flex gap-2">
          <form action={siteAction}>
            <input type="hidden" name="siteId" value={siteId} />
            <input type="hidden" name="intent" value="publish-all" />
            <button
              type="submit"
              disabled={sitePending}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
            >
              {sitePending ? "Working…" : "Publish all"}
            </button>
          </form>
          <form action={siteAction}>
            <input type="hidden" name="siteId" value={siteId} />
            <input type="hidden" name="intent" value="duplicate" />
            <button
              type="submit"
              disabled={sitePending}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
            >
              Duplicate site
            </button>
          </form>
        </div>
      </div>
      {siteState.error ? (
        <p className="text-sm text-red-400">{siteState.error}</p>
      ) : null}
      {siteState.success ? (
        <p className="text-sm text-emerald-400">{siteState.success}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-100">
            {published ? "Site is live" : "Site is offline"}
          </p>
          <p className="text-sm text-slate-400">
            {published
              ? "Taking it offline keeps everything, but visitors see a 404."
              : "Your pages and drafts are untouched while it's offline."}
          </p>
        </div>
        <form action={publishAction}>
          <input type="hidden" name="siteId" value={siteId} />
          <input
            type="hidden"
            name="published"
            value={published ? "false" : "true"}
          />
          <button
            type="submit"
            disabled={publishPending}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
          >
            {publishPending
              ? "Working…"
              : published
                ? "Take offline"
                : "Put back online"}
          </button>
        </form>
      </div>
      {publishState.error ? (
        <p className="text-sm text-red-400">{publishState.error}</p>
      ) : null}
      {publishState.success ? (
        <p className="text-sm text-emerald-400">{publishState.success}</p>
      ) : null}

      <div className="border-t border-white/10 pt-6">
        <p className="font-medium text-red-300">Delete this site</p>
        <p className="text-sm text-slate-400">
          Removes every page, draft and uploaded image. This can&apos;t be
          undone.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
          >
            Delete site
          </button>
        ) : (
          <form action={deleteAction} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="siteId" value={siteId} />
            <label className="text-sm text-slate-300">
              Type <span className="font-mono text-slate-100">{subdomain}</span>{" "}
              to confirm.
            </label>
            <div className="flex gap-2">
              <input
                name="confirm"
                autoComplete="off"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-red-400/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={deletePending}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {deletePending ? "Deleting…" : "Delete forever"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {deleteState.error ? (
          <p className="mt-2 text-sm text-red-400">{deleteState.error}</p>
        ) : null}
      </div>
    </div>
  );
}
