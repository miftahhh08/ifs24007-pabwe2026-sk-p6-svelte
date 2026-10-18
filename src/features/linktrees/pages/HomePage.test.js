import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import HomePage from "./HomePage.svelte";
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

const list = [
  { id: 1, title: "Portofolio", description: "Karya saya", type: "public", cover: "https://x/c.png", user_id: 1 },
  { id: 2, title: "Rahasia", description: null, type: "private", cover: null, user_id: 1 },
  { id: 3, title: "Milik Budi", description: "Tautan Budi", type: "unlisted", cover: null, user_id: 2 },
];

const emptyStore = {
  linkTrees: [], detail: null, loading: false, detailLoading: false,
  adding: false, changing: false, changingCover: false,
  deleting: false, deletingAll: false, itemSaving: false,
};

async function renderHome({ profile = { id: 1 } } = {}) {
  usersStore.set({ users: [], profile, loading: false, saving: false });
  renderWithProviders(HomePage, { path: "/" });
  await screen.findByText("Portofolio");
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTreesStore.set({ ...emptyStore });
    api.getLinkTrees.mockResolvedValue({ data: { link_trees: list } });
  });

  it("menampilkan daftar, label tipe, sampul, dan placeholder", async () => {
    await renderHome();
    expect(screen.getByText("Rahasia")).toBeInTheDocument();
    expect(screen.getByText("Milik Budi")).toBeInTheDocument();
    expect(screen.getByText("Publik", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByAltText("Sampul Portofolio")).toHaveAttribute("src", "https://x/c.png");
    expect(screen.getAllByTestId("cover-placeholder")).toHaveLength(2);
    expect(screen.getByText("Karya saya")).toBeInTheDocument();
  });

  it("tipe yang tidak dikenal tetap ditampilkan tanpa merusak halaman", async () => {
    api.getLinkTrees.mockResolvedValue({
      data: { link_trees: [{ id: 9, title: "Tipe Baru", description: "x", type: "custom", cover: null, user_id: 2 }] },
    });
    usersStore.set({ users: [], profile: { id: 1 }, loading: false, saving: false });
    renderWithProviders(HomePage, { path: "/" });
    expect(await screen.findByText("Tipe Baru")).toBeInTheDocument();
  });

  it("menampilkan kartu statistik", async () => {
    await renderHome();
    const cards = screen.getAllByTestId("stat-card");
    expect(cards[0]).toHaveTextContent(/Total\s*3/);
    expect(cards[1]).toHaveTextContent(/Publik\s*1/);
    expect(cards[2]).toHaveTextContent(/Tidak terdaftar\s*1/);
    expect(cards[3]).toHaveTextContent(/Privat\s*1/);
  });

  it("menampilkan 'Memuat link tree...' saat loading", async () => {
    api.getLinkTrees.mockReturnValue(new Promise(() => {}));
    renderWithProviders(HomePage, { path: "/" });
    expect(await screen.findByText("Memuat link tree...")).toBeInTheDocument();
  });

  it("dialog error bila gagal memuat", async () => {
    api.getLinkTrees.mockRejectedValue(new Error("Server mati"));
    renderWithProviders(HomePage, { path: "/" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Server mati"));
  });

  it("pencarian memfilter berdasarkan judul dan deskripsi", async () => {
    await renderHome();
    await fireEvent.input(screen.getByLabelText("Cari link tree"), { target: { value: " tautan budi " } });
    expect(screen.queryByText("Portofolio")).not.toBeInTheDocument();
    expect(screen.getByText("Milik Budi")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila tidak ada yang cocok", async () => {
    await renderHome();
    await fireEvent.input(screen.getByLabelText("Cari link tree"), { target: { value: "zzz" } });
    expect(screen.getByText("Belum ada link tree yang cocok.")).toBeInTheDocument();
  });

  it("filter 'Milik saya' hanya menampilkan milik pengguna", async () => {
    await renderHome();
    await fireEvent.click(screen.getByLabelText("Milik saya"));
    expect(screen.getByText("Portofolio")).toBeInTheDocument();
    expect(screen.queryByText("Milik Budi")).not.toBeInTheDocument();
  });

  it("filter 'Milik saya' kosong bila profil belum ada", async () => {
    await renderHome({ profile: null });
    await fireEvent.click(screen.getByLabelText("Milik saya"));
    expect(screen.getByText("Belum ada link tree yang cocok.")).toBeInTheDocument();
  });

  it("tombol hapus hanya ada untuk milik sendiri", async () => {
    await renderHome();
    expect(screen.getByLabelText("Hapus Portofolio")).toBeInTheDocument();
    expect(screen.queryByLabelText("Hapus Milik Budi")).not.toBeInTheDocument();
  });

  it("mengeklik kartu membuka halaman detail", async () => {
    await renderHome();
    screen.getByRole("link", { name: /Portofolio/ }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/link-trees/1"));
  });

  it("hapus satu: dikonfirmasi -> terhapus dan dialog sukses", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteLinkTree.mockResolvedValue({});
    await renderHome();
    screen.getByLabelText("Hapus Portofolio").click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil dihapus"));
    expect(api.deleteLinkTree).toHaveBeenCalledWith(1);
    expect(screen.queryByText("Portofolio")).not.toBeInTheDocument();
  });

  it("hapus satu: dibatalkan -> tidak memanggil API", async () => {
    showConfirmDialog.mockResolvedValue(false);
    await renderHome();
    screen.getByLabelText("Hapus Portofolio").click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteLinkTree).not.toHaveBeenCalled();
  });

  it("hapus satu: gagal -> dialog error", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteLinkTree.mockRejectedValue(new Error("Tidak boleh"));
    await renderHome();
    screen.getByLabelText("Hapus Portofolio").click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Tidak boleh"));
  });

  it("hapus semua: dikonfirmasi -> koleksi kosong", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteAllLinkTrees.mockResolvedValue({});
    await renderHome();
    screen.getByRole("button", { name: "Hapus Semua" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Semua link tree berhasil dihapus"));
    expect(screen.getByText("Belum ada link tree yang cocok.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hapus Semua" })).not.toBeInTheDocument();
  });

  it("hapus semua: dibatalkan -> tidak memanggil API", async () => {
    showConfirmDialog.mockResolvedValue(false);
    await renderHome();
    screen.getByRole("button", { name: "Hapus Semua" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledWith("Hapus semua link tree?"));
    expect(api.deleteAllLinkTrees).not.toHaveBeenCalled();
  });

  it("hapus semua: gagal -> dialog error", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteAllLinkTrees.mockRejectedValue(new Error("Gagal hapus"));
    await renderHome();
    screen.getByRole("button", { name: "Hapus Semua" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus"));
  });

  it("tambah: mengisi form -> link tree dibuat dan modal tertutup", async () => {
    api.postLinkTree.mockResolvedValue({ data: {} });
    await renderHome();
    screen.getByRole("button", { name: "Tambah Link Tree" }).click();
    await screen.findByRole("dialog", { name: "Tambah Link Tree" });
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    screen.getByRole("button", { name: "Tambah" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil ditambahkan"));
    expect(api.postLinkTree).toHaveBeenCalledWith({ title: "Baru", type: "public", description: "" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tambah: gagal -> dialog error dan modal tetap terbuka", async () => {
    api.postLinkTree.mockRejectedValue(new Error("Judul sudah ada"));
    await renderHome();
    screen.getByRole("button", { name: "Tambah Link Tree" }).click();
    await screen.findByRole("dialog");
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    screen.getByRole("button", { name: "Tambah" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Judul sudah ada"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("modal tambah bisa ditutup dengan Batal", async () => {
    await renderHome();
    screen.getByRole("button", { name: "Tambah Link Tree" }).click();
    await screen.findByRole("dialog");
    screen.getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
