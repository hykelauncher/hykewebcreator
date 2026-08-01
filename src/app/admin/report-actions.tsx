"use client";

import { useActionState } from "react";
import { setReportStatus } from "./actions";

type State = { error?: string };

async function submit(_prevState: State, formData: FormData): Promise<State> {
  try {
    await setReportStatus(formData);
    return {};
  } catch {
    return { error: "Couldn't save that. Reload and try again." };
  }
}

export function ReportActions({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState(submit, {});

  const button =
    "rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "open" ? (
        <>
          <form action={formAction}>
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="status" value="resolved" />
            <button type="submit" disabled={pending} className={button}>
              {pending ? "…" : "Mark resolved"}
            </button>
          </form>
          <form action={formAction}>
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="status" value="dismissed" />
            <button type="submit" disabled={pending} className={button}>
              Dismiss
            </button>
          </form>
        </>
      ) : (
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="status" value="open" />
          <span className="text-xs text-slate-500">{status}</span>
          <button type="submit" disabled={pending} className={button}>
            Reopen
          </button>
        </form>
      )}
      {state.error ? (
        <span className="text-xs text-red-400">{state.error}</span>
      ) : null}
    </div>
  );
}
