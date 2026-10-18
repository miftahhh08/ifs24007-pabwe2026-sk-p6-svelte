import { describe, it, expect, vi, beforeEach } from "vitest";
import { postLogin, postRegister } from "./authApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("authApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("postLogin mengirim POST /auth/login", async () => {
    apiFetch.mockResolvedValue({ success: true });
    await postLogin({ email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
    });
  });

  it("postRegister mengirim POST /auth/register", async () => {
    apiFetch.mockResolvedValue({ success: true });
    await postRegister({ name: "Ani", email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Ani", email: "a@b.c", password: "123456" },
    });
  });
});
