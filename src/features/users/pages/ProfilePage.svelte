<script>
  import { onMount } from "svelte";
  import { Camera } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import {
    usersStore,
    fetchProfile,
    updateProfile,
    updatePhoto,
    updatePassword,
  } from "../states/usersStore.js";
  import {
    showErrorDialog,
    showSuccessDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper.js";

  const { value: name, onChange: onNameChange } = useInput("");
  const { value: email, onChange: onEmailChange } = useInput("");
  const {
    value: currentPassword,
    onChange: onCurrentChange,
    reset: resetCurrent,
  } = useInput("");
  const {
    value: newPassword,
    onChange: onNewChange,
    reset: resetNew,
  } = useInput("");
  const {
    value: confirmPassword,
    onChange: onConfirmChange,
    reset: resetConfirm,
  } = useInput("");

  onMount(async () => {
    try {
      await fetchProfile();
      name.set($usersStore.profile.name);
      email.set($usersStore.profile.email);
    } catch (error) {
      await showErrorDialog(error.message);
    }
  });

  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (!$name.trim() || !$email.trim()) {
      await showWarningDialog("Nama dan email wajib diisi");
      return;
    }

    try {
      await updateProfile({ name: $name.trim(), email: $email.trim() });
      await showSuccessDialog("Profil berhasil diperbarui");
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function handlePhotoChange(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;

    try {
      await updatePhoto(file);
      await showSuccessDialog("Foto profil berhasil diperbarui");
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      input.value = "";
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!$currentPassword || !$newPassword || !$confirmPassword) {
      await showWarningDialog("Semua kolom kata sandi wajib diisi");
      return;
    }
    if ($newPassword !== $confirmPassword) {
      await showWarningDialog("Konfirmasi kata sandi tidak sama");
      return;
    }

    try {
      await updatePassword({
        password: $currentPassword,
        newPassword: $newPassword,
      });
      await showSuccessDialog("Kata sandi berhasil diubah");
      resetCurrent();
      resetNew();
      resetConfirm();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }
</script>

<div class="space-y-6 max-w-2xl">
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900">Profil</h1>
    <p class="text-sm text-slate-500 mt-1">
      Kelola data akun, foto, dan kata sandimu.
    </p>
  </div>

  {#if $usersStore.profile}
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-center gap-5 mb-6">
        {#if $usersStore.profile.photo}
          <img
            src={$usersStore.profile.photo}
            alt="Foto profil"
            class="w-20 h-20 rounded-full object-cover"
          />
        {:else}
          <div
            data-testid="avatar-initial"
            class="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold flex items-center justify-center"
          >
            {$usersStore.profile.name.charAt(0).toUpperCase()}
          </div>
        {/if}

        <div>
          <label
            for="photo"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Camera class="w-4 h-4" />
            Ubah Foto
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            class="sr-only"
            onchange={handlePhotoChange}
          />
          <p class="text-xs text-slate-400 mt-2">JPG atau PNG.</p>
        </div>
      </div>

      <form onsubmit={handleProfileSubmit} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nama</label>
          <input
            id="name"
            type="text"
            value={$name}
            oninput={onNameChange}
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={$email}
            oninput={onEmailChange}
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={$usersStore.saving}
          class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Simpan Perubahan
        </button>
      </form>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-bold text-slate-900 mb-4">Ubah Kata Sandi</h2>
      <form onsubmit={handlePasswordSubmit} class="space-y-4">
        <div>
          <label for="current-password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Saat Ini</label>
          <input
            id="current-password"
            type="password"
            value={$currentPassword}
            oninput={onCurrentChange}
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="new-password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
          <input
            id="new-password"
            type="password"
            value={$newPassword}
            oninput={onNewChange}
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
          <input
            id="confirm-password"
            type="password"
            value={$confirmPassword}
            oninput={onConfirmChange}
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={$usersStore.saving}
          class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Ubah Kata Sandi
        </button>
      </form>
    </section>
  {:else}
    <p class="text-sm text-slate-500">Memuat profil...</p>
  {/if}
</div>
