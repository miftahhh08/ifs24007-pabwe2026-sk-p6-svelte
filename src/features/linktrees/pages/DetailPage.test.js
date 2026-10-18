import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";
import { usersStore } from "../../users/states/usersStore";
import { currentPath } from "../../../router";
import * as api from "../api/linkTreeApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/linkTreeApi", () => ({
  getLinkTrees: vi.fn(),
  getLinkTree: vi.fn(),
  postLinkTree: vi.fn(),
  putLinkTree: vi.fn(),
  postCover: vi.fn(),
  deleteLinkTree: vi.fn(),
  deleteAllLinkTrees: vi.fn(),
  postItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const detail = {
  id: 5,
  title: "Portofolio",
  description: "Karya saya",
  type: "public",
  cover: null,
  user_id: 1,
  items: [
    { id: 10, title: "GitHub", url: "https://github.com" },
    { id: 11, title: "Blog", url: "https://blog.dev" },
  ],
};

const emptyStore = {
  linkTrees: [], detail: null, loading: false, detailLoading: false,
  adding: false, changing: false, changingCover: false,
  deleting: false, deletingAll: false, itemSaving: false,
};

async function renderDetail({ data = detail, profile = { id: 1 } } = {}) {
  api.getLinkTree.mockResolvedValue({ data: { link_tree: data } });
  usersStore.set({ users: [], profile, loading: false, saving: false });
  renderWithProviders(DetailPage, {
    props: { params: { linkTreeId: "5" } },
    path: "/link-trees/5",
  });
  await screen.findByRole("heading", { name: data.title });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTreesStore.set({ ...emptyStore });
  });

  it("memuat detail berdasarkan parameter rute", async () => {
    await renderDetail();
    expect(api.getLinkTree).toHaveBeenCalledWith("5");
    expect(screen.getByText("Publik", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Karya saya")).toBeInTheDocument();
    expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
  });

  it("tipe yang tidak dikenal tetap ditampilkan tanpa merusak halaman", async () => {
    await renderDetail({ data: { ...detail, type: "custom" } });
    expect(screen.getByRole("heading", { name: "Portofolio" })).toBeInTheDocument();
  });

  it("menampilkan item tautan yang membuka tab baru", async () => {
    await renderDetail();
    const link = screen.getByRole("link", { name: /GitHub/ });
    expect(link).toHaveAttribute("href", "https://github.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("menampilkan sampul bila ada dan tanpa deskripsi bila kosong", async () => {
    await renderDetail({ data: { ...detail, cover: "https://x/c.png", description: null } });
    expect(screen.getByAltText("Sampul Portofolio")).toHaveAttribute("src", "https://x/c.png");
    expect(screen.queryByText("Karya saya")).not.toBeInTheDocument();
  });

  it("menampilkan pesan bila belum ada tautan", async () => {
    await renderDetail({ data: { ...detail, items: [] } });
    expect(screen.getByText("Belum ada tautan.")).toBeInTheDocument();
  });

  it("tidak menampilkan detail lama saat data baru dimuat", async () => {
    linkTreesStore.update((s) => ({ ...s, detail: { ...detail, title: "Detail Lama" } }));
    api.getLinkTree.mockReturnValue(new Promise(() => {}));
    renderWithProviders(DetailPage, { props: { params: { linkTreeId: "5" } }, path: "/link-trees/5" });
    expect(await screen.findByText("Memuat link tree...")).toBeInTheDocument();
    expect(screen.queryByText("Detail Lama")).not.toBeInTheDocument();
  });

  it("gagal memuat -> dialog error lalu kembali ke beranda", async () => {
    api.getLinkTree.mockRejectedValue(new Error("Tidak ditemukan"));
    renderWithProviders(DetailPage, { props: { params: { linkTreeId: "99" } }, path: "/link-trees/99" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan"));
    await waitFor(() => expect(get(currentPath)).toBe("/"));
  });

  it("tautan kembali pindah ke beranda", async () => {
    await renderDetail();
    screen.getByRole("link", { name: /Semua Link Tree/ }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/"));
  });

  it("bukan pemilik: tidak ada tombol aksi", async () => {
    await renderDetail({ profile: { id: 2 } });
    expect(screen.queryByRole("button", { name: "Ubah Data" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ubah Sampul" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah Tautan" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ubah GitHub")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Hapus GitHub")).not.toBeInTheDocument();
  });

  it("ubah data: berhasil", async () => {
    api.putLinkTree.mockResolvedValue({});
    await renderDetail();
    screen.getByRole("button", { name: "Ubah Data" }).click();
    await screen.findByRole("dialog", { name: "Ubah Link Tree" });
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil diperbarui"));
    expect(api.putLinkTree).toHaveBeenCalledWith("5", { title: "Baru", type: "public", description: "Karya saya" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ubah data: gagal menampilkan dialog error", async () => {
    api.putLinkTree.mockRejectedValue(new Error("Gagal simpan"));
    await renderDetail();
    screen.getByRole("button", { name: "Ubah Data" }).click();
    await screen.findByRole("dialog");
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal simpan"));
  });

  it("ubah data: modal bisa ditutup dengan Batal", async () => {
    await renderDetail();
    screen.getByRole("button", { name: "Ubah Data" }).click();
    await screen.findByRole("dialog");
    screen.getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("ubah sampul: berhasil", async () => {
    api.postCover.mockResolvedValue({});
    await renderDetail();
    screen.getByRole("button", { name: "Ubah Sampul" }).click();
    await screen.findByRole("dialog", { name: "Ubah Sampul" });
    const file = new File(["x"], "c.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Gambar sampul"), { target: { files: [file] } });
    screen.getByRole("button", { name: "Unggah" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Sampul berhasil diperbarui"));
    expect(api.postCover).toHaveBeenCalledWith("5", file);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ubah sampul: gagal menampilkan dialog error", async () => {
    api.postCover.mockRejectedValue(new Error("Berkas terlalu besar"));
    await renderDetail();
    screen.getByRole("button", { name: "Ubah Sampul" }).click();
    await screen.findByRole("dialog");
    const file = new File(["x"], "c.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Gambar sampul"), { target: { files: [file] } });
    screen.getByRole("button", { name: "Unggah" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Berkas terlalu besar"));
  });

  it("ubah sampul: modal bisa ditutup dengan Batal", async () => {
    await renderDetail();
    screen.getByRole("button", { name: "Ubah Sampul" }).click();
    await screen.findByRole("dialog");
    screen.getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("tambah tautan: berhasil", async () => {
    api.postItem.mockResolvedValue({});
    await renderDetail();
    screen.getByRole("button", { name: "Tambah Tautan" }).click();
    await screen.findByRole("dialog", { name: "Tambah Tautan" });
    await fireEvent.input(screen.getByLabelText("Judul tautan"), { target: { value: "Docs" } });
    await fireEvent.input(screen.getByLabelText("URL"), { target: { value: "https://docs.dev" } });
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil disimpan"));
    expect(api.postItem).toHaveBeenCalledWith("5", { title: "Docs", url: "https://docs.dev" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tambah tautan: gagal menampilkan dialog error", async () => {
    api.postItem.mockRejectedValue(new Error("URL ditolak"));
    await renderDetail();
    screen.getByRole("button", { name: "Tambah Tautan" }).click();
    await screen.findByRole("dialog");
    await fireEvent.input(screen.getByLabelText("Judul tautan"), { target: { value: "Docs" } });
    await fireEvent.input(screen.getByLabelText("URL"), { target: { value: "https://docs.dev" } });
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("URL ditolak"));
  });

  it("ubah tautan: form terisi dan menyimpan perubahan", async () => {
    api.putItem.mockResolvedValue({});
    await renderDetail();
    screen.getByLabelText("Ubah GitHub").click();
    await screen.findByRole("dialog", { name: "Ubah Tautan" });
    expect(screen.getByLabelText("Judul tautan")).toHaveValue("GitHub");
    await fireEvent.input(screen.getByLabelText("Judul tautan"), { target: { value: "GH" } });
    screen.getByRole("button", { name: "Simpan" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil disimpan"));
    expect(api.putItem).toHaveBeenCalledWith("5", 10, { title: "GH", url: "https://github.com" });
  });

  it("ubah tautan lalu tambah tautan: modal tambah kembali kosong", async () => {
    await renderDetail();
    screen.getByLabelText("Ubah GitHub").click();
    await screen.findByRole("dialog", { name: "Ubah Tautan" });
    screen.getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    screen.getByRole("button", { name: "Tambah Tautan" }).click();
    await screen.findByRole("dialog", { name: "Tambah Tautan" });
    expect(screen.getByLabelText("Judul tautan")).toHaveValue("");
  });

  it("hapus tautan: dikonfirmasi -> API dipanggil", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteItem.mockResolvedValue({});
    await renderDetail();
    screen.getByLabelText("Hapus GitHub").click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil dihapus"));
    expect(api.deleteItem).toHaveBeenCalledWith("5", 10);
  });

  it("hapus tautan: dibatalkan -> API tidak dipanggil", async () => {
    showConfirmDialog.mockResolvedValue(false);
    await renderDetail();
    screen.getByLabelText("Hapus GitHub").click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteItem).not.toHaveBeenCalled();
  });

  it("hapus tautan: gagal -> dialog error", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteItem.mockRejectedValue(new Error("Gagal hapus tautan"));
    await renderDetail();
    screen.getByLabelText("Hapus GitHub").click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus tautan"));
  });
});
