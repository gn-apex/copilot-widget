// A small, dependency-free context-menu engine: nested submenus, keyboard navigation, viewport clamping.

export type MenuItem =
  | { sep: true }
  | { heading: string }
  | {
      label: string;
      icon?: string;
      kbd?: string;
      run?: () => void;
      danger?: boolean;
      disabled?: boolean;
      /** Draws a check mark (radio / toggle state) */
      check?: boolean;
      sub?: MenuItem[];
    };

type Opts = {
  /** Small header shown at the top, e.g. "Visitor bubble" */
  title?: string;
  /** CSS colour for the dot beside the title */
  dot?: string;
  ico: (name: string) => SVGElement;
  /** Element to mount into (the Studio root, so theme variables apply) */
  host: HTMLElement;
  onClose?: () => void;
};

const isItem = (i: MenuItem): i is Extract<MenuItem, { label: string }> => "label" in i;

let current: { close: () => void } | null = null;

export function closeMenu() {
  current?.close();
}

function build(items: MenuItem[], o: Opts, level: number, closeAll: () => void): HTMLElement {
  const m = document.createElement("div");
  m.className = "cmenu" + (level ? " sub" : "");
  m.setAttribute("role", "menu");
  m.tabIndex = -1;
  const kids: HTMLButtonElement[] = [];

  if (!level && o.title) {
    const t = document.createElement("div");
    t.className = "cm-title";
    const d = document.createElement("i");
    if (o.dot) d.style.background = o.dot;
    t.append(d, document.createTextNode(o.title));
    m.append(t);
  }

  // collapse leading/trailing/double separators
  const clean: MenuItem[] = [];
  for (const it of items) {
    const prev = clean[clean.length - 1];
    if ("sep" in it && (!prev || "sep" in prev)) continue;
    clean.push(it);
  }
  while (clean.length && "sep" in clean[clean.length - 1]) clean.pop();

  for (const it of clean) {
    if ("sep" in it) {
      const s = document.createElement("div");
      s.className = "cm-sep";
      s.setAttribute("role", "separator");
      m.append(s);
      continue;
    }
    if ("heading" in it) {
      const h = document.createElement("div");
      h.className = "cm-head";
      h.textContent = it.heading;
      m.append(h);
      continue;
    }
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cm-i" + (it.danger ? " danger" : "") + (it.check ? " checked" : "");
    b.setAttribute("role", "menuitem");
    if (it.disabled) b.disabled = true;
    const ic = document.createElement("span");
    ic.className = "cm-ic";
    if (it.check) ic.append(o.ico("check"));
    else if (it.icon) ic.append(o.ico(it.icon));
    const lb = document.createElement("span");
    lb.className = "cm-l";
    lb.textContent = it.label;
    b.append(ic, lb);
    if (it.kbd) {
      const k = document.createElement("kbd");
      k.textContent = it.kbd;
      b.append(k);
    }
    if (it.sub) {
      b.classList.add("has-sub");
      b.setAttribute("aria-haspopup", "menu");
      const ch = document.createElement("span");
      ch.className = "cm-ch";
      ch.append(o.ico("chev"));
      b.append(ch);
      let subEl: HTMLElement | null = null;
      let timer: number | undefined;
      const open = (focusFirst = false) => {
        if (subEl || b.disabled) return;
        subEl = build(it.sub!, o, level + 1, closeAll);
        o.host.appendChild(subEl);
        const r = b.getBoundingClientRect();
        place(subEl, r.right - 4, r.top - 6, r.left + 4);
        b.classList.add("open");
        if (focusFirst) (subEl.querySelector(".cm-i:not(:disabled)") as HTMLElement | null)?.focus();
        (b as any)._sub = subEl;
      };
      const shut = () => {
        clearTimeout(timer);
        subEl?.remove();
        subEl = null;
        b.classList.remove("open");
        (b as any)._sub = null;
      };
      (b as any)._open = open;
      (b as any)._shut = shut;
      b.onmouseenter = () => {
        m.querySelectorAll<HTMLElement>(".cm-i.open").forEach((s) => s !== b && (s as any)._shut?.());
        timer = window.setTimeout(() => open(), 90);
      };
      b.onclick = () => open(true);
    } else {
      b.onmouseenter = () => {
        m.querySelectorAll<HTMLElement>(".cm-i.open").forEach((s) => (s as any)._shut?.());
        b.focus({ preventScroll: true });
      };
      b.onclick = () => {
        closeAll();
        it.run?.();
      };
    }
    kids.push(b);
    m.append(b);
  }

  m.addEventListener("keydown", (e) => {
    const list = kids.filter((k) => !k.disabled);
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => list[(n + list.length) % list.length]?.focus();
    if (e.key === "ArrowDown") (e.preventDefault(), go(i + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), go(i < 0 ? -1 : i - 1));
    else if (e.key === "Home") (e.preventDefault(), go(0));
    else if (e.key === "End") (e.preventDefault(), go(-1));
    else if (e.key === "ArrowRight" && (document.activeElement as any)?._open) {
      e.preventDefault();
      (document.activeElement as any)._open(true);
    } else if (e.key === "ArrowLeft" && level) {
      e.preventDefault();
      const parent = Array.from(o.host.querySelectorAll<HTMLElement>(".cm-i.open")).find((p) => (p as any)._sub === m);
      (parent as any)?._shut?.();
      parent?.focus();
    }
  });
  return m;
}

function place(el: HTMLElement, x: number, y: number, flipX?: number) {
  el.style.left = "0px";
  el.style.top = "0px";
  const w = el.offsetWidth,
    h = el.offsetHeight,
    vw = innerWidth,
    vh = innerHeight,
    pad = 8;
  let left = x,
    top = y;
  let ox = "left";
  if (left + w + pad > vw) {
    left = flipX !== undefined ? flipX - w : vw - w - pad;
    ox = "right";
  }
  let oy = "top";
  if (top + h + pad > vh) {
    top = Math.max(pad, vh - h - pad);
    oy = "bottom";
  }
  el.style.left = Math.max(pad, left) + "px";
  el.style.top = Math.max(pad, top) + "px";
  el.style.transformOrigin = `${ox} ${oy}`;
}

/** Opens a context menu at viewport coordinates. Returns a close function. */
export function showMenu(x: number, y: number, items: MenuItem[], o: Opts): () => void {
  closeMenu();
  const prevFocus = document.activeElement as HTMLElement | null;
  const root = build(items, o, 0, () => close());
  o.host.appendChild(root);
  place(root, x, y);
  root.focus({ preventScroll: true });

  const onDown = (e: Event) => {
    const t = e.composedPath();
    if (!t.some((n) => n instanceof HTMLElement && n.classList.contains("cmenu"))) close();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
      prevFocus?.focus?.({ preventScroll: true });
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key) && !document.activeElement?.closest(".cmenu")) {
      e.preventDefault();
      (root.querySelector(".cm-i:not(:disabled)") as HTMLElement | null)?.focus();
    }
    if (e.key === "Tab") close();
  };
  const close = () => {
    if (current?.close !== close) return;
    current = null;
    o.host.querySelectorAll(".cmenu").forEach((n) => n.remove());
    removeEventListener("pointerdown", onDown, true);
    removeEventListener("keydown", onKey, true);
    removeEventListener("blur", close);
    removeEventListener("resize", close);
    removeEventListener("wheel", onWheel, true);
    o.onClose?.();
  };
  const onWheel = (e: Event) => {
    if (!(e.composedPath() as Element[]).some((n) => n instanceof HTMLElement && n.classList?.contains("cmenu"))) close();
  };
  addEventListener("pointerdown", onDown, true);
  addEventListener("keydown", onKey, true);
  addEventListener("blur", close);
  addEventListener("resize", close);
  addEventListener("wheel", onWheel, { capture: true, passive: true });
  current = { close };
  return close;
}
