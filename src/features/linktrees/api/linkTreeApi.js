import { apiFetch } from "../../../helpers/apiHelper.js";

// --- Link tree ---------------------------------------------------------

export function getLinkTrees() {
  return apiFetch("/link-trees");
}

export function getLinkTree(id) {
  return apiFetch(`/link-trees/${id}`);
}

// type: "public" | "unlisted" | "private"
export function postLinkTree({ title, type, description }) {
  return apiFetch("/link-trees", {
    method: "POST",
    body: { title, type, description },
  });
}

export function putLinkTree(id, { title, type, description }) {
  return apiFetch(`/link-trees/${id}`, {
    method: "PUT",
    body: { title, type, description },
  });
}

export function postCover(id, file) {
  const formData = new FormData();
  formData.append("cover", file);
  return apiFetch(`/link-trees/${id}/cover`, {
    method: "POST",
    body: formData,
  });
}

export function deleteLinkTree(id) {
  return apiFetch(`/link-trees/${id}`, { method: "DELETE" });
}

export function deleteAllLinkTrees() {
  return apiFetch("/link-trees", { method: "DELETE" });
}

// --- Item tautan -------------------------------------------------------

export function postItem(linkTreeId, { title, url }) {
  return apiFetch(`/link-trees/${linkTreeId}/items`, {
    method: "POST",
    body: { title, url },
  });
}

export function putItem(linkTreeId, itemId, { title, url }) {
  return apiFetch(`/link-trees/${linkTreeId}/items/${itemId}`, {
    method: "PUT",
    body: { title, url },
  });
}

export function deleteItem(linkTreeId, itemId) {
  return apiFetch(`/link-trees/${linkTreeId}/items/${itemId}`, {
    method: "DELETE",
  });
}
