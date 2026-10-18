import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import Navbar from "./Navbar.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../../users/states/usersStore";
import { authStore } from "../../auth/states/authStore";
import { currentPath } from "../../../router";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({ showConfirmDialog: vi.fn() }));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.set({ users: [], profile: null, loading: false, saving: false });
  });

  it("menampilkan nama aplikasi dan logo", () => {
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() } });
    expect(screen.getByText("Delcom Link Tree")).toBeInTheDocument();
    expect(screen.getByTestId("icon-Link2")).toBeInTheDocument();
  });

  it("tidak menampilkan nama pengguna sebelum profil dimuat", () => {
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() } });
    expect(screen.queryByText("Ani")).not.toBeInTheDocument();
  });

  it("menampilkan nama pengguna saat profil ada", () => {
    usersStore.update((s) => ({ ...s, profile: { name: "Ani" } }));
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() } });
    expect(screen.getByText("Ani")).toBeInTheDocument();
  });

  it("tombol menu memanggil onToggleSidebar", () => {
    const onToggleSidebar = vi.fn();
    renderWithProviders(Navbar, { props: { onToggleSidebar } });
    screen.getByRole("button", { name: "Buka menu" }).click();
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("keluar: bila dikonfirmasi, token dihapus dan pindah ke login", async () => {
    showConfirmDialog.mockResolvedValue(true);
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() }, path: "/", token: "tok" });
    authStore.set({ token: "tok", loading: false });
    screen.getByRole("button", { name: "Keluar" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(get(authStore).token).toBeNull();
  });

  it("keluar: bila dibatalkan, tidak terjadi apa-apa", async () => {
    showConfirmDialog.mockResolvedValue(false);
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() }, path: "/", token: "tok" });
    screen.getByRole("button", { name: "Keluar" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledWith("Yakin ingin keluar?"));
    expect(localStorage.getItem("accessToken")).toBe("tok");
    expect(get(currentPath)).toBe("/");
  });
});
