import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";

const linkTree = { id: 1, title: "Lama", type: "private", description: "Deskripsi lama" };

describe("ChangeModal", () => {
  it("terisi data link tree dan mengirim perubahan", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(ChangeModal, { props: { linkTree, onSubmit, onClose: vi.fn() } });

    expect(screen.getByRole("dialog", { name: "Ubah Link Tree" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Lama");
    expect(screen.getByLabelText("Visibilitas")).toHaveValue("private");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Deskripsi lama");

    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Baru",
        type: "private",
        description: "Deskripsi lama",
      })
    );
  });

  it("tombol Batal menutup modal", () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeModal, { props: { linkTree, onSubmit: vi.fn(), onClose, saving: false } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
