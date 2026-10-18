import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { currentPath } from "../../../router";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404", () => {
    renderWithProviders(NotFoundPage, { path: "/entah" });
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("tautan kembali membawa ke beranda", async () => {
    renderWithProviders(NotFoundPage, { path: "/entah" });
    screen.getByRole("link", { name: "Kembali ke beranda" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/"));
  });
});
