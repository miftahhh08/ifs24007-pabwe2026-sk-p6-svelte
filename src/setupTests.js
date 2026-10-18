import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Ikon lucide-svelte diganti komponen kosong agar tes ringan dan stabil.
// Komponen Svelte 5 pada dasarnya adalah fungsi (anchor, props).
vi.mock("lucide-svelte", () => {
  const createIcon = (name) => {
    const Icon = (anchor) => {
      const el = document.createElement("svg");
      el.setAttribute("data-testid", `icon-${name}`);
      anchor.before(el);
    };
    return Icon;
  };

  return new Proxy(
    {},
    {
      has() {
        return true;
      },
      get(_target, name) {
        if (name === "__esModule") return true;
        if (name === "then") return undefined;
        return createIcon(String(name));
      },
    }
  );
});
