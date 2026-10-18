import { writable } from "svelte/store";
import {
  getUsers,
  getMe,
  putMe,
  postPhoto,
  putPassword,
} from "../api/usersApi.js";

export const usersStore = writable({
  users: [],
  profile: null,
  loading: false,
  saving: false,
});

export async function fetchUsers() {
  usersStore.update((s) => ({ ...s, loading: true }));
  try {
    const res = await getUsers();
    usersStore.update((s) => ({ ...s, users: res.data.users }));
  } finally {
    usersStore.update((s) => ({ ...s, loading: false }));
  }
}

async function refreshProfile() {
  const res = await getMe();
  usersStore.update((s) => ({ ...s, profile: res.data.user }));
}

export async function fetchProfile() {
  usersStore.update((s) => ({ ...s, loading: true }));
  try {
    await refreshProfile();
  } finally {
    usersStore.update((s) => ({ ...s, loading: false }));
  }
}

// Pola yang sama untuk semua aksi "simpan": saving true -> aksi -> saving false
async function withSaving(action) {
  usersStore.update((s) => ({ ...s, saving: true }));
  try {
    return await action();
  } finally {
    usersStore.update((s) => ({ ...s, saving: false }));
  }
}

export function updateProfile({ name, email }) {
  return withSaving(async () => {
    await putMe({ name, email });
    await refreshProfile();
  });
}

export function updatePhoto(file) {
  return withSaving(async () => {
    await postPhoto(file);
    await refreshProfile();
  });
}

export function updatePassword({ password, newPassword }) {
  return withSaving(() => putPassword({ password, newPassword }));
}
