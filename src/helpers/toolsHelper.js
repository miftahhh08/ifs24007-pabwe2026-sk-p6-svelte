import Swal from "sweetalert2";

export function showSuccessDialog(message) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonText: "OK",
  });
}

export function showErrorDialog(message) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonText: "OK",
  });
}

export function showWarningDialog(message) {
  return Swal.fire({
    icon: "warning",
    title: "Perhatian",
    text: message,
    confirmButtonText: "OK",
  });
}

export async function showConfirmDialog(message) {
  const result = await Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
