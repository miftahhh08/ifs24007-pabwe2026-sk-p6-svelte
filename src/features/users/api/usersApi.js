import { apiFetch } from "../../../helpers/apiHelper.js";

export function getUsers() {
  return apiFetch("/users");
}

export function getMe() {
  return apiFetch("/users/me");
}

export function putMe({ name, email }) {
  return apiFetch("/users/me", {
    method: "PUT",
    body: { name, email },
  });
}

export function postPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return apiFetch("/users/photo", { method: "POST", body: formData });
}

export function putPassword({ password, newPassword }) {
  return apiFetch("/users/change-password", {
    method: "PUT",
    body: { password, new_password: newPassword },
  });
}
