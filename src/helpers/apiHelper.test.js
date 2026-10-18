import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiFetch,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

function mockFetch(json, ok = true) {
  const fn = vi.fn().mockResolvedValue({ ok, json: async () => json });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("apiHelper", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("GET tanpa token dan tanpa body", async () => {
    const fn = mockFetch({ success: true, data: {} });
    const res = await apiFetch("/link-trees");
    expect(res.success).toBe(true);
    expect(fn).toHaveBeenCalledWith(
      `${DELCOM_BASEURL}/link-trees`,
      expect.objectContaining({ headers: {}, body: undefined })
    );
  });

  it("menambahkan header Authorization bila token ada", async () => {
    putAccessToken("tok");
    const fn = mockFetch({ success: true });
    await apiFetch("/users/me");
    expect(fn.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("mengirim body object sebagai JSON", async () => {
    const fn = mockFetch({ success: true });
    await apiFetch("/auth/login", { method: "POST", body: { email: "a" } });
    const init = fn.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ email: "a" }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const fn = mockFetch({ success: true });
    const form = new FormData();
    form.append("cover", "x");
    await apiFetch("/link-trees/1/cover", { method: "POST", body: form });
    const init = fn.mock.calls[0][1];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error dengan pesan server saat HTTP gagal", async () => {
    mockFetch({ success: false, message: "Token tidak valid" }, false);
    await expect(apiFetch("/users/me")).rejects.toThrow("Token tidak valid");
  });

  it("melempar error saat success === false walau HTTP 200", async () => {
    mockFetch({ success: false, message: "Gagal" }, true);
    await expect(apiFetch("/x")).rejects.toThrow("Gagal");
  });

  it("memakai pesan default bila server tidak memberi pesan", async () => {
    mockFetch({ success: false }, false);
    await expect(apiFetch("/x")).rejects.toThrow(
      "Terjadi kesalahan pada server"
    );
  });
});
