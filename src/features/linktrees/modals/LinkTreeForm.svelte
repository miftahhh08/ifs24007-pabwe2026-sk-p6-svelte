<script>
  import { untrack } from "svelte";
  import { useInput } from "../../../hooks/useInput.js";

  let {
    initial = { title: "", type: "public", description: "" },
    submitLabel,
    saving = false,
    onCancel,
    onSubmit,
  } = $props();

  // Nilai awal hanya dipakai sekali untuk mengisi formulir (sengaja tidak reaktif)
  const start = untrack(() => initial);

  const { value: title, onChange: onTitleChange } = useInput(start.title);
  const { value: type, onChange: onTypeChange } = useInput(start.type);
  const { value: description, onChange: onDescriptionChange } = useInput(
    start.description ?? ""
  );

  let error = $state("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!$title.trim()) {
      error = "Judul wajib diisi";
      return;
    }

    error = "";
    onSubmit({
      title: $title.trim(),
      type: $type,
      description: $description.trim(),
    });
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="lt-title" class="mb-1 block text-sm font-medium text-slate-700">Judul</label>
    <input
      id="lt-title"
      type="text"
      value={$title}
      oninput={onTitleChange}
      placeholder="Contoh: Portofolio Saya"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <div>
    <label for="lt-type" class="mb-1 block text-sm font-medium text-slate-700">Visibilitas</label>
    <select
      id="lt-type"
      value={$type}
      onchange={onTypeChange}
      class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="public">Publik</option>
      <option value="unlisted">Tidak terdaftar</option>
      <option value="private">Privat</option>
    </select>
  </div>

  <div>
    <label for="lt-description" class="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
    <textarea
      id="lt-description"
      rows="3"
      value={$description}
      oninput={onDescriptionChange}
      placeholder="Ceritakan isi link tree ini"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    ></textarea>
  </div>

  {#if error}
    <p role="alert" class="text-sm text-red-600">{error}</p>
  {/if}

  <div class="flex justify-end gap-3 pt-2">
    <button
      type="button"
      onclick={onCancel}
      class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Batal
    </button>
    <button
      type="submit"
      disabled={saving}
      class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      {saving ? "Menyimpan..." : submitLabel}
    </button>
  </div>
</form>
