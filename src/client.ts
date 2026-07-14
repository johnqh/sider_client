// SiderClient — the typed transport over sider_api. Usable in any JS context
// (React or a service worker); the React hooks in ./hooks wrap it. It unwraps
// the ApiResponse envelope and throws on error.

import type {
  ApiResponse,
  CaptureRequest,
  CaptureResponse,
  Site,
  SiteLookupResult,
  StatsResponse,
  ToolCatalog,
} from "@sudobility/sider_types";

export interface SiderClientConfig {
  baseUrl: string;
  /** Supplies auth headers (dev uid now, Firebase bearer later). */
  getAuthHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
}

export class SiderClient {
  constructor(private readonly config: SiderClientConfig) {}

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const auth = (await this.config.getAuthHeaders?.()) ?? {};
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...auth, ...(init?.headers ?? {}) },
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) throw new Error(json.error);
    return json.data;
  }

  lookup(origin: string) {
    return this.req<SiteLookupResult>(`/api/v1/sites/lookup?origin=${encodeURIComponent(origin)}`);
  }

  getSite(id: string) {
    return this.req<Site>(`/api/v1/sites/${id}`);
  }

  listSites() {
    return this.req<Site[]>(`/api/v1/sites`);
  }

  getStats() {
    return this.req<StatsResponse>(`/api/v1/stats`);
  }

  getTools(siteId: string, includeProvisional = false) {
    return this.req<ToolCatalog>(
      `/api/v1/sites/${siteId}/tools${includeProvisional ? "?includeProvisional=1" : ""}`,
    );
  }

  uploadCapture(body: CaptureRequest) {
    return this.req<CaptureResponse>(`/api/v1/capture`, { method: "POST", body: JSON.stringify(body) });
  }
}
