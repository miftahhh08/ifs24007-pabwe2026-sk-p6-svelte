import { writable } from "svelte/store";
import {
  getLinkTrees,
  getLinkTree,
  postLinkTree,
  putLinkTree,
  postCover,
  deleteLinkTree,
  deleteAllLinkTrees,
  postItem,
  putItem,
  deleteItem,
} from "../api/linkTreeApi.js";

export const linkTreesStore = writable({
  // data
  linkTrees: [],
  detail: null,
  // bendera pemuatan
  loading: false,
  detailLoading: false,
  // bendera mutasi
  adding: false,
  changing: false,
  changingCover: false,
  deleting: false,
  deletingAll: false,
  itemSaving: false,
});

// Menyalakan satu bendera, menjalankan aksi, lalu mematikan bendera
// (selalu, walau aksi gagal) berkat finally.
async function withFlag(flag, action) {
  linkTreesStore.update((s) => ({ ...s, [flag]: true }));
  try {
    return await action();
  } finally {
    linkTreesStore.update((s) => ({ ...s, [flag]: false }));
  }
}

async function refreshList() {
  const res = await getLinkTrees();
  linkTreesStore.update((s) => ({ ...s, linkTrees: res.data.link_trees }));
}

async function refreshDetail(id) {
  const res = await getLinkTree(id);
  linkTreesStore.update((s) => ({ ...s, detail: res.data.link_tree }));
}

export function clearDetail() {
  linkTreesStore.update((s) => ({ ...s, detail: null }));
}

// --- Pemuatan ----------------------------------------------------------

export function fetchLinkTrees() {
  return withFlag("loading", refreshList);
}

export function fetchLinkTree(id) {
  return withFlag("detailLoading", () => refreshDetail(id));
}

// --- Mutasi link tree --------------------------------------------------

export function addLinkTree(data) {
  return withFlag("adding", async () => {
    const res = await postLinkTree(data);
    await refreshList();
    return res;
  });
}

export function changeLinkTree(id, data) {
  return withFlag("changing", async () => {
    await putLinkTree(id, data);
    await refreshDetail(id);
  });
}

export function changeCover(id, file) {
  return withFlag("changingCover", async () => {
    await postCover(id, file);
    await refreshDetail(id);
  });
}

export function removeLinkTree(id) {
  return withFlag("deleting", async () => {
    await deleteLinkTree(id);
    linkTreesStore.update((s) => ({
      ...s,
      linkTrees: s.linkTrees.filter((item) => item.id !== id),
    }));
  });
}

export function removeAllLinkTrees() {
  return withFlag("deletingAll", async () => {
    await deleteAllLinkTrees();
    linkTreesStore.update((s) => ({ ...s, linkTrees: [] }));
  });
}

// --- Mutasi item tautan ------------------------------------------------

export function addItem(linkTreeId, data) {
  return withFlag("itemSaving", async () => {
    await postItem(linkTreeId, data);
    await refreshDetail(linkTreeId);
  });
}

export function changeItem(linkTreeId, itemId, data) {
  return withFlag("itemSaving", async () => {
    await putItem(linkTreeId, itemId, data);
    await refreshDetail(linkTreeId);
  });
}

export function removeItem(linkTreeId, itemId) {
  return withFlag("itemSaving", async () => {
    await deleteItem(linkTreeId, itemId);
    await refreshDetail(linkTreeId);
  });
}
