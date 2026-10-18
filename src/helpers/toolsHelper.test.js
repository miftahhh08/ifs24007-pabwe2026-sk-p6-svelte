import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("showSuccessDialog memakai ikon success", async () => {
    Swal.fire.mockResolvedValue({});
    await showSuccessDialog("Tersimpan");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", text: "Tersimpan" })
    );
  });

  it("showErrorDialog memakai ikon error", async () => {
    Swal.fire.mockResolvedValue({});
    await showErrorDialog("Gagal");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "Gagal" })
    );
  });

  it("showWarningDialog memakai ikon warning", async () => {
    Swal.fire.mockResolvedValue({});
    await showWarningDialog("Hati-hati");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "warning", text: "Hati-hati" })
    );
  });

  it("showConfirmDialog mengembalikan true bila dikonfirmasi", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    expect(await showConfirmDialog("Hapus?")).toBe(true);
  });

  it("showConfirmDialog mengembalikan false bila dibatalkan", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    expect(await showConfirmDialog("Hapus?")).toBe(false);
  });

  it("formatDate memformat tanggal Indonesia", () => {
    expect(formatDate("2026-10-16T00:00:00Z")).toContain("2026");
    expect(formatDate("2026-10-16T00:00:00Z")).toMatch(/Oktober/);
  });

  it("formatDate mengembalikan '-' untuk nilai kosong atau tidak valid", () => {
    expect(formatDate("")).toBe("-");
    expect(formatDate(null)).toBe("-");
    expect(formatDate("bukan-tanggal")).toBe("-");
  });
});
