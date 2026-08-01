"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { recordAsset } from "@/app/actions/assets";
import { useSiteId } from "@/components/site-context";

export function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const siteId = useSiteId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(blob.url);

      // Track it so the site's storage can be cleaned up when it's deleted.
      // Failing to record shouldn't lose the user their upload.
      if (siteId) {
        try {
          await recordAsset({
            siteId,
            url: blob.url,
            pathname: blob.pathname,
            contentType: file.type || null,
            size: file.size,
          });
        } catch {
          // non-fatal
        }
      }
    } catch {
      setError("Upload failed. Try a different image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 w-full rounded object-cover" />
      ) : null}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <span className="text-xs text-gray-500">Uploading…</span>
      ) : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <input
        type="text"
        placeholder="Or paste an image URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
    </div>
  );
}
