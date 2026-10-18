import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ProfilePage from "./ProfilePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../states/usersStore";
import { getMe, putMe, postPhoto, putPassword } from "../api/usersApi";
import {
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/usersApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

const profile = { id: 1, name: "Ani", email: "ani@mail.com", photo: null };

async function renderLoaded(user = profile) {
  getMe.mockResolvedValue({ data: { user } });
  renderWithProviders(ProfilePage, { path: "/profile" });
  await screen.findByLabelText("Nama");
  await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue(user.name));
}

async function isiPassword(lama, baru, konfirmasi) {
  await fireEvent.input(screen.getByLabelText("Kata Sandi Saat Ini"), { target: { value: lama } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi Baru"), { target: { value: baru } });
  await fireEvent.input(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), { target: { value: konfirmasi } });
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.set({ users: [], profile: null, loading: false, saving: false });
  });

  it("menampilkan 'Memuat profil...' sebelum data siap", () => {
    getMe.mockReturnValue(new Promise(() => {}));
    renderWithProviders(ProfilePage, { path: "/profile" });
    expect(screen.getByText("Memuat profil...")).toBeInTheDocument();
  });

  it("mengisi form dari profil dan menampilkan inisial bila tanpa foto", async () => {
    await renderLoaded();
    expect(screen.getByLabelText("Email")).toHaveValue("ani@mail.com");
    expect(screen.getByTestId("avatar-initial")).toHaveTextContent("A");
  });

  it("menampilkan foto bila profil punya foto", async () => {
    await renderLoaded({ ...profile, photo: "https://x/ani.png" });
    expect(screen.getByAltText("Foto profil")).toHaveAttribute("src", "https://x/ani.png");
  });

  it("menampilkan dialog error bila gagal memuat profil", async () => {
    getMe.mockRejectedValue(new Error("Tidak berwenang"));
    renderWithProviders(ProfilePage, { path: "/profile" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Tidak berwenang"));
  });

  it("memperingatkan bila nama atau email kosong", async () => {
    await renderLoaded();
    await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: " " } });
    screen.getByRole("button", { name: "Simpan Perubahan" }).click();
    await waitFor(() => expect(showWarningDialog).toHaveBeenCalledWith("Nama dan email wajib diisi"));
    expect(putMe).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan profil", async () => {
    putMe.mockResolvedValue({});
    await renderLoaded();
    await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: " Ani Baru " } });
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "baru@mail.com" } });
    getMe.mockResolvedValue({ data: { user: { ...profile, name: "Ani Baru" } } });
    screen.getByRole("button", { name: "Simpan Perubahan" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Profil berhasil diperbarui"));
    expect(putMe).toHaveBeenCalledWith({ name: "Ani Baru", email: "baru@mail.com" });
  });

  it("menampilkan error bila simpan profil gagal", async () => {
    putMe.mockRejectedValue(new Error("Email dipakai"));
    await renderLoaded();
    screen.getByRole("button", { name: "Simpan Perubahan" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai"));
  });

  it("mengunggah foto baru", async () => {
    postPhoto.mockResolvedValue({});
    await renderLoaded();
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Ubah Foto"), { target: { files: [file] } });
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Foto profil berhasil diperbarui"));
    expect(postPhoto).toHaveBeenCalledWith(file);
  });

  it("tidak melakukan apa-apa bila tidak ada file dipilih", async () => {
    await renderLoaded();
    await fireEvent.change(screen.getByLabelText("Ubah Foto"), { target: { files: [] } });
    expect(postPhoto).not.toHaveBeenCalled();
  });

  it("menampilkan error bila unggah foto gagal", async () => {
    postPhoto.mockRejectedValue(new Error("File terlalu besar"));
    await renderLoaded();
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Ubah Foto"), { target: { files: [file] } });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar"));
  });

  it("memperingatkan bila kolom kata sandi ada yang kosong", async () => {
    await renderLoaded();
    screen.getByRole("button", { name: "Ubah Kata Sandi" }).click();
    await waitFor(() => expect(showWarningDialog).toHaveBeenCalledWith("Semua kolom kata sandi wajib diisi"));
  });

  it("memperingatkan bila konfirmasi tidak sama", async () => {
    await renderLoaded();
    await isiPassword("lama", "baru123", "beda123");
    screen.getByRole("button", { name: "Ubah Kata Sandi" }).click();
    await waitFor(() => expect(showWarningDialog).toHaveBeenCalledWith("Konfirmasi kata sandi tidak sama"));
    expect(putPassword).not.toHaveBeenCalled();
  });

  it("mengubah kata sandi lalu mengosongkan kolom", async () => {
    putPassword.mockResolvedValue({});
    await renderLoaded();
    await isiPassword("lama123", "baru123", "baru123");
    screen.getByRole("button", { name: "Ubah Kata Sandi" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Kata sandi berhasil diubah"));
    expect(putPassword).toHaveBeenCalledWith({ password: "lama123", newPassword: "baru123" });
    expect(screen.getByLabelText("Kata Sandi Saat Ini")).toHaveValue("");
    expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("");
  });

  it("menampilkan error bila ubah kata sandi gagal", async () => {
    putPassword.mockRejectedValue(new Error("Sandi lama salah"));
    await renderLoaded();
    await isiPassword("salah", "baru123", "baru123");
    screen.getByRole("button", { name: "Ubah Kata Sandi" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Sandi lama salah"));
  });
});
