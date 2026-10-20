import Swal from 'sweetalert2';
import { getBaseUrl, getErrorMessage, isSuccess, type ApiResponse } from './apiHelper';

export async function showSuccessDialog(text: string): Promise<void> {
  await Swal.fire({ icon: 'success', title: 'Berhasil', text });
}

export async function showErrorDialog(text: string): Promise<void> {
  await Swal.fire({ icon: 'error', title: 'Gagal', text });
}

export async function showConfirmDialog(
  title: string,
  text: string,
  confirmText = 'Ya'
): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal'
  });
  return Boolean(result.isConfirmed);
}

export async function notifyResult(
  response: ApiResponse,
  onSuccess?: () => void | Promise<void>
): Promise<boolean> {
  if (isSuccess(response)) {
    await showSuccessDialog(response.message);
    if (onSuccess) await onSuccess();
    return true;
  }
  await showErrorDialog(getErrorMessage(response));
  return false;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatRating(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  return Number.isNaN(num) ? '-' : num.toFixed(1);
}

export function resolveAssetUrl(
  path?: string | null,
  fallback = 'default/img/user.png'
): string {
  if (path && /^https?:\/\//i.test(path)) return path;
  const origin = String(getBaseUrl() ?? '').replace(/\/api\/v\d+\/?$/, '').replace(/\/+$/, '');
  const target = (path || fallback).replace(/^\/+/, '');
  return `${origin}/${target}`;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = parsed.pathname.split('/')[1] || null;
  } else if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v');
    } else {
      const match = parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/);
      id = match ? match[1] : null;
    }
  }

  return id && /^[\w-]+$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
}
