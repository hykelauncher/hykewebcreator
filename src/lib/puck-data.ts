import type { Data } from "@puckeditor/core";

/**
 * The editor POSTs a Puck `Data` tree straight into a jsonb column, so this is
 * the only thing standing between a malformed (or enormous) body and the
 * database. Shape-check rather than schema-validate: Puck owns the block
 * schema, we only care that it's the right kind of object and a sane size.
 */
export const MAX_PAGE_BYTES = 1_000_000; // 1 MB of JSON per page

export type PuckDataResult =
  | { ok: true; data: Data; bytes: number }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

export function parsePuckData(input: unknown): PuckDataResult {
  if (!isPlainObject(input)) {
    return { ok: false, error: "Page content must be an object." };
  }

  if (!Array.isArray(input.content)) {
    return { ok: false, error: "Page content is missing its block list." };
  }

  if (input.root !== undefined && !isPlainObject(input.root)) {
    return { ok: false, error: "Page root must be an object." };
  }

  if (input.zones !== undefined && !isPlainObject(input.zones)) {
    return { ok: false, error: "Page zones must be an object." };
  }

  // Every block Puck emits is an object with a string `type`. Anything else
  // means the payload didn't come from the editor.
  for (const block of input.content) {
    if (!isPlainObject(block) || typeof block.type !== "string") {
      return { ok: false, error: "Page content contains an invalid block." };
    }
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(input);
  } catch {
    return { ok: false, error: "Page content could not be serialized." };
  }

  const bytes = Buffer.byteLength(serialized, "utf8");
  if (bytes > MAX_PAGE_BYTES) {
    return {
      ok: false,
      error: `This page is ${Math.round(bytes / 1024)} KB, over the ${Math.round(
        MAX_PAGE_BYTES / 1024,
      )} KB limit. Try uploading large images instead of pasting them inline.`,
    };
  }

  return { ok: true, data: input as unknown as Data, bytes };
}

/** Pulls the SEO fields Puck stores on `root.props` back out for their columns. */
export function extractPageMeta(data: Data): {
  title: string | null;
  metaDescription: string | null;
} {
  const props = (data.root as { props?: Record<string, unknown> } | undefined)
    ?.props;
  const rawTitle = props?.title;
  const rawDescription = props?.metaDescription;

  const title =
    typeof rawTitle === "string" && rawTitle.trim() ? rawTitle.trim() : null;
  const metaDescription =
    typeof rawDescription === "string" && rawDescription.trim()
      ? rawDescription.trim().slice(0, 300)
      : null;

  return { title, metaDescription };
}
