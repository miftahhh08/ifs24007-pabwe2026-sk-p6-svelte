import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import App from "./App.svelte";
import { renderWithProviders } from "./test-utils";
import { currentPath } from "./router";
import { usersStore } from "./features/users/states/usersStore";
import { linkTreesStore } from "./features/linktrees/states/linkTreesStore";
import * as linkTreeApi from "./features/linktrees/api/linkTreeApi";
import * as usersApi from "./features/users/api/usersApi";

vi.mock("./features/linktrees/api/linkTreeApi", () => ({
  getLinkTrees: vi.fn(),
  getLinkTree: vi.fn(),
  postLinkTree: vi.fn(),
  putLinkTree: vi.fn(),
  postCover: vi.fn(),
  deleteLinkTree: vi.fn(),
  deleteAllLinkTrees: vi.fn(),
  postItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
}));
vi.mock("./features/users/api/usersApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));

const me = { id: 1, name: "Ani", email: "ani@mail.com", photo: null };
const detail = { id: 5, title: "Portofolio", description: "", type: "public", cover: null, user_id: 1, items: [] };

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.set({ users: [], profile: null, loading: false, saving: false });
    linkTreesStore.update((s) => ({ ...s, linkTrees: [], detail: null }));
    usersApi.getMe.mockResolvedValue({ data: { user: me } });
    usersApi.getUsers.mockResolvedValue({ data: { users: [me] } });
    linkTreeApi.getLinkTrees.mockResolvedValue({ data: { link_trees: [] } });
    linkTreeApi.getLinkTree.mockResolvedValue({ data: { link_tree: detail } });
  });

  describe("belum login", () => {
    it("membuka / dialihkan ke halaman login", async () => {
      renderWithProviders(App, { path: "/" });
      expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
      expect(get(currentPath)).toBe("/auth/login");
      expect(window.location.pathname).toBe("/auth/login");
    });

    it("rute lain yang butuh login juga dialihkan", async () => {
      renderWithProviders(App, { path: "/link-trees/5" });
      expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
      expect(linkTreeApi.getLinkTree).not.toHaveBeenCalled();
    });

    it("halaman login dan register tampil dalam layout autentikasi", async () => {
      renderWithProviders(App, { path: "/auth/register" });
      expect(await screen.findByRole("heading", { name: "Daftar" })).toBeInTheDocument();
      expect(screen.getByText(/Kumpulkan semua tautan/)).toBeInTheDocument();
    });
  });

  describe("sudah login", () => {
    it("membuka / menampilkan daftar link tree dalam layout aplikasi", async () => {
      renderWithProviders(App, { path: "/", token: "tok" });
      expect(await screen.findByRole("heading", { name: "Semua Link Tree" })).toBeInTheDocument();
      expect(await screen.findByText("Ani")).toBeInTheDocument();
    });

    it("membuka halaman login dialihkan ke beranda", async () => {
      renderWithProviders(App, { path: "/auth/login", token: "tok" });
      expect(await screen.findByRole("heading", { name: "Semua Link Tree" })).toBeInTheDocument();
      await waitFor(() => expect(get(currentPath)).toBe("/"));
    });

    it("membuka /link-trees/:linkTreeId menampilkan detail", async () => {
      renderWithProviders(App, { path: "/link-trees/5", token: "tok" });
      expect(await screen.findByRole("heading", { name: "Portofolio" })).toBeInTheDocument();
      expect(linkTreeApi.getLinkTree).toHaveBeenCalledWith("5");
    });

    it("membuka /users menampilkan daftar pengguna", async () => {
      renderWithProviders(App, { path: "/users", token: "tok" });
      expect(await screen.findByRole("heading", { name: "Pengguna" })).toBeInTheDocument();
    });

    it("membuka /profile menampilkan profil", async () => {
      renderWithProviders(App, { path: "/profile", token: "tok" });
      expect(await screen.findByRole("heading", { name: "Profil" })).toBeInTheDocument();
    });
  });

  describe("path tidak dikenal", () => {
    it("menampilkan NotFoundPage untuk pengguna yang sudah login", async () => {
      renderWithProviders(App, { path: "/entah", token: "tok" });
      expect(await screen.findByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
      expect(get(currentPath)).toBe("/entah");
    });

    it("menampilkan NotFoundPage untuk tamu tanpa dialihkan", async () => {
      renderWithProviders(App, { path: "/entah" });
      expect(await screen.findByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
      expect(get(currentPath)).toBe("/entah");
    });
  });
});
