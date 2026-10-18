import { render } from "@testing-library/svelte";
import { currentPath } from "./router.js";
import { authStore } from "./features/auth/states/authStore.js";

/**
 * Merender komponen Svelte untuk pengujian.
 * Store Svelte bersifat modul global, jadi "provider" di sini berarti
 * kita menyiapkan keadaan awal sebelum render: path URL, router, dan token.
 */
export function renderWithProviders(
  Component,
  { props = {}, path = "/", token = null } = {}
) {
  window.history.pushState({}, "", path);
  currentPath.set(path);

  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
  authStore.set({ token, loading: false });

  return render(Component, { props });
}
