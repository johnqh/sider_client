import { describe, expect, test } from "bun:test";
import type { NetworkClient, NetworkResponse } from "@sudobility/types";
import { SiderClient } from "./SiderClient";

function stubNetwork(data: unknown, ok = true): { client: NetworkClient; calls: string[] } {
  const calls: string[] = [];
  const respond = <T>(url: string): Promise<NetworkResponse<T>> => {
    calls.push(url);
    return Promise.resolve({
      ok,
      status: ok ? 200 : 500,
      statusText: ok ? "OK" : "ERR",
      headers: {},
      data: { success: ok, data, error: ok ? undefined : "boom" } as T,
    } as NetworkResponse<T>);
  };
  const client: NetworkClient = {
    request: (url) => respond(url),
    get: (url) => respond(url),
    post: (url) => respond(url),
    put: (url) => respond(url),
    delete: (url) => respond(url),
  };
  return { client, calls };
}

describe("SiderClient", () => {
  test("builds URLs and unwraps the ApiResponse envelope", async () => {
    const { client, calls } = stubNetwork([{ id: "s1" }]);
    const sider = new SiderClient(client, "http://localhost:8090");
    const sites = await sider.listSites();
    expect(sites as unknown).toEqual([{ id: "s1" }]);
    expect(calls[0]).toBe("http://localhost:8090/api/v1/sites");
  });

  test("encodes query params", async () => {
    const { client, calls } = stubNetwork({ known: false });
    const sider = new SiderClient(client, "http://localhost:8090");
    await sider.lookup("https://a.example");
    expect(calls[0]).toBe(
      "http://localhost:8090/api/v1/sites/lookup?origin=https%3A%2F%2Fa.example",
    );
  });

  test("getTools flags map to query params", async () => {
    const { client, calls } = stubNetwork({ tools: [] });
    const sider = new SiderClient(client, "http://localhost:8090");
    await sider.getTools("s1", { includeProvisional: true });
    expect(calls[0]).toBe("http://localhost:8090/api/v1/sites/s1/tools?includeProvisional=1");
  });

  test("throws the envelope error on failure", async () => {
    const { client } = stubNetwork(null, false);
    const sider = new SiderClient(client, "http://localhost:8090");
    await expect(sider.getStats()).rejects.toThrow("boom");
  });
});
