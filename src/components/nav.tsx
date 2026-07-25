import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Hyke
        </Link>
        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get started
            </Link>
          </Show>
        </div>
      </div>
    </header>
  );
}
