<script>
  import { Link2, Users, UserRound } from "lucide-svelte";
  import { currentPath, navigate } from "../../../router.js";

  let { open = false, onClose } = $props();

  const items = [
    {
      label: "Semua Link Tree",
      path: "/",
      icon: Link2,
      isActive: (path) => path === "/" || path.startsWith("/link-trees"),
    },
    {
      label: "Pengguna",
      path: "/users",
      icon: Users,
      isActive: (path) => path === "/users",
    },
    {
      label: "Profil",
      path: "/profile",
      icon: UserRound,
      isActive: (path) => path === "/profile",
    },
  ];

  function go(event, path) {
    event.preventDefault();
    navigate(path);
    onClose();
  }
</script>

{#if open}
  <div
    data-testid="sidebar-backdrop"
    role="presentation"
    onclick={onClose}
    class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
  ></div>
{/if}

<aside
  class="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white pt-20 transition-transform lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-6 {open
    ? 'translate-x-0'
    : '-translate-x-full'}"
>
  <nav class="space-y-1 px-4" aria-label="Menu utama">
    {#each items as item (item.path)}
      {@const Icon = item.icon}
      {@const active = item.isActive($currentPath)}
      <a
        href={item.path}
        aria-current={active ? "page" : undefined}
        onclick={(event) => go(event, item.path)}
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium {active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-100'}"
      >
        <Icon class="h-4 w-4" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>
