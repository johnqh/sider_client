import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { NetworkClient } from "@sudobility/types";
import type { CaptureRequest } from "@sudobility/sider_types";
import { SiderClient } from "./network/SiderClient";

type QueryOpts<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

function client(networkClient: NetworkClient, baseUrl: string): SiderClient {
  return new SiderClient(networkClient, baseUrl);
}

// No token parameter on these: auth travels on the injected NetworkClient, which
// is what SiderClient's contract says. They used to accept a `_token` they
// ignored, so a caller could pass a real token and believe it had authenticated.
//
// The per-user hooks below DO keep a `token` — not as a credential, but as the
// signed-in signal that stops a private query firing for nobody.

// --- public data: enabled regardless of token ------------------------------

export function useSiteLookup(
  networkClient: NetworkClient,
  baseUrl: string,
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

export function useCaptureUpload(networkClient: NetworkClient, baseUrl: string) {
  return useMutation({
    mutationFn: (body: CaptureRequest) => client(networkClient, baseUrl).uploadCapture(body),
  });
}

// --- public directories: what the graph knows ------------------------------

export function useMcpList(
  networkClient: NetworkClient,
  baseUrl: string,
  params: { limit?: number; offset?: number; q?: string },
  options?: QueryOpts<Awaited<ReturnType<SiderClient["listMcp"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "mcp", params],
    queryFn: () => client(networkClient, baseUrl).listMcp(params),
    ...options,
  });
}

/**
 * This contributor's points.
 *
 * Enabled only when signed in: the endpoint is authenticated, so calling it
 * without a token buys a 401 on every mount.
 */
export function usePoints(
  networkClient: NetworkClient,
  baseUrl: string,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["points"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "points"],
    queryFn: () => client(networkClient, baseUrl).points(),
    ...options,
  });
}

export function useMcpManifest(
  networkClient: NetworkClient,
  baseUrl: string,
  host: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["mcpManifest"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "mcp", "manifest", host],
    queryFn: () => client(networkClient, baseUrl).mcpManifest(host as string),
    ...options,
    enabled: !!host && (options?.enabled ?? true),
  });
}

export function useGraphList(
  networkClient: NetworkClient,
  baseUrl: string,
  params: { limit?: number; offset?: number; q?: string },
  options?: QueryOpts<Awaited<ReturnType<SiderClient["listGraphs"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "graph", params],
    queryFn: () => client(networkClient, baseUrl).listGraphs(params),
    ...options,
  });
}

export function useGraphDetail(
  networkClient: NetworkClient,
  baseUrl: string,
  appKey: string | null,
  options?: QueryOpts<Awaited<ReturnType<SiderClient["graphDetail"]>>>,
) {
  return useQuery({
    queryKey: ["sider", "graph", "detail", appKey],
    queryFn: () => client(networkClient, baseUrl).graphDetail(appKey as string),
    ...options,
    enabled: !!appKey && (options?.enabled ?? true),
  });
}
