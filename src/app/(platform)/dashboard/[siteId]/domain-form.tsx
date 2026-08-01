"use client";

import { useActionState } from "react";
import { updateCustomDomain, verifyCustomDomain } from "./actions";

type State = { error?: string; success?: string };

async function submitDomain(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    await updateCustomDomain(formData);
    return { success: "Saved." };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

async function submitVerify(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    await verifyCustomDomain(formData);
    return { success: "Domain verified — it's now serving this site." };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function DomainForm({
  siteId,
  customDomain,
  verified,
  verificationToken,
  recordName,
}: {
  siteId: string;
  customDomain: string | null;
  verified: boolean;
  verificationToken: string | null;
  recordName: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitDomain, {});
  const [verifyState, verifyAction, verifying] = useActionState(
    submitVerify,
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="siteId" value={siteId} />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">
            Custom domain
          </label>
          {customDomain ? (
            verified ? (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300">
                Pending verification
              </span>
            )
          ) : null}
        </div>
        <div className="flex gap-2">
          <input
            name="customDomain"
            defaultValue={customDomain ?? ""}
            placeholder="www.yourdomain.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(96,165,250,0.35)] transition hover:bg-blue-400 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Leave empty and save to remove the domain.
        </p>
        {state.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-emerald-400">{state.success}</p>
        ) : null}
      </form>

      {customDomain && !verified && verificationToken && recordName ? (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
          <p className="text-sm font-medium text-slate-100">
            Prove you own {customDomain}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Add this TXT record at your DNS provider, then verify. Nothing is
            served on this domain until it&apos;s verified.
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
            <dt className="text-slate-500">Type</dt>
            <dd className="font-mono text-slate-200">TXT</dd>
            <dt className="text-slate-500">Name</dt>
            <dd className="break-all font-mono text-slate-200">{recordName}</dd>
            <dt className="text-slate-500">Value</dt>
            <dd className="break-all font-mono text-slate-200">
              {verificationToken}
            </dd>
          </dl>
          <form action={verifyAction} className="mt-4">
            <input type="hidden" name="siteId" value={siteId} />
            <button
              type="submit"
              disabled={verifying}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
            >
              {verifying ? "Checking DNS…" : "Verify domain"}
            </button>
          </form>
          {verifyState.error ? (
            <p className="mt-2 text-sm text-red-400">{verifyState.error}</p>
          ) : null}
        </div>
      ) : null}

      {verifyState.success ? (
        <p className="text-sm text-emerald-400">{verifyState.success}</p>
      ) : null}
    </div>
  );
}
