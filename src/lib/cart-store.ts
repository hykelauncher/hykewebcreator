"use client";

/**
 * The shopping bag on a published site.
 *
 * Deliberately not React context: the "Add to bag" buttons are rendered inside
 * the Puck tree while the drawer is rendered outside it, so there is no single
 * component that could wrap both. A module-level store with subscriptions lets
 * them talk to each other without one.
 *
 * State is per site (keyed by host) and lives only in the visitor's browser.
 * Nothing is sent anywhere until they choose to send the order.
 */
export type CartLine = {
  name: string;
  price: string;
  image: string;
  quantity: number;
};

const listeners = new Set<() => void>();
let lines: CartLine[] = [];
let loaded = false;

function storageKey(): string {
  return `hyke-bag:${typeof window === "undefined" ? "" : window.location.host}`;
}

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      lines = parsed.filter(
        (l): l is CartLine =>
          typeof l?.name === "string" && typeof l?.quantity === "number",
      );
    }
  } catch {
    // A corrupt or unavailable store shouldn't break the page; start empty.
    lines = [];
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(lines));
  } catch {
    // Private browsing and full quotas both throw here. The bag still works
    // for this page view, it just won't survive a reload.
  }
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLines(): CartLine[] {
  load();
  return lines;
}

/** Stable empty array so useSyncExternalStore's server snapshot never loops. */
const EMPTY: CartLine[] = [];
export function getServerLines(): CartLine[] {
  return EMPTY;
}

export function addLine(line: Omit<CartLine, "quantity">): void {
  load();
  const existing = lines.find((l) => l.name === line.name);
  if (existing) existing.quantity += 1;
  else lines = [...lines, { ...line, quantity: 1 }];
  persist();
}

export function setQuantity(name: string, quantity: number): void {
  load();
  lines =
    quantity <= 0
      ? lines.filter((l) => l.name !== name)
      : lines.map((l) => (l.name === name ? { ...l, quantity } : l));
  persist();
}

export function clearCart(): void {
  load();
  lines = [];
  persist();
}

export function itemCount(): number {
  return getLines().reduce((n, l) => n + l.quantity, 0);
}

/** Pulls the number out of "£189" / "189.00" so a total can be shown. */
function priceValue(price: string): number | null {
  const match = price.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

/**
 * Totals the bag, but only when every line has a readable price — a partial
 * total is worse than none, since it looks like the full amount.
 */
export function cartTotal(currency: string): string | null {
  const values = getLines().map((l) => {
    const value = priceValue(l.price);
    return value === null ? null : value * l.quantity;
  });
  if (values.some((v) => v === null)) return null;
  const total = values.reduce((sum: number, v) => sum + (v as number), 0);
  return `${currency}${total % 1 === 0 ? total : total.toFixed(2)}`;
}

/** The order, written out for a message or a WhatsApp chat. */
export function orderSummary(currency: string): string {
  const rows = getLines().map(
    (l) => `${l.quantity} x ${l.name} — ${l.price}`,
  );
  const total = cartTotal(currency);
  return [...rows, total ? `Total: ${total}` : ""].filter(Boolean).join("\n");
}
