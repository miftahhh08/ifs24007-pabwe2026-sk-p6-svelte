<script>
  import { Link2, Menu, LogOut } from "lucide-svelte";
  import { logout } from "../../auth/states/authStore.js";
  import { usersStore } from "../../users/states/usersStore.js";
  import { navigate } from "../../../router.js";
  import { showConfirmDialog } from "../../../helpers/toolsHelper.js";

  let { onToggleSidebar } = $props();

  async function handleLogout() {
    if (await showConfirmDialog("Yakin ingin keluar?")) {
      logout();
      navigate("/auth/login");
    }
  }
</script>

<header class="sticky top-0 z-40 border-b border-slate-200 bg-white">
  <div class="flex h-16 items-center justify-between px-4 sm:px-8">
    <div class="flex items-center gap-3">
      <button
        type="button"
        aria-label="Buka menu"
        onclick={onToggleSidebar}
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu class="h-5 w-5" />
      </button>

      <div class="flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
          <Link2 class="h-5 w-5 text-white" />
        </div>
        <span class="text-lg font-extrabold text-slate-900">Delcom Link Tree</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      {#if $usersStore.profile}
        <span class="hidden text-sm font-medium text-slate-600 sm:inline">
          {$usersStore.profile.name}
        </span>
      {/if}
      <button
        type="button"
        onclick={handleLogout}
        class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <LogOut class="h-4 w-4" />
        Keluar
      </button>
    </div>
  </div>
</header>
