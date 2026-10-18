import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  authStore,
  isAuthenticated,
  login,
  register,
  logout,
} from "./authStore";
import { postLogin, postRegister } from "../api/authApi";

vi.mock("../api/authApi", () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
}));

describe("authStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authStore.set({ token: null, loading: false });
  });

  it("isAuthenticated false saat token kosong", () => {
    expect(get(isAuthenticated)).toBe(false);
  });

  it("login menyimpan token dan mengubah isAuthenticated", async () => {
    postLogin.mockResolvedValue({ data: { token: "tok123" } });
    await login({ email: "a@b.c", password: "123456" });
    expect(localStorage.getItem("accessToken")).toBe("tok123");
    expect(get(authStore).token).toBe("tok123");
    expect(get(authStore).loading).toBe(false);
    expect(get(isAuthenticated)).toBe(true);
  });

  it("login yang gagal melempar error dan loading kembali false", async () => {
    postLogin.mockRejectedValue(new Error("Salah"));
    await expect(login({ email: "a", password: "b" })).rejects.toThrow("Salah");
    expect(get(authStore).loading).toBe(false);
    expect(get(authStore).token).toBeNull();
  });

  it("register berhasil mengembalikan respons", async () => {
    postRegister.mockResolvedValue({ success: true });
    const res = await register({ name: "A", email: "a@b.c", password: "123456" });
    expect(res.success).toBe(true);
    expect(get(authStore).loading).toBe(false);
  });

  it("register gagal melempar error dan loading kembali false", async () => {
    postRegister.mockRejectedValue(new Error("Email dipakai"));
    await expect(
      register({ name: "A", email: "a", password: "b" })
    ).rejects.toThrow("Email dipakai");
    expect(get(authStore).loading).toBe(false);
  });

  it("logout menghapus token", () => {
    localStorage.setItem("accessToken", "x");
    authStore.set({ token: "x", loading: false });
    logout();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(get(isAuthenticated)).toBe(false);
  });
});
