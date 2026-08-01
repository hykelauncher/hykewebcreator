"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { puckConfig } from "@/lib/puck-config";
import { SiteIdProvider } from "@/components/site-context";
import { themeStyle } from "@/lib/themes";
import { publishPage } from "./actions";

type PageSummary = { id: string; title: string; slug: string };

type SaveState =
  | { status: "clean" }
  | { status: "dirty" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "error"; message: string };

const AUTOSAVE_DELAY_MS = 1500;

export function EditorClient({
  siteId,
  pageId,
  initialData,
  siteUrl,
  pages,
  currentSlug,
  themeId,
  hasPublished,
  initiallyUnpublished,
}: {
  siteId: string;
  pageId: string;
  initialData: object;
  siteUrl: string;
  pages: PageSummary[];
  currentSlug: string;
  themeId: string;
  hasPublished: boolean;
  initiallyUnpublished: boolean;
}) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>({ status: "clean" });
  const [unpublished, setUnpublished] = useState(initiallyUnpublished);
  const [published, setPublished] = useState(hasPublished);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(JSON.stringify(initialData));

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const saveDraft = useCallback(
    async (data: Data) => {
      const serialized = JSON.stringify(data);
      setSaveState({ status: "saving" });
      try {
        const response = await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data }),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          setSaveState({
            status: "error",
            message: body.error || "Couldn't save your draft.",
          });
          return;
        }
        lastSaved.current = serialized;
        setSaveState({ status: "saved" });
        setUnpublished(true);
      } catch {
        setSaveState({
          status: "error",
          message: "Couldn't reach the server. Your changes are still here.",
        });
      }
    },
    [pageId],
  );

  const handleChange = useCallback(
    (data: Data) => {
      // Puck fires onChange once on mount; ignore anything identical to what
      // we already have so mounting the editor doesn't write a draft.
      if (JSON.stringify(data) === lastSaved.current) return;

      setSaveState({ status: "dirty" });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void saveDraft(data), AUTOSAVE_DELAY_MS);
    },
    [saveDraft],
  );

  async function handlePublish(data: Data) {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true);
    setPublishError(null);

    let result;
    try {
      result = await publishPage(pageId, data);
    } catch {
      // A dropped connection rejects here rather than returning an error, and
      // an unhandled rejection would leave Publish looking broken with nothing
      // explaining why. The draft is safe either way.
      setPublishing(false);
      setPublishError(
        "Couldn't reach the server. Your work is saved — try publishing again.",
      );
      return;
    }

    setPublishing(false);
    if (!result.ok) {
      setPublishError(result.error);
      return;
    }

    lastSaved.current = JSON.stringify(data);
    setSaveState({ status: "clean" });
    setUnpublished(false);
    setPublished(true);
    router.refresh();
  }

  return (
    <SiteIdProvider siteId={siteId}>
      <div className="flex h-dvh flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              ← Dashboard
            </Link>
            {pages.length > 1 ? (
              <select
                value={pageId}
                onChange={(e) =>
                  router.push(`/editor/${siteId}/${e.target.value}`)
                }
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title} (/{page.slug})
                  </option>
                ))}
              </select>
            ) : null}
            <Link
              href={`/dashboard/${siteId}`}
              className="text-sm text-gray-500 underline"
            >
              Manage pages
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DraftStatus state={saveState} />
            {publishing ? (
              <span className="text-sm text-gray-500">Publishing…</span>
            ) : unpublished ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                Unpublished changes
              </span>
            ) : published ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                Live
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                Draft — not published yet
              </span>
            )}
            {published ? (
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-500 underline"
              >
                View live site
              </a>
            ) : null}
          </div>
        </div>

        {publishError ? (
          <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {publishError}
          </p>
        ) : null}

        {/* The canvas carries the site's theme so what you edit matches what
            visitors get, rather than always showing the default palette. */}
        <div
          className="flex-1 overflow-hidden"
          data-theme={themeId}
          style={themeStyle(themeId)}
        >
          <Puck
            config={puckConfig}
            data={initialData as Data}
            onChange={handleChange}
            onPublish={handlePublish}
            metadata={{
              pages: pages.map((p) => ({ title: p.title, slug: p.slug })),
              currentSlug,
            }}
          />
        </div>
      </div>
    </SiteIdProvider>
  );
}

function DraftStatus({ state }: { state: SaveState }) {
  if (state.status === "saving") {
    return <span className="text-sm text-gray-500">Saving…</span>;
  }
  if (state.status === "dirty") {
    return <span className="text-sm text-gray-400">Unsaved</span>;
  }
  if (state.status === "saved") {
    return <span className="text-sm text-gray-500">Draft saved</span>;
  }
  if (state.status === "error") {
    return <span className="text-sm text-red-600">{state.message}</span>;
  }
  return null;
}
