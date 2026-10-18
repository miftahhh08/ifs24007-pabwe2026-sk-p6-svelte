import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
import LinkTreeForm from "./LinkTreeForm.svelte";
import { renderWithProviders } from "../../../test-utils";

function setup(props = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  renderWithProviders(LinkTreeForm, {
    props: { submitLabel: "Tambah", onSubmit, onCancel, ...props },
  });
  return { onSubmit, onCancel };
}

describe("LinkTreeForm", () => {
  it("memakai nilai awal default (kosong, publik)", () => {
    setup();
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    expect(screen.getByLabelText("Visibilitas")).toHaveValue("public");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
  });

  it("memakai nilai awal dari prop initial, deskripsi null menjadi kosong", () => {
    setup({ initial: { title: "Lama", type: "private", description: null } });
    expect(screen.getByLabelText("Judul")).toHaveValue("Lama");
    expect(screen.getByLabelText("Visibilitas")).toHaveValue("private");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
  });

  it("tipe null dari server tidak memilih opsi apa pun", () => {
    setup({ initial: { title: "Lama", type: null, description: "" } });
    expect(screen.getByLabelText("Visibilitas").selectedIndex).toBe(-1);
  });

  it("menampilkan error bila judul kosong", async () => {
    const { onSubmit } = setup();
    screen.getByRole("button", { name: "Tambah" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent("Judul wajib diisi");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("mengirim data yang sudah dirapikan dan menghapus error sebelumnya", async () => {
    const { onSubmit } = setup();
    screen.getByRole("button", { name: "Tambah" }).click();
    await screen.findByRole("alert");

    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "  Portofolio " } });
    await fireEvent.change(screen.getByLabelText("Visibilitas"), { target: { value: "unlisted" } });
    await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: " Tautanku " } });
    screen.getByRole("button", { name: "Tambah" }).click();

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Portofolio",
        type: "unlisted",
        description: "Tautanku",
      })
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("tombol Batal memanggil onCancel", () => {
    const { onCancel } = setup();
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("menonaktifkan tombol dan mengubah label saat saving", () => {
    setup({ saving: true });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
