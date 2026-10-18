<script>
  import { Link2 } from "lucide-svelte";

  let { children } = $props();
</script>

<div
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10"
>
  <div class="w-full max-w-md">
    <div class="flex flex-col items-center text-center mb-8">
      <div
        class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200"
      >
        <Link2 class="w-7 h-7 text-white" />
      </div>
      <h1 class="mt-4 text-2xl font-extrabold text-slate-900">
        Delcom Link Tree
      </h1>
      <p class="mt-2 text-sm text-slate-500">
        Kumpulkan semua tautan pentingmu dalam satu halaman yang rapi dan mudah
        dibagikan.
      </p>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      {@render children()}
    </div>
  </div>
</div>
