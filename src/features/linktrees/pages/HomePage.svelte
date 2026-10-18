<script>
  import { onMount } from "svelte";
  import { Plus, Search, Trash2 } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import {
    linkTreesStore,
    fetchLinkTrees,
    addLinkTree,
    removeLinkTree,
    removeAllLinkTrees,
  } from "../states/linkTreesStore.js";
  import { usersStore } from "../../users/states/usersStore.js";
  import { navigate } from "../../../router.js";
  import {
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper.js";
  import { TYPE_LABELS, TYPE_STYLES, isOwner } from "../constants.js";
  import AddModal from "../modals/AddModal.svelte";

  const { value: keyword, onChange: onKeywordChange } = useInput("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const profile = $derived($usersStore.profile);
  const all = $derived($linkTreesStore.linkTrees);

  const visible = $derived(
    all.filter((linkTree) => {
      const text = `${linkTree.title} ${linkTree.description ?? ""}`;
      const matchesKeyword = text
        .toLowerCase()
        .includes($keyword.trim().toLowerCase());
      return matchesKeyword && (!onlyMine || isOwner(linkTree, profile));
    })
  );

  const stats = $derived([
    { label: "Total", value: all.length },
    { label: "Publik", value: all.filter((l) => l.type === "public").length },
    { label: "Tidak terdaftar", value: all.filter((l) => l.type === "unlisted").length },
    { label: "Privat", value: all.filter((l) => l.type === "private").length },
  ]);

  onMount(async () => {
    try {
      await fetchLinkTrees();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  });

  function openDetail(event, id) {
    event.preventDefault();
    navigate(`/link-trees/${id}`);
  }

  async function handleAdd(data) {
    try {
      await addLinkTree(data);
      showAdd = false;
      await showSuccessDialog("Link tree berhasil ditambahkan");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function handleDelete(linkTree) {
    if (!(await showConfirmDialog(`Hapus link tree "${linkTree.title}"?`))) return;

    try {
      await removeLinkTree(linkTree.id);
      await showSuccessDialog("Link tree berhasil dihapus");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function handleDeleteAll() {
    if (!(await showConfirmDialog("Hapus semua link tree?"))) return;

    try {
      await removeAllLinkTrees();
      await showSuccessDialog("Semua link tree berhasil dihapus");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Semua Link Tree</h1>
      <p class="mt-1 text-sm text-slate-500">
        Jelajahi dan kelola kumpulan tautan.
      </p>
    </div>

    <div class="flex gap-3">
      {#if all.length > 0}
        <button
          type="button"
          onclick={handleDeleteAll}
          disabled={$linkTreesStore.deletingAll}
          class="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Hapus Semua
        </button>
      {/if}
      <button
        type="button"
        onclick={() => (showAdd = true)}
        class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        <Plus class="h-4 w-4" />
        Tambah Link Tree
      </button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {#each stats as stat (stat.label)}
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-testid="stat-card">
        <p class="text-xs font-medium text-slate-500">{stat.label}</p>
        <p class="mt-1 text-2xl font-extrabold text-slate-900">{stat.value}</p>
      </div>
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-3">
    <div class="relative min-w-60 flex-1 sm:max-w-md">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        aria-label="Cari link tree"
        placeholder="Cari judul atau deskripsi..."
        value={$keyword}
        oninput={onKeywordChange}
        class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <label class="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
      <input type="checkbox" bind:checked={onlyMine} class="h-4 w-4 rounded border-slate-300" />
      Milik saya
    </label>
  </div>

  {#if $linkTreesStore.loading}
    <p class="text-sm text-slate-500">Memuat link tree...</p>
  {:else if visible.length === 0}
    <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
      Belum ada link tree yang cocok.
    </div>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each visible as linkTree (linkTree.id)}
        <li class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <a
            href={`/link-trees/${linkTree.id}`}
            onclick={(event) => openDetail(event, linkTree.id)}
            class="block"
          >
            {#if linkTree.cover}
              <img
                src={linkTree.cover}
                alt={`Sampul ${linkTree.title}`}
                class="h-32 w-full object-cover"
              />
            {:else}
              <div
                data-testid="cover-placeholder"
                class="h-32 w-full bg-gradient-to-br from-indigo-400 to-sky-400"
              ></div>
            {/if}
            <div class="p-4">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold {TYPE_STYLES[linkTree.type]}">
                {TYPE_LABELS[linkTree.type]}
              </span>
              <h2 class="mt-2 truncate font-bold text-slate-900">{linkTree.title}</h2>
              {#if linkTree.description}
                <p class="mt-1 line-clamp-2 text-sm text-slate-500">{linkTree.description}</p>
              {/if}
            </div>
          </a>

          {#if isOwner(linkTree, profile)}
            <button
              type="button"
              aria-label={`Hapus ${linkTree.title}`}
              onclick={() => handleDelete(linkTree)}
              disabled={$linkTreesStore.deleting}
              class="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-red-600 shadow hover:bg-white disabled:opacity-60"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

{#if showAdd}
  <AddModal
    saving={$linkTreesStore.adding}
    onClose={() => (showAdd = false)}
    onSubmit={handleAdd}
  />
{/if}
