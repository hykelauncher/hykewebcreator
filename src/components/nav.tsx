import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

/**
 * Builder-app navigation.
 *
 * Dark to match the app behind it — a white bar over the dark dashboard read
 * as a seam between two different products.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050914]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-100 transition hover:opacity-90"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-violet-500 text-sm font-bold text-white shadow-[0_0_18px_rgba(96,165,250,0.45)]"
          >
            H
          </span>
          <span className="text-lg font-semibold tracking-tight">Hyke</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </Link>
            <div className="ml-1">
              <UserButton />
            </div>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(96,165,250,0.35)] transition hover:bg-blue-400"
            >
              Get started
            </Link>
          </Show>
        </nav>
      </div>
    </header>
  );
}
