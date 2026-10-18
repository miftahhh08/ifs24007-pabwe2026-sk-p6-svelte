import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import Modal from "./Modal.svelte";
import { renderWithProviders } from "../../../test-utils";

function setup() {
  const onClose = vi.fn();
  const children = createRawSnippet(() => ({
    render: () => "<p>isi modal</p>",
  }));
  renderWithProviders(Modal, { props: { title: "Judul Modal", onClose, children } });
  return onClose;
}

describe("Modal", () => {
  it("menampilkan judul dan isi", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Judul Modal" })).toBeInTheDocument();
    expect(screen.getByText("isi modal")).toBeInTheDocument();
  });

  it("menutup lewat tombol Tutup", () => {
    const onClose = setup();
    screen.getByRole("button", { name: "Tutup" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup saat latar gelap diklik", () => {
    const onClose = setup();
    screen.getByTestId("modal-backdrop").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("tidak menutup saat isi dialog diklik", () => {
    const onClose = setup();
    screen.getByText("isi modal").click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup dengan tombol Escape dan mengabaikan tombol lain", async () => {
    const onClose = setup();
    await fireEvent.keyDown(window, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
