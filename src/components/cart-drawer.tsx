"use client";

import { useState, useSyncExternalStore } from "react";
import {
  cartTotal,
  clearCart,
  getLines,
  getServerLines,
  orderSummary,
  setQuantity,
  subscribe,
} from "@/lib/cart-store";

/**
 * The bag, and the way an order reaches the site owner.
 *
 * There is no payment step by design. An order is sent as a message that lands
 * in the owner's dashboard, or handed to WhatsApp with the order already
 * written out — the owner then confirms and takes payment however they already
 * do. That keeps a shop usable without card processing, tax handling or
 * refunds existing yet.
 */
export function CartDrawer({
  currency,
  method,
  whatsappUrl,
  note,
}: {
  currency: string;
  method: "message" | "whatsapp" | "both";
  whatsappUrl: string | null;
  note: string;
}) {
  const lines = useSyncExternalStore(subscribe, getLines, getServerLines);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const total = cartTotal(currency);

  // WhatsApp is only offered when the site actually has a number configured.
  const canWhatsApp = method !== "message" && Boolean(whatsappUrl);
  const canMessage = method !== "whatsapp" || !whatsappUrl;

  async function sendAsMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("subject", "Order request");
    data.set(
      "message",
      `${orderSummary(currency)}\n\n${String(data.get("note") ?? "")}`.trim(),
    );
    data.delete("note");

    setState("sending");
    setError(null);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error || "Couldn't send your order. Please try again.");
        setState("idle");
        return;
      }
      clearCart();
      setState("sent");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("idle");
    }
  }

  function whatsappHref(): string {
    const base = whatsappUrl!.split("?")[0];
    const text = `Hi! I'd like to order:\n\n${orderSummary(currency)}`;
    return `${base}?text=${encodeURIComponent(text)}`;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("idle");
        }}
        className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-pill bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lifted transition hover:-translate-y-0.5 print:hidden"
        aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
      >
        Bag
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs text-foreground">
          {count}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex justify-end print:hidden">
          <button
            type="button"
            aria-label="Close bag"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-6 shadow-lifted">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-h3">Your bag</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-2xl leading-none text-muted hover:text-foreground"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {state === "sent" ? (
              <div className="mt-8 text-center">
                <p className="font-display text-lead font-semibold">
                  Order sent.
                </p>
                <p className="mt-2 text-muted">
                  We&apos;ll be in touch to confirm and arrange payment.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-6 bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-background"
                >
                  Done
                </button>
              </div>
            ) : lines.length === 0 ? (
              <p className="mt-8 text-muted">Your bag is empty.</p>
            ) : (
              <>
                <ul className="mt-6 flex flex-col gap-4">
                  {lines.map((line) => (
                    <li key={line.name} className="flex gap-3">
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.image}
                          alt=""
                          className="h-20 w-16 shrink-0 object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{line.name}</p>
                        <p className="text-sm text-muted">{line.price}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(line.name, line.quantity - 1)
                            }
                            className="h-7 w-7 border border-line text-sm"
                            aria-label={`Reduce ${line.name}`}
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(line.name, line.quantity + 1)
                            }
                            className="h-7 w-7 border border-line text-sm"
                            aria-label={`Add another ${line.name}`}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.name, 0)}
                            className="ml-auto text-sm text-muted underline underline-offset-4"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {total ? (
                  <p className="mt-6 flex items-baseline justify-between border-t border-line pt-4 font-display text-lead">
                    <span>Total</span>
                    <span className="font-semibold">{total}</span>
                  </p>
                ) : null}

                <p className="mt-3 text-sm text-muted">
                  {note ||
                    "Send your order and we'll confirm availability and payment. Nothing is charged here."}
                </p>

                {canWhatsApp ? (
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-5 block bg-[#25d366] px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#0b3d24]"
                  >
                    Send order on WhatsApp
                  </a>
                ) : null}

                {canMessage ? (
                  <form onSubmit={sendAsMessage} className="mt-5 flex flex-col gap-3">
                    {canWhatsApp ? (
                      <p className="text-center text-sm text-muted">or</p>
                    ) : null}
                    <input
                      name="name"
                      placeholder="Your name"
                      required
                      className="border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      className="border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent"
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone"
                      className="border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent"
                    />
                    <textarea
                      name="note"
                      rows={2}
                      placeholder="Anything we should know? Sizes, delivery, dates…"
                      className="resize-y border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent"
                    />
                    {error ? (
                      <p role="alert" className="text-sm font-medium text-red-600">
                        {error}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="bg-foreground px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-background disabled:opacity-50"
                    >
                      {state === "sending" ? "Sending…" : "Send order"}
                    </button>
                  </form>
                ) : null}
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
