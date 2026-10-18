import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import UsersPage from "./UsersPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../states/usersStore";
import { getUsers } from "../api/usersApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/usersApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  formatDate: vi.fn(() => "16 Oktober 2026"),
}));

const users = [
  { id: 1, name: "Ani", email: "ani@mail.com", photo: "https://x/ani.png", created_at: "2026-10-16" },
  { id: 2, name: "Budi", email: "budi@mail.com", photo: null, created_at: "2026-10-16" },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.set({ users: [], profile: null, loading: false, saving: false });
  });

  it("menampilkan daftar pengguna dengan foto dan inisial", async () => {
    getUsers.mockResolvedValue({ data: { users } });
    renderWithProviders(UsersPage, { path: "/users" });
    expect(await screen.findByText("Ani")).toBeInTheDocument();
    expect(screen.getByText("budi@mail.com")).toBeInTheDocument();
    expect(screen.getByAltText("Ani")).toHaveAttribute("src", "https://x/ani.png");
    expect(screen.getByTestId("avatar-initial")).toHaveTextContent("B");
  });

  it("menampilkan 'Memuat pengguna...' saat loading", async () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    renderWithProviders(UsersPage, { path: "/users" });
    expect(await screen.findByText("Memuat pengguna...")).toBeInTheDocument();
  });

  it("memfilter berdasarkan kata kunci", async () => {
    getUsers.mockResolvedValue({ data: { users } });
    renderWithProviders(UsersPage, { path: "/users" });
    await screen.findByText("Ani");
    await fireEvent.input(screen.getByLabelText("Cari pengguna"), {
      target: { value: "budi" },
    });
    expect(screen.queryByText("Ani")).not.toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila tidak ada hasil", async () => {
    getUsers.mockResolvedValue({ data: { users } });
    renderWithProviders(UsersPage, { path: "/users" });
    await screen.findByText("Ani");
    await fireEvent.input(screen.getByLabelText("Cari pengguna"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("Tidak ada pengguna ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan dialog error bila gagal memuat", async () => {
    getUsers.mockRejectedValue(new Error("Server mati"));
    renderWithProviders(UsersPage, { path: "/users" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Server mati"));
  });
});
