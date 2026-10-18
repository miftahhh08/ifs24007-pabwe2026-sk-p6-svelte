<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { register, authStore } from "../states/authStore.js";
  import { navigate } from "../../../router.js";
  import {
    showErrorDialog,
    showSuccessDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper.js";

  const { value: name, onChange: onNameChange } = useInput("");
  const { value: email, onChange: onEmailChange } = useInput("");
  const { value: password, onChange: onPasswordChange } = useInput("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!$name.trim() || !$email.trim() || !$password) {
      await showWarningDialog("Nama, email, dan kata sandi wajib diisi");
      return;
    }

    try {
      await register({
        name: $name.trim(),
        email: $email.trim(),
        password: $password,
      });
      await showSuccessDialog("Akun berhasil dibuat, silakan masuk");
      navigate("/auth/login");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }
</script>

<h2 class="text-xl font-bold text-slate-900">Daftar</h2>
<p class="text-sm text-slate-500 mt-1 mb-6">
  Buat akun baru untuk mulai membuat link tree.
</p>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="name" class="block text-sm font-medium text-slate-700 mb-1"
      >Nama</label
    >
    <input
      id="name"
      type="text"
      value={$name}
      oninput={onNameChange}
      placeholder="Nama lengkap"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <div>
    <label for="email" class="block text-sm font-medium text-slate-700 mb-1"
      >Email</label
    >
    <input
      id="email"
      type="email"
      value={$email}
      oninput={onEmailChange}
      placeholder="nama@email.com"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <div>
    <label for="password" class="block text-sm font-medium text-slate-700 mb-1"
      >Kata Sandi</label
    >
    <input
      id="password"
      type="password"
      value={$password}
      oninput={onPasswordChange}
      placeholder="Minimal 6 karakter"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <button
    type="submit"
    disabled={$authStore.loading}
    class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    {$authStore.loading ? "Memproses..." : "Daftar"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Sudah punya akun?
  <a
    href="/auth/login"
    onclick={(e) => {
      e.preventDefault();
      navigate("/auth/login");
    }}
    class="font-semibold text-indigo-600 hover:underline">Masuk</a
  >
</p>
