import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { NetworkClient } from "@sudobility/types";
import type { CaptureRequest } from "@sudobility/sider_types";
import { SiderClient } from "./network/SiderClient";

type QueryOpts<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

function client(networkClient: NetworkClient, baseUrl: string): SiderClient {
  return new SiderClient(networkClient, baseUrl);
}

// --- public data: enabled regardless of token ------------------------------

export function useSiteLookup(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  origin: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["lookup"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "lookup", origin],
    queryFn: () => client(networkClient, baseUrl).lookup(origin as string),
    ...options,
    enabled: !!origin && (options?.enabled ?? true),
  });
}

export function useSites(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["listSites"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "sites"],
    queryFn: () => client(networkClient, baseUrl).listSites(),
    ...options,
  });
}

export function useSite(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  siteId: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getSite"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "site", siteId],
    queryFn: () => client(networkClient, baseUrl).getSite(siteId as string),
    ...options,
    enabled: !!siteId && (options?.enabled ?? true),
  });
}

export function useStats(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getStats"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "stats"],
    queryFn: () => client(networkClient, baseUrl).getStats(),
    ...options,
  });
}

export function useToolCatalog(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  siteId: string | null,
  opts?: { includeProvisional?: boolean; includeFlagged?: boolean },
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getTools"]>>>,
) {
  return useQuery({
    queryKey: [
      "sider",
      "tools",
      siteId,
      opts?.includeProvisional ?? false,
      opts?.includeFlagged ?? false,
    ],
    queryFn: () => client(networkClient, baseUrl).getTools(siteId as string, opts),
    ...options,
    enabled: !!siteId && (options?.enabled ?? true),
  });
}

export function useSiteTemplates(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  siteId: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getSiteTemplates"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "templates", siteId],
    queryFn: () => client(networkClient, baseUrl).getSiteTemplates(siteId as string),
    ...options,
    enabled: !!siteId && (options?.enabled ?? true),
  });
}

export function useSiteSlots(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  siteId: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getSiteSlots"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "slots", siteId],
    queryFn: () => client(networkClient, baseUrl).getSiteSlots(siteId as string),
    ...options,
    enabled: !!siteId && (options?.enabled ?? true),
  });
}

export function useSiteGraph(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  siteId: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getSiteGraph"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "graph", siteId],
    queryFn: () => client(networkClient, baseUrl).getSiteGraph(siteId as string),
    ...options,
    enabled: !!siteId && (options?.enabled ?? true),
  });
}

export function useToolDetail(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  toolId: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getToolDetail"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "tool", toolId],
    queryFn: () => client(networkClient, baseUrl).getToolDetail(toolId as string),
    ...options,
    enabled: !!toolId && (options?.enabled ?? true),
  });
}

// --- per-user data: gated on the token -------------------------------------

export function useMe(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getMe"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "me", token ? "authed" : "anon"],
    queryFn: () => client(networkClient, baseUrl).getMe(),
    ...options,
    enabled: !!token && (options?.enabled ?? true),
  });
}

export function useMyCaptureBatches(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  siteId?: string,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getMyCaptureBatches"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "my-batches", siteId ?? "all"],
    queryFn: () => client(networkClient, baseUrl).getMyCaptureBatches(siteId),
    ...options,
    enabled: !!token && (options?.enabled ?? true),
  });
}

export function useMyCaptureBatch(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  batchId: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getMyCaptureBatch"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "my-batch", batchId],
    queryFn: () => client(networkClient, baseUrl).getMyCaptureBatch(batchId as string),
    ...options,
    enabled: !!token && !!batchId && (options?.enabled ?? true),
  });
}

export function useMyTools(
  networkClient: NetworkClient,
  baseUrl: string,
  token: string,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["getMyTools"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "my-tools"],
    queryFn: () => client(networkClient, baseUrl).getMyTools(),
    ...options,
    enabled: !!token && (options?.enabled ?? true),
  });
}

export function useCaptureUpload(networkClient: NetworkClient, baseUrl: string, token: string) {
  return useMutation({
    mutationFn: (body: CaptureRequest) => client(networkClient, baseUrl).uploadCapture(body),
  });
}
