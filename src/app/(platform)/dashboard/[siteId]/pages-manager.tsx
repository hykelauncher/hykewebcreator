"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createPage,
  deletePage,
  movePage,
  togglePageNav,
} from "./actions";

type Page = {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  showInNav: boolean;
  publishedAt: Date | null;
};

type State = { error?: string };

function isRedirect(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

async function submitCreate(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    await createPage(formData);
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: (error as Error).message };
  }
}

async function submitPageAction(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  const intent = String(formData.get("intent") || "");
  try {
    if (intent === "delete") await deletePage(formData);
    else if (intent === "move") await movePage(formData);
    else if (intent === "nav") await togglePageNav(formData);
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: (error as Error).message };
  }
}

export function PagesManager({
  siteId,
  pages,
}: {
  siteId: string;
  pages: Page[];
}) {
  const [state, formAction, pending] = useActionState(submitCreate, {});
  const [rowState, rowAction] = useActionState(submitPageAction, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-100">
                {page.title}
                {page.isHome ? (
                  <span className="ml-2 text-xs text-blue-400">home</span>
                ) : null}
                {!page.publishedAt ? (
                  <span className="ml-2 text-xs text-amber-400">draft</span>
                ) : null}
                {!page.showInNav ? (
                  <span className="ml-2 text-xs text-slate-500">
                    hidden from nav
                  </span>
                ) : null}
              </p>
              <p className="truncate text-sm text-slate-500">/{page.slug}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <form action={rowAction} className="flex items-center gap-1">
                <input type="hidden" name="siteId" value={siteId} />
                <input type="hidden" name="pageId" value={page.id} />
                <input type="hidden" name="intent" value="move" />
                <button
                  type="submit"
                  name="direction"
                  value="up"
                  disabled={index === 0}
                  aria-label={`Move ${page.title} up`}
                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="submit"
                  name="direction"
                  value="down"
                  disabled={index === pages.length - 1}
                  aria-label={`Move ${page.title} down`}
                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
                >
                  ↓
                </button>
              </form>

              <form action={rowAction}>
                <input type="hidden" name="siteId" value={siteId} />
                <input type="hidden" name="pageId" value={page.id} />
                <input type="hidden" name="intent" value="nav" />
                <button
                  type="submit"
                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                >
                  {page.showInNav ? "Hide from nav" : "Show in nav"}
                </button>
              </form>

              <Link
                href={`/editor/${siteId}/${page.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Edit
              </Link>

              {!page.isHome ? (
                <form action={rowAction}>
                  <input type="hidden" name="siteId" value={siteId} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <input type="hidden" name="intent" value="delete" />
                  <button
                    type="submit"
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {rowState.error ? (
        <p className="text-sm text-red-400">{rowState.error}</p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="siteId" value={siteId} />
        <input
          name="title"
          placeholder="Page title (e.g. About)"
          required
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
        />
        <input
          name="slug"
          placeholder="path (e.g. about)"
          required
          pattern="[a-zA-Z0-9-/]+"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(96,165,250,0.35)] transition hover:bg-blue-400 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add page"}
        </button>
      </form>
      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
    </div>
  );
}
