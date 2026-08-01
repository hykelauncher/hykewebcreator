"use client";

import { useState } from "react";
import { addLine } from "@/lib/cart-store";

/**
 * Rendered by ProductGrid when the shop plugin is on. Clicking adds the line
 * to the visitor's bag — nothing is sent anywhere until they submit the order.
 */
export function AddToBag({
  name,
  price,
  image,
}: {
  name: string;
  price: string;
  image: string;
}) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={(event) => {
        // The card is a link; adding shouldn't navigate away from it.
        event.preventDefault();
        event.stopPropagation();
        addLine({ name, price, image });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className="mt-3 w-full border border-line-strong px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition hover:bg-foreground hover:text-background"
    >
      {added ? "Added ✓" : "Add to bag"}
    </button>
  );
}
