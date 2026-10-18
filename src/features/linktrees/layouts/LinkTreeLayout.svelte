<script>
  import { onMount } from "svelte";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import { fetchProfile } from "../../users/states/usersStore.js";
  import { logout } from "../../auth/states/authStore.js";
  import { navigate } from "../../../router.js";

  let { children } = $props();

  let sidebarOpen = $state(false);

  // Memuat profil untuk navbar. Bila gagal (mis. token kedaluwarsa),
  // sesi dianggap tidak valid: keluar dan kembali ke halaman login.
  onMount(async () => {
    try {
      await fetchProfile();
    } catch {
      logout();
      navigate("/auth/login", { replace: true });
    }
  });
</script>

<div class="min-h-screen bg-slate-50">
  <Navbar onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />

  <div class="flex">
    <Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />
    <main class="min-w-0 flex-1 p-4 sm:p-8">
      {@render children()}
    </main>
  </div>
</div>
