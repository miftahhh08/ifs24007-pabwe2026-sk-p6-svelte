import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUsers, getMe, putMe, postPhoto, putPassword } from "./usersApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("usersApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetch.mockResolvedValue({ success: true });
  });

  it("getUsers memanggil GET /users", async () => {
    await getUsers();
    expect(apiFetch).toHaveBeenCalledWith("/users");
  });

  it("getMe memanggil GET /users/me", async () => {
    await getMe();
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("putMe memanggil PUT /users/me", async () => {
    await putMe({ name: "Ani", email: "a@b.c" });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Ani", email: "a@b.c" },
    });
  });

  it("postPhoto mengirim FormData berisi photo", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await postPhoto(file);
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/users/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo")).toBe(file);
  });

  it("putPassword memetakan newPassword ke new_password", async () => {
    await putPassword({ password: "lama", newPassword: "baru" });
    expect(apiFetch).toHaveBeenCalledWith("/users/change-password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru" },
    });
  });
});
