<script>
  import { untrack } from "svelte";
  import Modal from "./Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";

  // item = null  -> mode tambah
  // item = {...} -> mode ubah
  let { item = null, saving = false, onClose, onSubmit } = $props();

  // Nilai awal hanya dipakai sekali untuk mengisi formulir (sengaja tidak reaktif)
  const initial = untrack(() => item ?? { title: "", url: "" });
  const { value: title, onChange: onTitleChange } = useInput(initial.title);
  const { value: url, onChange: onUrlChange } = useInput(initial.url);

  let error = $state("");

  function isValidUrl(text) {
    try {
      const parsed = new URL(text);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!$title.trim() || !$url.trim()) {
      error = "Judul dan URL wajib diisi";
      return;
    }
    if (!isValidUrl($url.trim())) {
      error = "URL harus diawali http:// atau https://";
      return;
    }

    error = "";
    onSubmit({ title: $title.trim(), url: $url.trim() });
  }
</script>

<Modal title={item ? "Ubah Tautan" : "Tambah Tautan"} {onClose}>
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="item-title" class="mb-1 block text-sm font-medium text-slate-700">Judul tautan</label>
      <input
        id="item-title"
        type="text"
        value={$title}
        oninput={onTitleChange}
        placeholder="Contoh: GitHub"
        class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="item-url" class="mb-1 block text-sm font-medium text-slate-700">URL</label>
      <input
        id="item-url"
        type="text"
        value={$url}
        oninput={onUrlChange}
        placeholder="https://contoh.com"
        class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    {#if error}
      <p role="alert" class="text-sm text-red-600">{error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onclick={onClose}
        class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={saving}
        class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>
