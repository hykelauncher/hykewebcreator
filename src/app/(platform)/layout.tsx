import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: {
    default: "Hyke — build and publish your website",
    template: "%s · Hyke",
  },
  description:
    "Pick a template, drag and drop your way through a page, and publish it to the web.",
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="flex min-h-full flex-1 flex-col bg-gray-50">
        <Nav />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </ClerkProvider>
  );
}
