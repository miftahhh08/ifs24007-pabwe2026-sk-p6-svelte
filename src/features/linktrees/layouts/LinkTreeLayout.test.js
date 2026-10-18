import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { get } from "svelte/store";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../../users/states/usersStore";
import { authStore } from "../../auth/states/authStore";
import { currentPath } from "../../../router";
import { getMe } from "../../users/api/usersApi";

vi.mock("../../users/api/usersApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));

const children = createRawSnippet(() => ({ render: () => "<p>isi halaman</p>" }));

describe("LinkTreeLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.set({ users: [], profile: null, loading: false, saving: false });
  });

  it("membungkus isi dengan navbar dan sidebar dan memuat profil", async () => {
    getMe.mockResolvedValue({ data: { user: { name: "Ani" } } });
    renderWithProviders(LinkTreeLayout, { props: { children }, path: "/", token: "tok" });

    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Semua Link Tree/ })).toBeInTheDocument();
    expect(await screen.findByText("Ani")).toBeInTheDocument();
  });

  it("tombol menu membuka lalu menutup sidebar", async () => {
    getMe.mockResolvedValue({ data: { user: { name: "Ani" } } });
    renderWithProviders(LinkTreeLayout, { props: { children }, path: "/", token: "tok" });
    await screen.findByText("Ani");

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    screen.getByRole("button", { name: "Buka menu" }).click();
    const backdrop = await screen.findByTestId("sidebar-backdrop");
    backdrop.click();
    await waitFor(() => expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument());
  });

  it("bila profil gagal dimuat, keluar dan kembali ke halaman login", async () => {
    getMe.mockRejectedValue(new Error("Unauthorized"));
    authStore.set({ token: "tok", loading: false });
    renderWithProviders(LinkTreeLayout, { props: { children }, path: "/", token: "tok" });

    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(get(authStore).token).toBeNull();
  });
});
