<script>
  import Modal from "./Modal.svelte";

  let { saving = false, onClose, onSubmit } = $props();

  let file = $state(null);
  let error = $state("");

  function handleFileChange(event) {
    file = event.target.files[0] ?? null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      error = "Pilih gambar terlebih dahulu";
      return;
    }
    if (!file.type.startsWith("image/")) {
      error = "Berkas harus berupa gambar";
      return;
    }

    error = "";
    onSubmit(file);
  }
</script>

<Modal title="Ubah Sampul" {onClose}>
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="cover-file" class="mb-1 block text-sm font-medium text-slate-700">Gambar sampul</label>
      <input
        id="cover-file"
        type="file"
        accept="image/*"
        onchange={handleFileChange}
        class="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
      />
      {#if file}
        <p class="mt-2 text-xs text-slate-500">Dipilih: <strong>{file.name}</strong></p>
      {/if}
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
        {saving ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  </form>
</Modal>
