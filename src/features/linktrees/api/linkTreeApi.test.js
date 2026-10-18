import { describe, it, expect, vi, beforeEach } from "vitest";
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
} from "./linkTreeApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

const data = { title: "Portofolio", type: "public", description: "Tautanku" };

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetch.mockResolvedValue({ success: true });
  });

  it("getLinkTrees: GET /link-trees", async () => {
    await getLinkTrees();
    expect(apiFetch).toHaveBeenCalledWith("/link-trees");
  });

  it("getLinkTree: GET /link-trees/:id", async () => {
    await getLinkTree(7);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/7");
  });

  it("postLinkTree: POST /link-trees", async () => {
    await postLinkTree(data);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees", {
      method: "POST",
      body: data,
    });
  });

  it("putLinkTree: PUT /link-trees/:id", async () => {
    await putLinkTree(7, data);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/7", {
      method: "PUT",
      body: data,
    });
  });

  it("postCover: POST FormData berisi cover", async () => {
    const file = new File(["x"], "cover.png", { type: "image/png" });
    await postCover(7, file);
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/link-trees/7/cover");
    expect(options.method).toBe("POST");
    expect(options.body.get("cover")).toBe(file);
  });

  it("deleteLinkTree: DELETE /link-trees/:id", async () => {
    await deleteLinkTree(7);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/7", { method: "DELETE" });
  });

  it("deleteAllLinkTrees: DELETE /link-trees", async () => {
    await deleteAllLinkTrees();
    expect(apiFetch).toHaveBeenCalledWith("/link-trees", { method: "DELETE" });
  });

  it("postItem: POST /link-trees/:id/items", async () => {
    await postItem(7, { title: "GitHub", url: "https://github.com" });
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/7/items", {
      method: "POST",
      body: { title: "GitHub", url: "https://github.com" },
    });
  });

  it("putItem: PUT /link-trees/:id/items/:itemId", async () => {
    await putItem(7, 3, { title: "GH", url: "https://gh.io" });
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/7/items/3", {
      method: "PUT",
      body: { title: "GH", url: "https://gh.io" },
    });
  });

  it("deleteItem: DELETE /link-trees/:id/items/:itemId", async () => {
    await deleteItem(7, 3);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/7/items/3", {
      method: "DELETE",
    });
  });
});
