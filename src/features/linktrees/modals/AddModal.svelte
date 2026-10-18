<script>
  import Modal from "./Modal.svelte";
  import LinkTreeForm from "./LinkTreeForm.svelte";

  let { saving = false, onClose, onSubmit } = $props();
</script>

<Modal title="Tambah Link Tree" {onClose}>
  <LinkTreeForm
    submitLabel="Tambah"
    {saving}
    onCancel={onClose}
    {onSubmit}
  />
</Modal>
