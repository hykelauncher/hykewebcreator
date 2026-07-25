import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { TEMPLATES } from "@/lib/templates";
import { GRADIENTS } from "@/lib/gradients";

const FEATURES = [
  {
    title: "Drag-and-drop editor",
    body: "Add headings, text, images, buttons and heroes — no code, just click and arrange.",
  },
  {
    title: "Your own subdomain",
    body: "Every site gets a free address the moment you publish, with custom domains supported too.",
  },
  {
    title: "Built-in hosting",
    body: "Publish instantly. We handle the servers, the CDN, and the uptime.",
  },
];

export default async function HomePage() {
  const user = await currentUser();

  return (
    <main className="flex flex-1 flex-col">
      <section
        className="flex flex-col items-center gap-6 px-6 py-28 text-center text-white"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 45%), ${GRADIENTS.midnight}`,
        }}
      >
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight">
          Build and host your own website in minutes.
        </h1>
        <p className="max-w-xl text-lg text-white/80">
          Drag-and-drop pages, publish instantly, no code required.
        </p>
        <Link
          href={user ? "/dashboard" : "/sign-up"}
          className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-gray-100"
        >
          {user ? "Go to dashboard" : "Start building — it's free"}
        </Link>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-20 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-gray-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Start from a template
          </h2>
          <p className="mt-2 text-gray-600">
            Portfolios, business pages, blogs — pick one and make it yours.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <div
                  className="h-24 w-full"
                  style={{
                    backgroundImage:
                      t.id === "blank" ? undefined : GRADIENTS[t.theme],
                    backgroundColor: t.id === "blank" ? "#f3f4f6" : undefined,
                  }}
                />
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {t.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
        Hyke — build and host your own website.
      </footer>
    </main>
  );
}
