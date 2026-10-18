<script>
  import { currentPath, resolveRoute, navigate } from "./router.js";
  import { isAuthenticated } from "./features/auth/states/authStore.js";

  const route = $derived(resolveRoute($currentPath));

  // Penjaga rute: ke mana pengguna harus dialihkan (null = boleh masuk)
  const redirectTo = $derived.by(() => {
    if (route.redirect) return route.redirect;
    if (route.access === "auth" && !$isAuthenticated) return "/auth/login";
    if (route.access === "guest" && $isAuthenticated) return "/";
    return null;
  });

  $effect(() => {
    if (redirectTo) navigate(redirectTo, { replace: true });
  });
</script>

<!-- Selama pengalihan, jangan render apa pun supaya halaman terlarang tidak sempat muncul -->
{#if !redirectTo}
  {@const Page = route.page}
  {#if route.layout}
    {@const Layout = route.layout}
    <Layout>
      <Page params={route.params} />
    </Layout>
  {:else}
    <!-- Halaman tanpa layout (404) tidak memerlukan parameter rute -->
    <Page />
  {/if}
{/if}
