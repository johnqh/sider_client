import { createContext, useContext, type ReactNode } from "react";
import { SiderClient } from "./client";

const SiderClientContext = createContext<SiderClient | null>(null);

export function SiderClientProvider({ client, children }: { client: SiderClient; children: ReactNode }) {
  return <SiderClientContext.Provider value={client}>{children}</SiderClientContext.Provider>;
}

export function useSiderClient(): SiderClient {
  const c = useContext(SiderClientContext);
  if (!c) throw new Error("useSiderClient must be used within a <SiderClientProvider>");
  return c;
}
