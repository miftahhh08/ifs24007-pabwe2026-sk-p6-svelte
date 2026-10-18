import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  linkTreesStore,
  fetchLinkTrees,
  fetchLinkTree,
  addLinkTree,
  changeLinkTree,
  changeCover,
  removeLinkTree,
  removeAllLinkTrees,
  addItem,
  changeItem,
  removeItem,
  clearDetail,
} from "./linkTreesStore";
import * as api from "../api/linkTreeApi";

vi.mock("../api/linkTreeApi", () => ({
  getLinkTrees: vi.fn(),
  getLinkTree: vi.fn(),
  postLinkTree: vi.fn(),
  putLinkTree: vi.fn(),
  postCover: vi.fn(),
  deleteLinkTree: vi.fn(),
  deleteAllLinkTrees: vi.fn(),
  postItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
}));

const initial = {
  linkTrees: [],
  detail: null,
  loading: false,
  detailLoading: false,
  adding: false,
  changing: false,
  changingCover: false,
  deleting: false,
  deletingAll: false,
  itemSaving: false,
};

describe("linkTreesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTreesStore.set({ ...initial });
    api.getLinkTrees.mockResolvedValue({ data: { link_trees: [{ id: 1 }, { id: 2 }] } });
    api.getLinkTree.mockResolvedValue({ data: { link_tree: { id: 1, items: [] } } });
  });

  it("fetchLinkTrees mengisi koleksi dan mematikan loading", async () => {
    await fetchLinkTrees();
    expect(get(linkTreesStore).linkTrees).toEqual([{ id: 1 }, { id: 2 }]);
    expect(get(linkTreesStore).loading).toBe(false);
  });

  it("fetchLinkTrees yang gagal melempar error dan loading kembali false", async () => {
    api.getLinkTrees.mockRejectedValue(new Error("gagal"));
    await expect(fetchLinkTrees()).rejects.toThrow("gagal");
    expect(get(linkTreesStore).loading).toBe(false);
  });

  it("fetchLinkTree mengisi detail", async () => {
    await fetchLinkTree(1);
    expect(api.getLinkTree).toHaveBeenCalledWith(1);
    expect(get(linkTreesStore).detail).toEqual({ id: 1, items: [] });
    expect(get(linkTreesStore).detailLoading).toBe(false);
  });

  it("clearDetail mengosongkan detail", async () => {
    await fetchLinkTree(1);
    clearDetail();
    expect(get(linkTreesStore).detail).toBeNull();
  });

  it("bendera menyala selama aksi berjalan", async () => {
    let seen;
    api.getLinkTrees.mockImplementation(async () => {
      seen = get(linkTreesStore).loading;
      return { data: { link_trees: [] } };
    });
    await fetchLinkTrees();
    expect(seen).toBe(true);
  });

  it("addLinkTree membuat lalu memuat ulang koleksi dan mengembalikan respons", async () => {
    api.postLinkTree.mockResolvedValue({ data: { link_tree_id: 9 } });
    const res = await addLinkTree({ title: "A", type: "public", description: "" });
    expect(api.postLinkTree).toHaveBeenCalledWith({ title: "A", type: "public", description: "" });
    expect(res.data.link_tree_id).toBe(9);
    expect(get(linkTreesStore).linkTrees).toHaveLength(2);
    expect(get(linkTreesStore).adding).toBe(false);
  });

  it("changeLinkTree menyimpan lalu memuat ulang detail", async () => {
    api.putLinkTree.mockResolvedValue({});
    await changeLinkTree(1, { title: "B", type: "private", description: "x" });
    expect(api.putLinkTree).toHaveBeenCalledWith(1, { title: "B", type: "private", description: "x" });
    expect(get(linkTreesStore).detail.id).toBe(1);
    expect(get(linkTreesStore).changing).toBe(false);
  });

  it("changeCover mengunggah lalu memuat ulang detail", async () => {
    const file = new File(["x"], "c.png");
    api.postCover.mockResolvedValue({});
    await changeCover(1, file);
    expect(api.postCover).toHaveBeenCalledWith(1, file);
    expect(get(linkTreesStore).changingCover).toBe(false);
  });

  it("removeLinkTree menghapus item dari koleksi tanpa memuat ulang", async () => {
    linkTreesStore.set({ ...initial, linkTrees: [{ id: 1 }, { id: 2 }] });
    api.deleteLinkTree.mockResolvedValue({});
    await removeLinkTree(1);
    expect(get(linkTreesStore).linkTrees).toEqual([{ id: 2 }]);
    expect(api.getLinkTrees).not.toHaveBeenCalled();
    expect(get(linkTreesStore).deleting).toBe(false);
  });

  it("removeAllLinkTrees mengosongkan koleksi", async () => {
    linkTreesStore.set({ ...initial, linkTrees: [{ id: 1 }] });
    api.deleteAllLinkTrees.mockResolvedValue({});
    await removeAllLinkTrees();
    expect(get(linkTreesStore).linkTrees).toEqual([]);
    expect(get(linkTreesStore).deletingAll).toBe(false);
  });

  it("addItem, changeItem, removeItem memanggil API lalu memuat ulang detail", async () => {
    api.postItem.mockResolvedValue({});
    api.putItem.mockResolvedValue({});
    api.deleteItem.mockResolvedValue({});

    await addItem(1, { title: "T", url: "u" });
    expect(api.postItem).toHaveBeenCalledWith(1, { title: "T", url: "u" });

    await changeItem(1, 5, { title: "T2", url: "u2" });
    expect(api.putItem).toHaveBeenCalledWith(1, 5, { title: "T2", url: "u2" });

    await removeItem(1, 5);
    expect(api.deleteItem).toHaveBeenCalledWith(1, 5);

    expect(api.getLinkTree).toHaveBeenCalledTimes(3);
    expect(get(linkTreesStore).itemSaving).toBe(false);
  });

  it("aksi mutasi yang gagal melempar error dan bendera kembali false", async () => {
    api.postItem.mockRejectedValue(new Error("URL tidak valid"));
    await expect(addItem(1, { title: "T", url: "x" })).rejects.toThrow("URL tidak valid");
    expect(get(linkTreesStore).itemSaving).toBe(false);
  });
});
