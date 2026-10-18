import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import AuthLayout from "./AuthLayout.svelte";
import { renderWithProviders } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan nama aplikasi, teks pengenal, dan isi anak", () => {
    const children = createRawSnippet(() => ({
      render: () => "<p>isi halaman</p>",
    }));
    renderWithProviders(AuthLayout, { props: { children } });

    expect(screen.getByText("Delcom Link Tree")).toBeInTheDocument();
    expect(screen.getByText(/Kumpulkan semua tautan/)).toBeInTheDocument();
    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByTestId("icon-Link2")).toBeInTheDocument();
    // Aksesibilitas: seluruh konten berada di dalam landmark utama
    expect(screen.getByRole("main")).toContainElement(screen.getByText("isi halaman"));
  });
});
