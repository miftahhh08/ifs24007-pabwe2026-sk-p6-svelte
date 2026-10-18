import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import LoginPage from "./LoginPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { authStore } from "../states/authStore";
import { currentPath } from "../../../router";
import { postLogin } from "../api/authApi";
import {
  showErrorDialog,
  showWarningDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/authApi", () => ({ postLogin: vi.fn(), postRegister: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

async function isiForm(email, password) {
  await fireEvent.input(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), {
    target: { value: password },
  });
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.set({ token: null, loading: false });
  });

  it("menampilkan form login", () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("memperingatkan bila form kosong", async () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    screen.getByRole("button", { name: "Masuk" }).click();
    await waitFor(() =>
      expect(showWarningDialog).toHaveBeenCalledWith(
        "Email dan kata sandi wajib diisi"
      )
    );
    expect(postLogin).not.toHaveBeenCalled();
  });

  it("login berhasil lalu pindah ke beranda", async () => {
    postLogin.mockResolvedValue({ data: { token: "tok" } });
    renderWithProviders(LoginPage, { path: "/auth/login" });
    await isiForm("  a@b.c ", "123456");
    screen.getByRole("button", { name: "Masuk" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/"));
    expect(postLogin).toHaveBeenCalledWith({
      email: "a@b.c",
      password: "123456",
    });
  });

  it("menampilkan dialog error bila login gagal", async () => {
    postLogin.mockRejectedValue(new Error("Email atau sandi salah"));
    renderWithProviders(LoginPage, { path: "/auth/login" });
    await isiForm("a@b.c", "salah");
    screen.getByRole("button", { name: "Masuk" }).click();
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email atau sandi salah")
    );
  });

  it("menampilkan 'Memproses...' saat loading", () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    authStore.set({ token: null, loading: true });
    return waitFor(() =>
      expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled()
    );
  });

  it("tautan Daftar pindah ke halaman register", async () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    screen.getByRole("link", { name: "Daftar" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/register"));
  });
});
