import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  usersStore,
  fetchUsers,
  fetchProfile,
  updateProfile,
  updatePhoto,
  updatePassword,
} from "./usersStore";
import {
  getUsers,
  getMe,
  putMe,
  postPhoto,
  putPassword,
} from "../api/usersApi";

vi.mock("../api/usersApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));

describe("usersStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.set({ users: [], profile: null, loading: false, saving: false });
  });

  it("fetchUsers mengisi daftar pengguna", async () => {
    getUsers.mockResolvedValue({ data: { users: [{ id: 1 }] } });
    await fetchUsers();
    expect(get(usersStore).users).toEqual([{ id: 1 }]);
    expect(get(usersStore).loading).toBe(false);
  });

  it("fetchUsers gagal melempar error dan loading kembali false", async () => {
    getUsers.mockRejectedValue(new Error("gagal"));
    await expect(fetchUsers()).rejects.toThrow("gagal");
    expect(get(usersStore).loading).toBe(false);
  });

  it("fetchProfile mengisi profil", async () => {
    getMe.mockResolvedValue({ data: { user: { id: 1, name: "Ani" } } });
    await fetchProfile();
    expect(get(usersStore).profile.name).toBe("Ani");
    expect(get(usersStore).loading).toBe(false);
  });

  it("fetchProfile gagal melempar error dan loading kembali false", async () => {
    getMe.mockRejectedValue(new Error("gagal"));
    await expect(fetchProfile()).rejects.toThrow("gagal");
    expect(get(usersStore).loading).toBe(false);
  });

  it("updateProfile menyimpan lalu memuat ulang profil", async () => {
    putMe.mockResolvedValue({});
    getMe.mockResolvedValue({ data: { user: { name: "Baru" } } });
    await updateProfile({ name: "Baru", email: "a@b.c" });
    expect(putMe).toHaveBeenCalledWith({ name: "Baru", email: "a@b.c" });
    expect(get(usersStore).profile.name).toBe("Baru");
    expect(get(usersStore).saving).toBe(false);
  });

  it("updatePhoto mengunggah lalu memuat ulang profil", async () => {
    const file = new File(["x"], "f.png");
    postPhoto.mockResolvedValue({});
    getMe.mockResolvedValue({ data: { user: { photo: "url" } } });
    await updatePhoto(file);
    expect(postPhoto).toHaveBeenCalledWith(file);
    expect(get(usersStore).profile.photo).toBe("url");
  });

  it("updatePassword memanggil API dan saving kembali false", async () => {
    putPassword.mockResolvedValue({});
    await updatePassword({ password: "a", newPassword: "b" });
    expect(putPassword).toHaveBeenCalledWith({ password: "a", newPassword: "b" });
    expect(get(usersStore).saving).toBe(false);
  });

  it("aksi simpan yang gagal melempar error dan saving kembali false", async () => {
    putPassword.mockRejectedValue(new Error("Sandi salah"));
    await expect(
      updatePassword({ password: "a", newPassword: "b" })
    ).rejects.toThrow("Sandi salah");
    expect(get(usersStore).saving).toBe(false);
  });
});
