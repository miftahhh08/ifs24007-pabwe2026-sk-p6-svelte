<script>
  import { onMount } from "svelte";
  import { ArrowLeft, Pencil, Trash2, Plus, ExternalLink } from "lucide-svelte";
  import {
    linkTreesStore,
    fetchLinkTree,
    clearDetail,
    changeLinkTree,
    changeCover,
    addItem,
    changeItem,
    removeItem,
  } from "../states/linkTreesStore.js";
  import { usersStore } from "../../users/states/usersStore.js";
  import { navigate } from "../../../router.js";
  import {
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper.js";
  import { TYPE_LABELS, TYPE_STYLES, isOwner } from "../constants.js";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";

  let { params } = $props();

  const id = $derived(params.linkTreeId);
  const detail = $derived($linkTreesStore.detail);
  const profile = $derived($usersStore.profile);

  let showChange = $state(false);
  let showCover = $state(false);
  let showItem = $state(false);
  let editingItem = $state(null);

  onMount(async () => {
    clearDetail(); // jangan tampilkan detail lama saat data baru dimuat
    try {
      await fetchLinkTree(id);
    } catch (error) {
      await showErrorDialog(error.message);
      navigate("/", { replace: true });
    }
  });

  function goBack(event) {
    event.preventDefault();
    navigate("/");
  }

  function openAddItem() {
    editingItem = null;
    showItem = true;
  }

  function openEditItem(item) {
    editingItem = item;
    showItem = true;
  }

  async function handleChange(data) {
    try {
      await changeLinkTree(id, data);
      showChange = false;
      await showSuccessDialog("Link tree berhasil diperbarui");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function handleCover(file) {
    try {
      await changeCover(id, file);
      showCover = false;
      await showSuccessDialog("Sampul berhasil diperbarui");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function handleItemSubmit(data) {
    try {
      if (editingItem) {
        await changeItem(id, editingItem.id, data);
      } else {
        await addItem(id, data);
      }
      showItem = false;
      await showSuccessDialog("Tautan berhasil disimpan");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function handleItemDelete(item) {
    if (!(await showConfirmDialog(`Hapus tautan "${item.title}"?`))) return;

    try {
      await removeItem(id, item.id);
      await showSuccessDialog("Tautan berhasil dihapus");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }
</script>

<div class="mx-auto max-w-3xl space-y-6">
  <a
    href="/"
    onclick={goBack}
    class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
  >
    <ArrowLeft class="h-4 w-4" />
    Semua Link Tree
  </a>

  {#if detail}
    {@const owner = isOwner(detail, profile)}

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {#if detail.cover}
        <img src={detail.cover} alt={`Sampul ${detail.title}`} class="h-48 w-full object-cover" />
      {:else}
        <div
          data-testid="cover-placeholder"
          class="h-48 w-full bg-gradient-to-br from-indigo-400 to-sky-400"
        ></div>
      {/if}

      <div class="space-y-3 p-6">
        <span class="rounded-full px-2.5 py-1 text-xs font-semibold {TYPE_STYLES[detail.type]}">
          {TYPE_LABELS[detail.type]}
        </span>
        <h1 class="text-2xl font-extrabold text-slate-900">{detail.title}</h1>
        {#if detail.description}
          <p class="text-slate-600">{detail.description}</p>
        {/if}

        {#if owner}
          <div class="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onclick={() => (showChange = true)}
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ubah Data
            </button>
            <button
              type="button"
              onclick={() => (showCover = true)}
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ubah Sampul
            </button>
          </div>
        {/if}
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">Daftar Tautan</h2>
        {#if owner}
          <button
            type="button"
            onclick={openAddItem}
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus class="h-4 w-4" />
            Tambah Tautan
          </button>
        {/if}
      </div>

      {#if detail.items.length === 0}
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Belum ada tautan.
        </div>
      {:else}
        <ul class="space-y-3">
          {#each detail.items as item (item.id)}
            <li class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-w-0 flex-1 items-center gap-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold text-slate-900">{item.title}</p>
                  <p class="truncate text-sm text-slate-500">{item.url}</p>
                </div>
                <ExternalLink class="h-4 w-4 shrink-0 text-slate-400" />
              </a>

              {#if owner}
                <button
                  type="button"
                  aria-label={`Ubah ${item.title}`}
                  onclick={() => openEditItem(item)}
                  class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Hapus ${item.title}`}
                  onclick={() => handleItemDelete(item)}
                  disabled={$linkTreesStore.itemSaving}
                  class="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    {#if showChange}
      <ChangeModal
        linkTree={detail}
        saving={$linkTreesStore.changing}
        onClose={() => (showChange = false)}
        onSubmit={handleChange}
      />
    {/if}

    {#if showCover}
      <ChangeCoverModal
        saving={$linkTreesStore.changingCover}
        onClose={() => (showCover = false)}
        onSubmit={handleCover}
      />
    {/if}

    {#if showItem}
      <ItemModal
        item={editingItem}
        saving={$linkTreesStore.itemSaving}
        onClose={() => (showItem = false)}
        onSubmit={handleItemSubmit}
      />
    {/if}
  {:else}
    <p class="text-sm text-slate-500">Memuat link tree...</p>
  {/if}
</div>
