import { writable, derived } from "svelte/store";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper.js";
import { postLogin, postRegister } from "../api/authApi.js";

export const authStore = writable({
  token: getAccessToken(),
  loading: false,
});

export const isAuthenticated = derived(authStore, ($auth) => !!$auth.token);

export async function login({ email, password }) {
  authStore.update((s) => ({ ...s, loading: true }));
  try {
    const res = await postLogin({ email, password });
    const token = res.data.token;
    putAccessToken(token);
    authStore.update((s) => ({ ...s, token }));
    return res;
  } finally {
    authStore.update((s) => ({ ...s, loading: false }));
  }
}

export async function register({ name, email, password }) {
  authStore.update((s) => ({ ...s, loading: true }));
  try {
    return await postRegister({ name, email, password });
  } finally {
    authStore.update((s) => ({ ...s, loading: false }));
  }
}

export function logout() {
  removeAccessToken();
  authStore.set({ token: null, loading: false });
}
