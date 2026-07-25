"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import Link from "next/link";
import { puckConfig } from "@/lib/puck-config";

export function EditorClient({
  siteId,
  pageId,
  initialData,
  siteUrl,
}: {
  siteId: string;
  pageId: string;
  initialData: object;
  siteUrl: string;
}) {
  async function handlePublish(data: Data) {
    await fetch(`/api/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: data }),
    });
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <Link href="/dashboard" className="text-sm font-medium">
          ← Dashboard
        </Link>
        <a
          href={siteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gray-500 underline"
        >
          View live site
        </a>
      </div>
      <div className="flex-1 overflow-hidden">
        <Puck
          config={puckConfig}
          data={initialData as Data}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
