import { apiFetch } from "../../../helpers/apiHelper.js";

export function postLogin({ email, password }) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function postRegister({ name, email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}
