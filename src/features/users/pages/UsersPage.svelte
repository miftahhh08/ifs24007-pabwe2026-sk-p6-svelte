<script>
  import { onMount } from "svelte";
  import { Search } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { usersStore, fetchUsers } from "../states/usersStore.js";
  import { showErrorDialog, formatDate } from "../../../helpers/toolsHelper.js";

  const { value: keyword, onChange: onKeywordChange } = useInput("");

  const filteredUsers = $derived(
    $usersStore.users.filter((user) =>
      `${user.name} ${user.email}`
        .toLowerCase()
        .includes($keyword.trim().toLowerCase())
    )
  );

  onMount(async () => {
    try {
      await fetchUsers();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  });
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900">Pengguna</h1>
    <p class="text-sm text-slate-500 mt-1">
      Daftar semua pengguna Delcom Link Tree.
    </p>
  </div>

  <div class="relative max-w-md">
    <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input
      type="search"
      aria-label="Cari pengguna"
      placeholder="Cari nama atau email..."
      value={$keyword}
      oninput={onKeywordChange}
      class="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {#if $usersStore.loading}
    <p class="text-sm text-slate-500">Memuat pengguna...</p>
  {:else if filteredUsers.length === 0}
    <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
      Tidak ada pengguna ditemukan.
    </div>
  {:else}
    <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredUsers as user (user.id)}
        <li class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {#if user.photo}
            <img src={user.photo} alt={user.name} class="w-12 h-12 rounded-full object-cover" />
          {:else}
            <div
              data-testid="avatar-initial"
              class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          {/if}
          <div class="min-w-0">
            <p class="font-semibold text-slate-900 truncate">{user.name}</p>
            <p class="text-sm text-slate-500 truncate">{user.email}</p>
            <p class="text-xs text-slate-500 mt-0.5">
              Bergabung {formatDate(user.created_at)}
            </p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
