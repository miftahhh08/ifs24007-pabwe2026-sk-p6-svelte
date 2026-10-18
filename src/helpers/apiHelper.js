const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Pembungkus fetch ke REST API Delcom.
 * - Menambahkan header Authorization: Bearer <token> bila token ada.
 * - Body FormData dikirim apa adanya (browser mengatur Content-Type sendiri).
 * - Body object lain dikirim sebagai JSON.
 * - Melempar Error(message) bila HTTP gagal atau success === false.
 */
export async function apiFetch(path, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const finalHeaders = { ...headers };

  const token = getAccessToken();
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${DELCOM_BASEURL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(json.message || "Terjadi kesalahan pada server");
  }

  return json;
}
