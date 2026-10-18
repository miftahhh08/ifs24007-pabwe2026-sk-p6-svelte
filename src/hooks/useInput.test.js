import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("memakai nilai awal default string kosong", () => {
    const { value } = useInput();
    expect(get(value)).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const { value } = useInput("halo");
    expect(get(value)).toBe("halo");
  });

  it("onChange memperbarui nilai dari event", () => {
    const { value, onChange } = useInput();
    onChange({ target: { value: "baru" } });
    expect(get(value)).toBe("baru");
  });

  it("reset mengembalikan ke nilai awal", () => {
    const { value, onChange, reset } = useInput("awal");
    onChange({ target: { value: "ubah" } });
    reset();
    expect(get(value)).toBe("awal");
  });
});
