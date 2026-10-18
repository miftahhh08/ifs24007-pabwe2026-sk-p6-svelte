import { writable } from "svelte/store";

/**
 * Hook input formulir berbasis Svelte store.
 * Pemakaian di komponen:
 *   const { value, onChange, reset } = useInput("");
 *   <input value={$value} oninput={onChange} />
 */
export function useInput(initialValue = "") {
  const value = writable(initialValue);

  function onChange(event) {
    value.set(event.target.value);
  }

  function reset() {
    value.set(initialValue);
  }

  return { value, onChange, reset };
}
