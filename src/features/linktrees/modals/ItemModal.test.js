import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";

function setup(props = {}) {
  const onSubmit = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(ItemModal, { props: { onSubmit, onClose, ...props } });
  return { onSubmit, onClose };
}

async function isi(title, url) {
  await fireEvent.input(screen.getByLabelText("Judul tautan"), { target: { value: title } });
  await fireEvent.input(screen.getByLabelText("URL"), { target: { value: url } });
}

describe("ItemModal", () => {
  it("mode tambah: judul 'Tambah Tautan' dan form kosong", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Tambah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul tautan")).toHaveValue("");
    expect(screen.getByLabelText("URL")).toHaveValue("");
  });

  it("mode ubah: judul 'Ubah Tautan' dan form terisi", () => {
    setup({ item: { id: 3, title: "GitHub", url: "https://github.com" } });
    expect(screen.getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul tautan")).toHaveValue("GitHub");
    expect(screen.getByLabelText("URL")).toHaveValue("https://github.com");
  });

  it("error bila judul atau URL kosong", async () => {
    const { onSubmit } = setup();
    screen.getByRole("button", { name: "Simpan" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent("Judul dan URL wajib diisi");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("error bila URL bukan teks URL", async () => {
    const { onSubmit } = setup();
    await isi("Situs", "bukan url");
    screen.getByRole("button", { name: "Simpan" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent("URL harus diawali");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("error bila protokol bukan http atau https", async () => {
    const { onSubmit } = setup();
    await isi("Situs", "ftp://contoh.com");
    screen.getByRole("button", { name: "Simpan" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent("URL harus diawali");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("mengirim data valid yang sudah dirapikan dan menghapus error lama", async () => {
    const { onSubmit } = setup();
    screen.getByRole("button", { name: "Simpan" }).click();
    await screen.findByRole("alert");

    await isi("  GitHub ", " https://github.com ");
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: "GitHub", url: "https://github.com" })
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("Batal menutup modal, dan saving menonaktifkan tombol", () => {
    const { onClose } = setup({ saving: true });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
