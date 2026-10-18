<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { login, authStore } from "../states/authStore.js";
  import { navigate } from "../../../router.js";
  import {
    showErrorDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper.js";

  const { value: email, onChange: onEmailChange } = useInput("");
  const { value: password, onChange: onPasswordChange } = useInput("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!$email.trim() || !$password) {
      await showWarningDialog("Email dan kata sandi wajib diisi");
      return;
    }

    try {
      await login({ email: $email.trim(), password: $password });
      navigate("/");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }
</script>

<h2 class="text-xl font-bold text-slate-900">Masuk</h2>
<p class="text-sm text-slate-500 mt-1 mb-6">
  Masuk untuk mengelola link tree milikmu.
</p>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="login-email-input" class="block text-sm font-medium text-slate-700 mb-1"
      >Email</label
    >
    <input
      id="login-email-input"
      name="email"
      type="email"
      autocomplete="email"
      value={$email}
      oninput={onEmailChange}
      placeholder="nama@email.com"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <div>
    <label for="login-password-input" class="block text-sm font-medium text-slate-700 mb-1"
      >Kata Sandi</label
    >
    <input
      id="login-password-input"
      name="password"
      type="password"
      autocomplete="current-password"
      value={$password}
      oninput={onPasswordChange}
      placeholder="••••••••"
      class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <button
    id="login-submit-button"
    type="submit"
    disabled={$authStore.loading}
    class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    {$authStore.loading ? "Memproses..." : "Masuk"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Belum punya akun?
  <a
    href="/auth/register"
    onclick={(e) => {
      e.preventDefault();
      navigate("/auth/register");
    }}
    class="font-semibold text-indigo-600 underline">Daftar</a
  >
</p>
