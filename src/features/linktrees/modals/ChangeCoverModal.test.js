import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";

function setup(props = {}) {
  const onSubmit = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(ChangeCoverModal, { props: { onSubmit, onClose, ...props } });
  return { onSubmit, onClose };
}

describe("ChangeCoverModal", () => {
  it("menampilkan error bila belum memilih gambar", async () => {
    const { onSubmit } = setup();
    screen.getByRole("button", { name: "Unggah" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent("Pilih gambar terlebih dahulu");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("menampilkan error bila berkas bukan gambar", async () => {
    const { onSubmit } = setup();
    const pdf = new File(["x"], "dokumen.pdf", { type: "application/pdf" });
    await fireEvent.change(screen.getByLabelText("Gambar sampul"), { target: { files: [pdf] } });
    screen.getByRole("button", { name: "Unggah" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent("Berkas harus berupa gambar");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("mengirim gambar yang valid dan menampilkan nama berkas", async () => {
    const { onSubmit } = setup();
    const img = new File(["x"], "cover.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Gambar sampul"), { target: { files: [img] } });
    expect(await screen.findByText("cover.png")).toBeInTheDocument();
    screen.getByRole("button", { name: "Unggah" }).click();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(img));
  });

  it("menghapus error lama setelah pengiriman valid", async () => {
    setup();
    screen.getByRole("button", { name: "Unggah" }).click();
    await screen.findByRole("alert");
    const img = new File(["x"], "cover.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Gambar sampul"), { target: { files: [img] } });
    screen.getByRole("button", { name: "Unggah" }).click();
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("memilih lalu membatalkan pilihan berkas menghapus nama berkas", async () => {
    setup();
    const img = new File(["x"], "cover.png", { type: "image/png" });
    const input = screen.getByLabelText("Gambar sampul");
    await fireEvent.change(input, { target: { files: [img] } });
    expect(await screen.findByText("cover.png")).toBeInTheDocument();
    await fireEvent.change(input, { target: { files: [] } });
    await waitFor(() => expect(screen.queryByText("cover.png")).not.toBeInTheDocument());
  });

  it("Batal menutup modal, dan saving menonaktifkan tombol", () => {
    const { onClose } = setup({ saving: true });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Mengunggah..." })).toBeDisabled();
  });
});
