"use client";

import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/image-upload-field";
import { SiteIdProvider } from "@/components/site-context";
import { updateFavicon } from "./actions";

export function FaviconForm({
  siteId,
  faviconUrl,
}: {
  siteId: string;
  faviconUrl: string | null;
}) {
  const [value, setValue] = useState(faviconUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleChange(next: string) {
    setValue(next);
    setSaved(false);
    startTransition(async () => {
      await updateFavicon(siteId, next);
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">Favicon</label>
      <div className="max-w-xs">
        <SiteIdProvider siteId={siteId}>
          <ImageUploadField value={value} onChange={handleChange} />
        </SiteIdProvider>
      </div>
      {isPending ? (
        <span className="text-xs text-slate-500">Saving…</span>
      ) : saved ? (
        <span className="text-xs text-emerald-400">Saved.</span>
      ) : null}
    </div>
  );
}
