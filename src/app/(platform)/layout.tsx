import { ClerkProvider } from "@clerk/nextjs";
import { Nav } from "@/components/nav";

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
