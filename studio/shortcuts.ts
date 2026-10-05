// One definition per shortcut. The same list drives key handling, the ? cheat-sheet, the command palette and menus.
//
// Key syntax:  "mod+s"  "mod+shift+z"  "alt+c"  "d"  "?"  "["  "1"
//   mod = ⌘ on macOS, Ctrl elsewhere.   Letters/digits are matched by physical key (e.code) so Option+C on a Mac works.

export type Sc = {
  id: string;
  keys: string;
  label: string;
  group: string;
  icon?: string;
  run: () => void;
  /** Also fire while typing in a field (default: only modifier shortcuts do) */
  typing?: boolean;
  /** Don't list in the command palette / cheat-sheet */
  hidden?: boolean;
  /** Custom chips for the cheat-sheet (e.g. a key range) */
  show?: string[];
};

export const isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");

export function match(e: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split("+");
  const main = parts.pop()!;
  const mod = parts.includes("mod");
  const shift = parts.includes("shift");
  const alt = parts.includes("alt");
  if ((e.ctrlKey || e.metaKey) !== mod) return false;
  if (e.altKey !== alt) return false;
  const letter = /^[a-z]$/.test(main);
  const digit = /^[0-9]$/.test(main);
  if ((letter || digit || shift) && e.shiftKey !== shift) return false;
  if (letter) return e.code === "Key" + main.toUpperCase();
  if (digit) return e.code === "Digit" + main || e.code === "Numpad" + main;
  if (main === "esc") return e.key === "Escape";
  return e.key === main;
}

const SYM: Record<string, string> = { mod: isMac ? "⌘" : "Ctrl", shift: isMac ? "⇧" : "Shift", alt: isMac ? "⌥" : "Alt", esc: "Esc" };

/** Display parts for <kbd> chips: "mod+shift+z" → ["⌘","⇧","Z"] */
export function parts(keys: string): string[] {
  const p = keys.toLowerCase().split("+");
  return p.map((k) => SYM[k] ?? (k.length === 1 ? k.toUpperCase() : k));
}

export function fmt(keys: string): string {
  const p = parts(keys);
  return isMac ? p.join("") : p.join("+");
}
