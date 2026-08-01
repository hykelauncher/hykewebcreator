"use client";

import { useState } from "react";
import { exportEvidence } from "./actions";

/**
 * Downloads everything held about a site as one JSON file.
 *
 * Built for the moment something has to be handed over. Assembling it by hand
 * — after a site has been taken down, under time pressure, from several
 * screens — is exactly when things get missed.
 */
export function EvidenceExport({
  siteId,
  subdomain,
}: {
  siteId: string;
  subdomain: string;
}) {
  const [state, setState] = useState<"idle" | "working">("idle");
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setState("working");
    setError(null);
    try {
      const result = await exportEvidence(siteId);
      if (!result.ok) {
        setError(result.error);
        setState("idle");
        return;
      }

      const blob = new Blob([result.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setError("Couldn't reach the server. Try again.");
      setState("idle");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={download}
        disabled={state === "working"}
        title={`Download everything held about ${subdomain}`}
        className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
      >
        {state === "working" ? "Building…" : "Export evidence"}
      </button>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </span>
  );
}
