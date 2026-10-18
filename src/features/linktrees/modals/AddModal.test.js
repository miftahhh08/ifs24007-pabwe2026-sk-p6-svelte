import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";

describe("AddModal", () => {
  it("menampilkan form tambah dan mengirim data", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onSubmit, onClose } });

    expect(screen.getByRole("dialog", { name: "Tambah Link Tree" })).toBeInTheDocument();
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    screen.getByRole("button", { name: "Tambah" }).click();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: "Baru", type: "public", description: "" })
    );
  });

  it("tombol Batal menutup modal dan saving menonaktifkan tombol", () => {
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onSubmit: vi.fn(), onClose, saving: true } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
