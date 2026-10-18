import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import Sidebar from "./Sidebar.svelte";
import { renderWithProviders } from "../../../test-utils";
import { currentPath } from "../../../router";

describe("Sidebar", () => {
  it("menampilkan tiga menu dengan 'Semua Link Tree' sebagai menu utama", () => {
    renderWithProviders(Sidebar, { props: { onClose: vi.fn() }, path: "/" });
    expect(screen.getByRole("link", { name: /Semua Link Tree/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pengguna/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profil/ })).toBeInTheDocument();
  });

  it("menandai menu aktif untuk setiap path", () => {
    const { unmount } = renderWithProviders(Sidebar, { props: { onClose: vi.fn() }, path: "/" });
    expect(screen.getByRole("link", { name: /Semua Link Tree/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Pengguna/ })).not.toHaveAttribute("aria-current");
    unmount();

    const r2 = renderWithProviders(Sidebar, { props: { onClose: vi.fn() }, path: "/link-trees/5" });
    expect(screen.getByRole("link", { name: /Semua Link Tree/ })).toHaveAttribute("aria-current", "page");
    r2.unmount();

    const r3 = renderWithProviders(Sidebar, { props: { onClose: vi.fn() }, path: "/users" });
    expect(screen.getByRole("link", { name: /Pengguna/ })).toHaveAttribute("aria-current", "page");
    r3.unmount();

    renderWithProviders(Sidebar, { props: { onClose: vi.fn() }, path: "/profile" });
    expect(screen.getByRole("link", { name: /Profil/ })).toHaveAttribute("aria-current", "page");
  });

  it("mengeklik menu berpindah halaman dan menutup sidebar", async () => {
    const onClose = vi.fn();
    renderWithProviders(Sidebar, { props: { onClose }, path: "/" });
    screen.getByRole("link", { name: /Profil/ }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/profile"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("latar gelap hanya ada saat terbuka dan menutup sidebar bila diklik", () => {
    const onClose = vi.fn();
    const { unmount } = renderWithProviders(Sidebar, { props: { onClose, open: false } });
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    unmount();

    renderWithProviders(Sidebar, { props: { onClose, open: true } });
    screen.getByTestId("sidebar-backdrop").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
