import { writable } from "svelte/store";
import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
import HomePage from "./features/linktrees/pages/HomePage.svelte";
import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

export const currentPath = writable(window.location.pathname);

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  currentPath.set(path);
}

// Tombol back/forward browser
window.addEventListener("popstate", () => {
  currentPath.set(window.location.pathname);
});

// redirect (opsional): bila ada, rute ini langsung mengalihkan ke path tersebut
// access:
//   "guest" -> hanya untuk yang BELUM login (halaman login/register)
//   "auth"  -> hanya untuk yang SUDAH login
//   "any"   -> siapa saja
//
// Daftar rute dibuat di dalam fungsi (bukan di level modul) supaya tidak
// bentrok dengan impor melingkar: halaman mengimpor navigate dari file ini,
// sedangkan file ini mengimpor halaman.
function getRoutes() {
  return [
    // /auth saja bukan halaman: arahkan ke halaman login
    { pattern: "/auth", layout: null, page: null, access: "any", redirect: "/auth/login" },
    { pattern: "/auth/login", layout: AuthLayout, page: LoginPage, access: "guest" },
    { pattern: "/auth/register", layout: AuthLayout, page: RegisterPage, access: "guest" },
    { pattern: "/", layout: LinkTreeLayout, page: HomePage, access: "auth" },
    { pattern: "/link-trees/:linkTreeId", layout: LinkTreeLayout, page: DetailPage, access: "auth" },
    { pattern: "/users", layout: LinkTreeLayout, page: UsersPage, access: "auth" },
    { pattern: "/profile", layout: LinkTreeLayout, page: ProfilePage, access: "auth" },
  ];
}

// Mencocokkan "/link-trees/:id" dengan "/link-trees/12" -> { id: "12" }
function matchPath(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

// Selalu mengembalikan rute. Path yang tidak cocok -> NotFoundPage (tanpa layout).
export function resolveRoute(path) {
  for (const route of getRoutes()) {
    const params = matchPath(route.pattern, path);
    if (params) return { ...route, params };
  }
  return { layout: null, page: NotFoundPage, access: "any", params: {} };
}
