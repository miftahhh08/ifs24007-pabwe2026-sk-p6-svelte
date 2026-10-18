import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { currentPath, navigate, resolveRoute } from "./router";
import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
import HomePage from "./features/linktrees/pages/HomePage.svelte";
import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

describe("navigasi", () => {
  it("navigate memakai pushState dan memperbarui currentPath", () => {
    navigate("/auth/login");
    expect(window.location.pathname).toBe("/auth/login");
    expect(get(currentPath)).toBe("/auth/login");
  });

  it("navigate dengan replace memakai replaceState", () => {
    navigate("/auth/register", { replace: true });
    expect(window.location.pathname).toBe("/auth/register");
    expect(get(currentPath)).toBe("/auth/register");
  });

  it("popstate memperbarui currentPath", () => {
    window.history.pushState({}, "", "/auth/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(get(currentPath)).toBe("/auth/login");
  });
});

describe("resolveRoute", () => {
  it("/auth/login dan /auth/register: layout autentikasi, khusus tamu", () => {
    expect(resolveRoute("/auth/login")).toEqual({
      pattern: "/auth/login", layout: AuthLayout, page: LoginPage, access: "guest", params: {},
    });
    const register = resolveRoute("/auth/register");
    expect(register.page).toBe(RegisterPage);
    expect(register.layout).toBe(AuthLayout);
    expect(register.access).toBe("guest");
  });

  it("/ menampilkan daftar link tree, butuh login", () => {
    const route = resolveRoute("/");
    expect(route.page).toBe(HomePage);
    expect(route.layout).toBe(LinkTreeLayout);
    expect(route.access).toBe("auth");
  });

  it("/link-trees/:linkTreeId mengambil parameter", () => {
    const route = resolveRoute("/link-trees/12");
    expect(route.page).toBe(DetailPage);
    expect(route.layout).toBe(LinkTreeLayout);
    expect(route.params).toEqual({ linkTreeId: "12" });
  });

  it("parameter rute di-decode", () => {
    expect(resolveRoute("/link-trees/a%20b").params).toEqual({ linkTreeId: "a b" });
  });

  it("/users dan /profile memakai layout aplikasi", () => {
    expect(resolveRoute("/users").page).toBe(UsersPage);
    expect(resolveRoute("/users").layout).toBe(LinkTreeLayout);
    expect(resolveRoute("/profile").page).toBe(ProfilePage);
    expect(resolveRoute("/profile").access).toBe("auth");
  });

  it("/auth mengalihkan ke /auth/login", () => {
    const route = resolveRoute("/auth");
    expect(route.redirect).toBe("/auth/login");
    expect(route.page).toBeNull();
  });

  it("path lain menampilkan NotFoundPage tanpa layout", () => {
    for (const path of ["/tidak/ada", "/auth/lain", "/link-trees", "/link-trees/1/2"]) {
      const route = resolveRoute(path);
      expect(route.page).toBe(NotFoundPage);
      expect(route.layout).toBeNull();
      expect(route.access).toBe("any");
    }
  });
});
