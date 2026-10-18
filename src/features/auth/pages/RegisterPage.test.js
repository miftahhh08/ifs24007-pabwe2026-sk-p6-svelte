import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import RegisterPage from "./RegisterPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { authStore } from "../states/authStore";
import { currentPath } from "../../../router";
import { postRegister } from "../api/authApi";
import {
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/authApi", () => ({ postLogin: vi.fn(), postRegister: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

async function isiForm(name, email, password) {
  await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: name } });
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: email } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), {
    target: { value: password },
  });
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.set({ token: null, loading: false });
  });

  it("menampilkan form register", () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });

  it("memperingatkan bila form kosong", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    screen.getByRole("button", { name: "Daftar" }).click();
    await waitFor(() =>
      expect(showWarningDialog).toHaveBeenCalledWith(
        "Nama, email, dan kata sandi wajib diisi"
      )
    );
    expect(postRegister).not.toHaveBeenCalled();
  });

  it("register berhasil lalu pindah ke login", async () => {
    postRegister.mockResolvedValue({ success: true });
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await isiForm(" Ani ", "a@b.c", "123456");
    screen.getByRole("button", { name: "Daftar" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(postRegister).toHaveBeenCalledWith({
      name: "Ani",
      email: "a@b.c",
      password: "123456",
    });
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("menampilkan dialog error bila register gagal", async () => {
    postRegister.mockRejectedValue(new Error("Email sudah terdaftar"));
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await isiForm("Ani", "a@b.c", "123456");
    screen.getByRole("button", { name: "Daftar" }).click();
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar")
    );
  });

  it("menampilkan 'Memproses...' saat loading", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    authStore.set({ token: null, loading: true });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled()
    );
  });

  it("tautan Masuk pindah ke halaman login", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    screen.getByRole("link", { name: "Masuk" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
  });
});
