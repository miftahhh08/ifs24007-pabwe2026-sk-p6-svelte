<script>
  import { X } from "lucide-svelte";

  let { title, onClose, children } = $props();

  function handleBackdropClick(event) {
    // Tutup hanya bila yang diklik latar gelap, bukan isi dialog
    if (event.target === event.currentTarget) onClose();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  data-testid="modal-backdrop"
  role="presentation"
  onclick={handleBackdropClick}
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
>
  <div
    role="dialog"
    aria-modal="true"
    aria-label={title}
    class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <h2 class="text-lg font-bold text-slate-900">{title}</h2>
      <button
        type="button"
        aria-label="Tutup"
        onclick={onClose}
        class="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-600"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    {@render children()}
  </div>
</div>
