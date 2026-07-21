import type { NetworkClient, NetworkRequestOptions, NetworkResponse } from "@sudobility/types";

type HeaderSource =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);

/**
 * Plain fetch-backed NetworkClient for non-React contexts (service worker,
 * tests, Node scripts). `getHeaders` is merged into every request — e.g.
 * `async () => ({ authorization: `Bearer ${token}` })`.
 */
export function createFetchNetworkClient(getHeaders?: HeaderSource): NetworkClient {
  async function request<T>(
    url: string,
    options?: NetworkRequestOptions | null,
  ): Promise<NetworkResponse<T>> {
    const extra = typeof getHeaders === "function" ? await getHeaders() : (getHeaders ?? {});
    const res = await fetch(url, {
      method: options?.method ?? "GET",
      headers: { "content-type": "application/json", ...extra, ...options?.headers },
      body: options?.body ?? undefined,
      signal: options?.signal ?? undefined,
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v;
    });
    let data: T | undefined;
    try {
      data = (await res.json()) as T;
    } catch {
      data = undefined;
    }
    return {
      success: res.ok,
      timestamp: new Date().toISOString(),
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      headers,
      data: data as T,
    };
  }

  return {
    request,
    get: (url, o) => request(url, { ...o, method: "GET" }),
    post: (url, body, o) =>
      request(url, {
        ...o,
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    put: (url, body, o) =>
      request(url, {
        ...o,
        method: "PUT",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    delete: (url, o) => request(url, { ...o, method: "DELETE" }),
  };
}
