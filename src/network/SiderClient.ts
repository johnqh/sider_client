import type { NetworkClient, NetworkResponse } from "@sudobility/types";
import type {
  ApiResponse,
  CaptureRequest,
  CaptureResponse,
  EndpointGraphEdge,
  EndpointTemplate,
  MeResponse,
  MyCaptureBatchDetail,
  MyCaptureBatchSummary,
  MyToolEntry,
  SecretSlot,
  Site,
  SiteLookupResult,
  StatsResponse,
  ToolCatalog,
  ToolDetailResponse,
} from "@sudobility/sider_types";

/**
 * Typed wrapper over the Sider API. Auth is the injected NetworkClient's
 * concern (e.g. auth_lib's Firebase Bearer client); this class only builds
 * URLs and unwraps the ApiResponse envelope.
 */
/** Points earned for contributing training data. */
export interface PointsSummary {
  total: number;
  /** How many pages this contributor was first to land on. */
  newPages: number;
}

export class SiderClient {
  constructor(
    private readonly network: NetworkClient,
    private readonly baseUrl: string,
  ) {}

  private unwrap<T>(res: NetworkResponse<ApiResponse<T>>): T {
    const body = res.data;
    if (!body || body.success !== true) {
      throw new Error(body?.error ?? `sider api error (${res.status})`);
    }
    return body.data as T;
  }

  private async get<T>(path: string): Promise<T> {
    return this.unwrap(await this.network.get<ApiResponse<T>>(`${this.baseUrl}${path}`));
  }

  lookup(origin: string): Promise<SiteLookupResult> {
    return this.get(`/api/v1/sites/lookup?origin=${encodeURIComponent(origin)}`);
  }

  listSites(): Promise<Site[]> {
    return this.get("/api/v1/sites");
  }

  getSite(id: string): Promise<Site> {
    return this.get(`/api/v1/sites/${id}`);
  }

  getStats(): Promise<StatsResponse> {
    return this.get("/api/v1/stats");
  }

  getTools(
    siteId: string,
    opts?: { includeProvisional?: boolean; includeFlagged?: boolean },
  ): Promise<ToolCatalog> {
    const q = new URLSearchParams();
    if (opts?.includeProvisional) q.set("includeProvisional", "1");
    if (opts?.includeFlagged) q.set("includeFlagged", "1");
    const qs = q.toString();
    return this.get(`/api/v1/sites/${siteId}/tools${qs ? `?${qs}` : ""}`);
  }

  async uploadCapture(body: CaptureRequest): Promise<CaptureResponse> {
    return this.unwrap(
      await this.network.post<ApiResponse<CaptureResponse>>(`${this.baseUrl}/api/v1/capture`, body),
    );
  }

  getMe(): Promise<MeResponse> {
    return this.get("/api/v1/me");
  }

  getMyCaptureBatches(siteId?: string): Promise<MyCaptureBatchSummary[]> {
    return this.get(
      `/api/v1/me/capture-batches${siteId ? `?siteId=${encodeURIComponent(siteId)}` : ""}`,
    );
  }

  getMyCaptureBatch(id: string): Promise<MyCaptureBatchDetail> {
    return this.get(`/api/v1/me/capture-batches/${id}`);
  }

  getMyTools(): Promise<MyToolEntry[]> {
    return this.get("/api/v1/me/tools");
  }

  getSiteTemplates(siteId: string): Promise<EndpointTemplate[]> {
    return this.get(`/api/v1/sites/${siteId}/templates`);
  }

  getSiteSlots(siteId: string): Promise<SecretSlot[]> {
    return this.get(`/api/v1/sites/${siteId}/slots`);
  }

  getSiteGraph(siteId: string): Promise<EndpointGraphEdge[]> {
    return this.get(`/api/v1/sites/${siteId}/graph`);
  }

  getToolDetail(toolId: string): Promise<ToolDetailResponse> {
    return this.get(`/api/v1/tools/${toolId}`);
  }

  /**
   * What this contributor has earned.
   *
   * Authenticated, and always about the caller: the server reads the
   * contributor from the verified token, so there is no parameter to pass and
   * no way to ask about anybody else.
   */
  points(): Promise<PointsSummary> {
    return this.get("/api/v1/points");
  }

  // --- public directories of what the graph knows -------------------------

  listMcp(params: { limit?: number; offset?: number; q?: string }): Promise<DirectoryPage> {
    return this.get(`/api/v1/mcp${queryString(params)}`);
  }

  mcpManifest(host: string): Promise<unknown> {
    return this.get(`/api/v1/mcp/${encodeURIComponent(host)}`);
  }

  listGraphs(params: { limit?: number; offset?: number; q?: string }): Promise<DirectoryPage> {
    return this.get(`/api/v1/graph${queryString(params)}`);
  }

  graphDetail(appKey: string): Promise<unknown> {
    return this.get(`/api/v1/graph/${encodeURIComponent(appKey)}`);
  }
}

/** One row of the public directories. */
export interface DirectoryApp {
  id: number;
  key: string;
  host: string | null;
  title: string | null;
  endpointCount: number;
  viewCount: number;
  lastEndpointAt: string | null;
  lastViewAt: string | null;
}

export interface DirectoryPage {
  apps: DirectoryApp[];
  /** The count BEFORE the limit, so a pager knows how many pages there are. */
  total: number;
}

function queryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}
