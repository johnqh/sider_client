import { useMutation, useQuery } from "@tanstack/react-query";
import type { CaptureRequest } from "@sudobility/sider_types";
import { useSiderClient } from "./context";

export function useSiteLookup(origin: string) {
  const client = useSiderClient();
  return useQuery({
    queryKey: ["sider", "lookup", origin],
    queryFn: () => client.lookup(origin),
    enabled: Boolean(origin),
  });
}

export function useStats() {
  const client = useSiderClient();
  return useQuery({ queryKey: ["sider", "stats"], queryFn: () => client.getStats() });
}

export function useSites() {
  const client = useSiderClient();
  return useQuery({ queryKey: ["sider", "sites"], queryFn: () => client.listSites() });
}

export function useToolCatalog(siteId: string | undefined, includeProvisional = false) {
  const client = useSiderClient();
  return useQuery({
    queryKey: ["sider", "tools", siteId, includeProvisional],
    queryFn: () => client.getTools(siteId as string, includeProvisional),
    enabled: Boolean(siteId),
  });
}

export function useCaptureUpload() {
  const client = useSiderClient();
  return useMutation({ mutationFn: (v: CaptureRequest) => client.uploadCapture(v) });
}
