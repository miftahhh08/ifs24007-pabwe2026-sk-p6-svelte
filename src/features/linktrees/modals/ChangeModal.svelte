<script>
  import Modal from "./Modal.svelte";
  import LinkTreeForm from "./LinkTreeForm.svelte";

  let { linkTree, saving = false, onClose, onSubmit } = $props();
</script>

<Modal title="Ubah Link Tree" {onClose}>
  <LinkTreeForm
    initial={linkTree}
    submitLabel="Simpan"
    {saving}
    onCancel={onClose}
    {onSubmit}
  />
</Modal>
