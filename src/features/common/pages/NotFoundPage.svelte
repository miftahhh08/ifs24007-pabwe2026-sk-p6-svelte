<script>
  import { navigate } from "../../../router.js";

  function goHome(event) {
    event.preventDefault();
    navigate("/");
  }
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
  <p class="text-6xl font-extrabold text-indigo-600">404</p>
  <h1 class="mt-4 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
  <p class="mt-2 max-w-sm text-sm text-slate-500">
    Alamat yang kamu buka tidak ada atau sudah dipindahkan.
  </p>
  <a
    href="/"
    onclick={goHome}
    class="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
  >
    Kembali ke beranda
  </a>
</div>
