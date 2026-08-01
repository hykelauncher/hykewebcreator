"use client";

import { createContext, useContext } from "react";

/**
 * Puck renders custom fields without passing editor metadata through, so the
 * upload field can't be told which site it belongs to via props. This carries
 * the id down instead. `null` means "not inside a site editor" — uploads still
 * work, they just aren't recorded against a site.
 */
const SiteIdContext = createContext<string | null>(null);

export function SiteIdProvider({
  siteId,
  children,
}: {
  siteId: string;
  children: React.ReactNode;
}) {
  return (
    <SiteIdContext.Provider value={siteId}>{children}</SiteIdContext.Provider>
  );
}

export function useSiteId(): string | null {
  return useContext(SiteIdContext);
}
