import "../src/index";
import {
  DEFAULTS,
  resolve,
  fromServer,
  type WidgetSchema,
} from "../src/schema";
import type { GxCopilot } from "../src/widget";
import { SECTIONS, PRESETS, SPLIT_PATHS, type Field, type Opt } from "./fields";
import { SOUNDS, playSound, unlockAudio, type SoundName } from "../src/sounds";
import { showMenu, closeMenu, type MenuItem } from "./menu";
import { match, fmt, parts as kbdParts, isMac as IS_MAC, type Sc } from "./shortcuts";
import CSS from "./styles";

export interface StudioOptions {
  apiUrl?: string;
  projectId?: string;
  projectName?: string;
  siteUrl?: string;
  /** Return the user's JWT. Omit to use cookie auth (credentials: 'include'). */
  getToken?: () => string | null | Promise<string | null>;
  onPublished?: (schema: WidgetSchema) => void;
  /** Dashboard integration: return the project's saved server config (raw aiConfig incl. `ui`). Uses your authed client. */
  loadConfig?: () => Promise<unknown>;
  /** Dashboard integration: persist `{ ui }`. Throw on failure. */
  saveUi?: (ui: WidgetSchema) => Promise<void>;
  /** Shows a Close button (for overlay/sheet usage). */
  onClose?: () => void;
  /** Force the Studio theme. Default 'auto' = follow the host app (`.dark` class on <html>) then the OS. */
  theme?: "auto" | "light" | "dark";
}

/* ───────────────────────── tiny DOM kit ───────────────────────── */
type Kid = Node | string | null | undefined | false;
function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, any> = {},
  ...kids: Kid[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) (e as any)[k] = v;
    else if (v !== false && v != null)
      e.setAttribute(k, v === true ? "" : String(v));
  }
  e.append(
    ...(kids.filter((k) => k !== null && k !== undefined && k !== false) as (
      | Node
      | string
    )[]),
  );
  return e;
}
const get = (o: any, p: string) => p.split(".").reduce((a, k) => a?.[k], o);
const set = (o: any, p: string, v: unknown) => {
  const ks = p.split("."),
    l = ks.pop()!;
  ks.reduce((a, k) => a[k], o)[l] = v;
};
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
const opt = (o: Opt) =>
  typeof o === "string"
    ? { value: o, label: o[0].toUpperCase() + o.slice(1) }
    : o;
const MOD = IS_MAC ? "⌘" : "Ctrl";

/* ───────────────────────── icons ───────────────────────── */
const ICON_SVGS: Record<string, string> = {
  chat: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13a7 7 0 0 1 7 7.5Z"/>',
  sparkles:
    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.7M12 17h.01"/>',
  message: '<path d="M4 6h16v10H8l-4 3V6z"/>',
  wave: '<path d="M4 14c2-4 4-6 6-6s3 3 5 3 4-3 5-5"/><path d="M4 18c2-3 4-5 6-5s3 2 5 2 4-2 5-4"/>',
  custom:
    '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12h6M12 9v6"/>',
};
const UI: Record<string, string> = {
  ...ICON_SVGS,
  layout:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2H18a4 4 0 0 0 4-4c0-4.9-4.5-9-10-9z"/>',
  window:
    '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sliders:
    '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  monitor:
    '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone:
    '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  embed: '<path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  play: '<path d="m7 4 13 8-13 8z"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  focus: '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  chat2: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  alert:
    '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
};
const ico = (name: string, cls = "i") => {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("class", cls);
  s.innerHTML = UI[name] || UI.chat;
  return s;
};
const SECTION_ICON: Record<string, string> = {
  presets: "sparkles",
  presentation: "layout",
  brand: "palette",
  launcher: "chat",
  window: "window",
  persona: "user",
  messages: "message",
  behavior: "sliders",
  composer: "pen",
  toasts: "bell",
  advanced: "code",
};

/* ───────────────────────── colour helpers ───────────────────────── */
const lum = (hex: string) => {
  const n = parseInt(
    hex.length === 4
      ? hex
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("")
      : hex.slice(1),
    16,
  );
  const ch = (c: number) =>
    (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * ch((n >> 16) & 255) +
    0.7152 * ch((n >> 8) & 255) +
    0.0722 * ch(n & 255)
  );
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const SWATCHES = [
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#0a0a0a",
];

/** Mini diagram for each presentation mode inside the mode picker / template thumbnails. */
const MODE_BOX: Record<string, string> = {
  panel: "width:30%;height:62%;right:8%;bottom:10%;border-radius:4px",
  drawer: "width:38%;height:100%;right:0;top:0;border-radius:0",
  sheet: "width:100%;height:46%;left:0;bottom:0;border-radius:6px 6px 0 0",
  dialog: "width:50%;height:56%;left:25%;top:20%;border-radius:6px",
  popover: "width:36%;height:44%;right:10%;bottom:20%;border-radius:5px",
  fullscreen: "width:100%;height:100%;left:0;top:0;border-radius:0",
};
const modePreview = (mode: string) =>
  h(
    "div",
    { class: "mode-preview" },
    h("i", { style: MODE_BOX[mode] || MODE_BOX.panel }),
  );

function applyPatch(
  base: WidgetSchema,
  patch: Record<string, any>,
): WidgetSchema {
  const s = structuredClone(base) as any;
  for (const [k, v] of Object.entries(patch)) Object.assign(s[k], v);
  return resolve(s);
}

function presetThumb(patch: Record<string, any>): HTMLElement {
  const s = applyPatch(DEFAULTS, patch);
  const dark = s.theme.mode === "dark";
  const t = h("div", {
    class: "thumb",
    style: `background:${dark ? "#0b0b0b" : "#f4f4f5"}`,
  });
  const box = h(
    "div",
    {
      class: "tp",
      style: `${MODE_BOX[s.presentation.mode]};background:${dark ? "#171717" : "#fff"};border-radius:${Math.min(9, s.theme.radius * 0.38)}px`,
    },
    h("b", { style: `background:${s.theme.primaryColor}` }),
  );
  const sz = Math.round(s.launcher.size * 0.32);
  const right = s.launcher.position.endsWith("right"),
    top = s.launcher.position.startsWith("top");
  const rad = { circle: "50%", pill: "99px", square: "2px", rounded: "5px" }[
    s.launcher.shape as string
  ];
  const l = h("div", {
    class: "tl",
    style: `width:${s.launcher.shape === "pill" && s.launcher.label ? sz * 2 : sz}px;height:${sz}px;${right ? "right" : "left"}:6px;${top ? "top" : "bottom"}:6px;background:${s.theme.primaryColor};border-radius:${rad}`,
  });
  l.append(ico(s.launcher.icon, ""));
  (l.firstChild as SVGElement).setAttribute("class", "");
  if (!["sheet", "fullscreen", "dialog"].includes(s.presentation.mode) || true)
    t.append(box, l);
  return t;
}

/** Mounts the Studio into `root`. Returns a cleanup function (use it in React useEffect). */
export function mountStudio(
  root: HTMLElement,
  opts: StudioOptions = {},
): () => void {
  if (!document.getElementById("gxs-style")) {
    const st = h("style", { id: "gxs-style" });
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const api = (opts.apiUrl || "").replace(/\/$/, ""),
    pid = opts.projectId || "",
    hasLive = !!(api && pid),
    connected = hasLive || !!(opts.loadConfig || opts.saveUi);

  let schema: WidgetSchema = structuredClone(DEFAULTS);
  let published = JSON.stringify(schema);
  let hist = [published],
    hi = 0,
    lastPath = "",
    lastT = 0;
  let active = "presets",
    query = "",
    device: "desktop" | "mobile" = "desktop",
    bg: "light" | "dark" | "site" = opts.siteUrl ? "site" : "light",
    site = opts.siteUrl || "",
    live = false,
    publishing = false;
  let themePref: "auto" | "light" | "dark" = opts.theme || "auto";
  try {
    if (!opts.theme)
      themePref = (localStorage.getItem("gxs-theme") as any) || "auto";
  } catch {
    /* storage may be blocked */
  }

  const totalFields = SECTIONS.reduce((n, s) => n + s.fields.length, 0);

  root.innerHTML = "";
  const app = h("div", { class: "gxs" });
  root.append(app);
  app.innerHTML = `
    <div class="gxs-top">
      <div class="gxs-brand"><div class="logo" id="logo"></div><b>Copilot Studio</b><span class="crumb" id="proj"></span></div>
      <span class="sp"></span>
      <span id="state" class="pill"><i></i><span></span></span>
      <span class="vsep hide-sm"></span>
      <button id="undo" class="btn icon ghost" title="Undo (${MOD}Z)"></button>
      <button id="redo" class="btn icon ghost" title="Redo (${MOD}⇧Z)"></button>
      <button id="revert" class="btn ghost hide-md">Discard</button>
      <button id="cmdk" class="btn hide-sm" title="Command palette"><span id="cmdk-i"></span>Search <kbd>${MOD}K</kbd></button>
      <button id="keys" class="btn icon ghost hide-sm" title="Keyboard shortcuts (?)"></button>
      <button id="focus" class="btn icon ghost hide-sm" title="Focus on the preview (F)"></button>
      <button id="theme" class="btn icon ghost"></button>
      <button id="pub" class="btn primary"><span id="pub-i"></span><span id="pub-t">Publish</span></button>
      <button id="close" class="btn icon ghost" style="display:none" title="Close"></button>
    </div>
    <div class="gxs-body">
      <nav id="nav"></nav>
      <div class="gxs-panel" id="ctl"></div>
      <div class="gxs-main">
        <div class="stage-bar">
          <div class="seg" id="dev"><button data-v="desktop"></button><button data-v="mobile"></button></div>
          <div class="seg hide-sm" id="bgs"><button data-v="light">Light</button><button data-v="dark">Dark</button><button data-v="site">Website</button></div>
          <label class="addr hide-md" id="addr"><span id="addr-i"></span><input id="site" placeholder="Paste your website URL to preview on it" spellcheck="false" /></label>
          <span class="sp"></span>
          <button class="btn sm" id="pdemo" title="Fill the chat with a sample conversation (E)"><span id="pdemo-i"></span><span class="hide-md">Sample chat</span></button>
          <button class="btn sm" id="ptoast" title="Show the auto-toast now (T)"><span id="ptoast-i"></span><span class="hide-md">Toast</span></button>
          <div class="seg" id="win"><button data-v="open">Window open</button><button data-v="closed">Closed</button></div>
          <label class="seg" id="livel" title="Send preview messages to your real AI"><button type="button" id="live"><span id="live-i"></span>Live AI</button></label>
        </div>
        <div class="gxs-wrap"><div class="stage" id="stage"><div class="fake" id="fake"></div><iframe id="frame" title="Website preview"></iframe></div></div>
      </div>
    </div>
    <footer class="gxs-status" id="status">
      <span class="st-sec" id="st-sec"></span><span class="st-dot"></span>
      <span id="st-edit"></span>
      <span class="sp"></span>
      <span id="st-dev"></span><span class="st-dot hide-sm"></span>
      <span id="st-host" class="hide-sm"></span>
      <span class="st-hint hide-md"><b>Right-click</b> anything for tools · <kbd>?</kbd> shortcuts</span>
    </footer>
    <div id="toast"></div>`;
  const $ = <T extends HTMLElement>(id: string) =>
    app.querySelector("#" + id) as T;
  const mountIcon = (id: string, name: string) =>
    $(id).replaceChildren(ico(name));
  mountIcon("logo", "sparkles");
  mountIcon("undo", "undo");
  mountIcon("redo", "redo");
  mountIcon("cmdk-i", "search");
  mountIcon("pub-i", "up");
  mountIcon("close", "x");
  mountIcon("keys", "keyboard");
  mountIcon("focus", "focus");
  mountIcon("pdemo-i", "chat2");
  mountIcon("ptoast-i", "bell");
  mountIcon("addr-i", "globe");
  mountIcon("live-i", "zap");
  app
    .querySelector("#dev button[data-v=desktop]")!
    .replaceChildren(ico("monitor"), "Desktop");
  app
    .querySelector("#dev button[data-v=mobile]")!
    .replaceChildren(ico("phone"), "Mobile");
  const stage = $("stage"),
    ctl = $("ctl");

  // Preview widget lives INSIDE the stage (transform on .stage makes fixed children stage-relative)
  const el = document.createElement("gnapex-copilot-root") as GxCopilot;
  el.style.cssText = "position:absolute;inset:0";
  stage.appendChild(el);
  el.previewMode = true;
  const mock: GxCopilot["transport"] = async (m) => {
    await new Promise((r) => setTimeout(r, 650));
    const last: any = m[m.length - 1];
    const q = String(last.content || "").slice(0, 140);
    const att = (last.attachments || []).length
      ? `\n\nI can see **${last.attachments.length} attachment${last.attachments.length > 1 ? "s" : ""}** — in production they’re passed to your multimodal model.`
      : "";
    return `This is a **preview reply** to “${q}”.\n\n- Real answers come from your AI once published\n- Markdown renders like this: \`inline code\`, [links](https://example.com) and tables\n\n\`\`\`ts\nconst reply = "styled by the Studio";\n\`\`\`${att}`;
  };
  el.transport = mock;
  el.projectId = pid;
  el.apiUrl = api;
  $("fake").innerHTML =
    `<div class="nav"><b>YourBrand</b><span>Home</span><span>Products</span><span>About</span><span>Contact</span></div>
    <div class="hero"><h1>Welcome to your website</h1><p>This sample page shows how the assistant looks on top of your content. Switch device and background to preview every combination.</p><button>Get started</button></div>
    <div class="cards"><i></i><i></i><i></i></div>`;

  /* ───────── theme (follows host `.dark` class — Tailwind darkMode:"class") ───────── */
  const hostDark = () => {
    const c = document.documentElement.classList;
    if (c.contains("dark")) return true;
    if (c.contains("light")) return false;
    return matchMedia("(prefers-color-scheme: dark)").matches;
  };
  function applyTheme() {
    const dark = themePref === "auto" ? hostDark() : themePref === "dark";
    app.dataset.theme = dark ? "dark" : "light";
    $("theme").replaceChildren(
      ico(themePref === "auto" ? "monitor" : dark ? "moon" : "sun"),
    );
    $("theme").title = `Theme: ${themePref} (click to change)`;
  }
  const mo = new MutationObserver(() => themePref === "auto" && applyTheme());
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  $("theme").onclick = () => {
    themePref =
      themePref === "auto" ? "light" : themePref === "light" ? "dark" : "auto";
    try {
      localStorage.setItem("gxs-theme", themePref);
    } catch {
      /* noop */
    }
    applyTheme();
    toast(`Studio theme: ${themePref}`);
  };

  /* ───────── helpers ───────── */
  const toast = (t: string, bad = false) => {
    const n = $("toast");
    n.replaceChildren(h("i", {}, ico(bad ? "x" : "check")), t);
    n.className = "show" + (bad ? " bad" : "");
    clearTimeout((n as any)._t);
    (n as any)._t = setTimeout(() => (n.className = ""), 3200);
  };
  const dirty = () => JSON.stringify(schema) !== published;
  const customised = (f: Field) =>
    !same(get(schema, f.path), get(DEFAULTS, f.path)) ||
    (!!f.path2 && !same(get(schema, f.path2), get(DEFAULTS, f.path2)));
  const customCount = (id: string) =>
    SECTIONS.find((s) => s.id === id)!.fields.filter(customised).length;
  const totalCustom = () =>
    SECTIONS.reduce((n, s) => n + s.fields.filter(customised).length, 0);

  function modal(build: (close: () => void) => HTMLElement, center = true) {
    const ov = h("div", { class: "ov" + (center ? " center" : "") });
    const close = () => ov.remove();
    ov.onmousedown = (e) => e.target === ov && close();
    ov.append(build(close));
    app.append(ov);
    return close;
  }
  const ask = (title: string, desc: string, ok: string, danger = false) =>
    new Promise<boolean>((res) => {
      modal((close) => {
        const done = (v: boolean) => {
          close();
          res(v);
        };
        return h(
          "div",
          { class: "dlg", role: "alertdialog" },
          h("header", {}, h("h3", {}, title), h("p", {}, desc)),
          h("div", { class: "dbody" }),
          h(
            "footer",
            {},
            h("button", { class: "btn", onclick: () => done(false) }, "Cancel"),
            h(
              "button",
              {
                class: "btn " + (danger ? "danger" : "primary"),
                onclick: () => done(true),
              },
              ok,
            ),
          ),
        );
      });
    });

  function apply() {
    el.setConfig({
      ...schema,
      composer: { ...schema.composer, autofocus: false },
      presentation: {
        ...schema.presentation,
        closeOnOutside: false,
        closeOnEscape: false,
      },
    });
    el.simulateHost = bg === "dark" ? "dark" : "light";
    el.setCompact(device === "mobile");
    const isDirty = dirty();
    const st = $("state");
    st.className = "pill " + (isDirty ? "dirty" : connected ? "ok" : "");
    st.lastElementChild!.textContent = isDirty
      ? "Unpublished changes"
      : connected
        ? "Published"
        : "Offline draft";
    ($("undo") as HTMLButtonElement).disabled = hi === 0;
    ($("redo") as HTMLButtonElement).disabled = hi >= hist.length - 1;
    ($("revert") as HTMLButtonElement).disabled = !isDirty;
    ($("pub") as HTMLButtonElement).disabled = connected && !isDirty;
    $("pub").classList.toggle("busy", publishing);
    $("pub-t").textContent = publishing
      ? "Publishing…"
      : connected
        ? "Publish"
        : "Copy schema";
    stage.dataset.device = device;
    stage.dataset.bg = bg;
    app.toggleAttribute("data-split", schema.theme.splitColors);
    app.toggleAttribute("data-focus", focusMode);
    $("focus").classList.toggle("on", focusMode);
    updateStatus();
    $("frame").style.display = bg === "site" && site ? "block" : "none";
    app
      .querySelectorAll<HTMLElement>("#dev button")
      .forEach((b) => b.classList.toggle("on", b.dataset.v === device));
    app
      .querySelectorAll<HTMLElement>("#bgs button")
      .forEach((b) => b.classList.toggle("on", b.dataset.v === bg));
    $("live").classList.toggle("on", live);
    app
      .querySelectorAll<HTMLElement>("#win button")
      .forEach((b) =>
        b.classList.toggle("on", (b.dataset.v === "open") === el.opened),
      );
    syncFields();
    app.querySelectorAll<HTMLElement>("nav button[data-id]").forEach((b) => {
      const id = b.dataset.id!;
      if (id === "presets") return;
      const n = customCount(id),
        badge = b.querySelector(".n");
      if (badge) badge.textContent = n ? String(n) : "";
      (badge as HTMLElement | null)?.toggleAttribute("hidden", !n);
    });
  }
  function commit(path: string) {
    const snap = JSON.stringify(schema),
      now = Date.now();
    if (path === lastPath && now - lastT < 700 && hi === hist.length - 1)
      hist[hi] = snap;
    else {
      hist = hist.slice(0, hi + 1);
      hist.push(snap);
      hi = hist.length - 1;
    }
    lastPath = path;
    lastT = now;
    apply();
  }
  const goto = (i: number) => {
    hi = i;
    schema = JSON.parse(hist[hi]);
    lastPath = "";
    renderCtl();
    apply();
  };

  /* ───────── controls ───────── */
  type Live = { f: Field; wrap: HTMLElement };
  let liveFields: Live[] = [];
  function syncFields() {
    for (const { f, wrap } of liveFields) {
      wrap.classList.toggle("changed", customised(f));
      wrap.classList.toggle("hide", !!f.when && !f.when(schema));
    }
  }

  function control(f: Field, showSection?: string): HTMLElement {
    const v = get(schema, f.path);
    const on = (val: unknown) => {
      set(schema, f.path, val);
      commit(f.path);
    };
    const pick = (e: Event, sel: string, val: string) => {
      (e.currentTarget as HTMLElement)
        .parentElement!.querySelectorAll(sel)
        .forEach((b) => b.classList.remove("on"));
      (e.currentTarget as HTMLElement).classList.add("on");
      on(val);
    };
    let input: HTMLElement;
    let extra: Kid = null;

    if (f.type === "color") {
      const opt0 = !!f.optional;
      const sw = h("i", { style: `background:${v || "transparent"}` });
      const c = h("input", { type: "color", value: v || "#808080" }),
        t = h("input", {
          type: "text",
          value: v,
          maxlength: 7,
          spellcheck: "false",
          placeholder: opt0 ? "Auto" : "",
        });
      const chip = h("span", { class: "contrast" });
      const pal = h("div", { class: "palette" });
      const paint = (val: string) => {
        const empty = !val;
        sw.style.background = empty
          ? "repeating-conic-gradient(var(--bd2) 0 25%,transparent 0 50%) 0 0/8px 8px"
          : val;
        chip.style.display = empty ? "none" : "";
        if (!empty) {
          const r = Math.max(ratio(val, "#ffffff"), ratio(val, "#0b0f17"));
          const white = ratio(val, "#ffffff") >= 4.5;
          chip.className = "contrast " + (r >= 4.5 ? "pass" : "fail");
          chip.replaceChildren(
            `${white ? "white" : "dark"} text `,
            h("b", {}, `${r.toFixed(1)}:1`),
          );
          chip.title =
            r >= 4.5
              ? "Passes WCAG AA for text on this colour"
              : "Low contrast — text on this colour may be hard to read";
        }
        pal
          .querySelectorAll("button")
          .forEach((b) =>
            b.classList.toggle("on", b.dataset.c === val.toLowerCase()),
          );
      };
      SWATCHES.forEach((col) =>
        pal.append(
          h("button", {
            "data-c": col,
            title: col,
            style: `background:${col}`,
            onclick: () => {
              c.value = t.value = col;
              paint(col);
              on(col);
            },
          }),
        ),
      );
      if (opt0)
        pal.append(
          h(
            "button",
            {
              class: "auto",
              title: "Automatic",
              onclick: () => {
                t.value = "";
                paint("");
                on("");
              },
            },
            "Auto",
          ),
        );
      c.oninput = () => {
        t.value = c.value;
        paint(c.value);
        on(c.value);
      };
      t.oninput = () => {
        if (/^#[0-9a-f]{6}$/i.test(t.value)) {
          c.value = t.value;
          paint(t.value);
          on(t.value);
        } else if (opt0 && !t.value) {
          paint("");
          on("");
        }
      };
      paint(v);
      input = h(
        "div",
        {},
        h(
          "div",
          { class: "colorrow" },
          h("span", { class: "sw" }, sw, c),
          t,
          chip,
        ),
        pal,
      );
    } else if (f.type === "range") {
      const out = h("output", {}, `${v}${f.unit ?? ""}`),
        r = h("input", { type: "range", min: f.min, max: f.max, step: f.step ?? 1, value: v });
      const fill = () =>
        r.style.setProperty(
          "--p",
          `${((+r.value - (f.min ?? 0)) / ((f.max ?? 100) - (f.min ?? 0))) * 100}%`,
        );
      fill();
      r.oninput = () => {
        out.textContent = `${r.value}${f.unit ?? ""}`;
        fill();
        on(+r.value);
      };
      input = h("div", { class: "rangerow" }, r, out);
    } else if (f.type === "segment") {
      input = h(
        "div",
        { class: "seg wide" },
        ...f.options!.map(opt).map((o) =>
          h(
            "button",
            {
              class: o.value === v ? "on" : "",
              onclick: (e: Event) => pick(e, "button", o.value),
            },
            o.label,
          ),
        ),
      );
    } else if (f.type === "mode") {
      input = h(
        "div",
        { class: "mode-grid" },
        ...f.options!.map(opt).map((o) =>
          h(
            "button",
            {
              class: "mode-card" + (o.value === v ? " on" : ""),
              onclick: (e: Event) => pick(e, ".mode-card", o.value),
            },
            modePreview(o.value),
            h("strong", {}, o.label),
            h("span", {}, (o as any).hint || ""),
          ),
        ),
      );
    } else if (f.type === "icon") {
      input = h(
        "div",
        { class: "icon-grid" },
        ...f.options!.map(opt).map((o) => {
          const svg = ico(o.value, "");
          return h(
            "button",
            {
              class: "icon-btn" + (o.value === v ? " on" : ""),
              onclick: (e: Event) => pick(e, ".icon-btn", o.value),
            },
            svg,
            o.label,
          );
        }),
      );
    } else if (f.type === "select") {
      const s = h(
        "select",
        {},
        ...f
          .options!.map(opt)
          .map((o) =>
            h("option", { value: o.value, selected: o.value === v }, o.label),
          ),
      );
      s.onchange = () => on(s.value);
      input = s;
    } else if (f.type === "toggle") {
      const c = h("input", { type: "checkbox", checked: !!v });
      c.onchange = () => on(c.checked);
      input = h("label", { class: "switch" }, c, h("i"));
    } else if (f.type === "lines") {
      const list: string[] = [...(v as string[])];
      const maxN = f.maxItems ?? 8;
      const counter = h("span", { class: "counter" }, `${list.length}/${maxN}`);
      const chips = h("div", { class: "chips" });
      const field = h("input", {
        type: "text",
        placeholder: list.length
          ? "Add another…"
          : "Type a question, press Enter",
      });
      const draw = () => {
        chips.replaceChildren(
          ...list.map((q, i) =>
            h(
              "span",
              { class: "chip" },
              h("span", {}, q),
              h(
                "button",
                {
                  title: "Remove",
                  onclick: () => {
                    list.splice(i, 1);
                    draw();
                    on([...list]);
                  },
                },
                ico("x", ""),
              ),
            ),
          ),
          field,
        );
        counter.textContent = `${list.length}/${maxN}`;
        field.disabled = list.length >= maxN;
      };
      field.onkeydown = (e) => {
        if ((e.key === "Enter" || e.key === ",") && field.value.trim()) {
          e.preventDefault();
          if (list.length < maxN) {
            list.push(field.value.trim().slice(0, 120));
            field.value = "";
            draw();
            on([...list]);
            field.focus();
          }
        } else if (e.key === "Backspace" && !field.value && list.length) {
          list.pop();
          draw();
          on([...list]);
          field.focus();
        }
      };
      draw();
      extra = counter;
      input = chips;
    } else if (f.type === "sound") {
      const grid = h("div", { class: "sound-grid" });
      SOUNDS.forEach((o) =>
        grid.append(
          h(
            "button",
            {
              class: "sound-card" + (o.id === v ? " on" : ""),
              title: o.hint,
              onclick: (e: Event) => {
                const b = e.currentTarget as HTMLElement;
                unlockAudio();
                pick(e, ".sound-card", o.id);
                playSound(o.id as SoundName, schema.behavior.soundVolume / 100);
                b.classList.remove("ping");
                void b.offsetWidth;
                b.classList.add("ping");
              },
            },
            h("span", { class: "bars" }, h("i"), h("i"), h("i"), h("i")),
            h("b", {}, o.label),
            h("small", {}, o.hint),
          ),
        ),
      );
      input = grid;
    } else if (f.type === "widths") {
      const rows: [string, string, string][] = [
        ["Visitor", f.path, "user"],
        ["Assistant", f.path2!, "ai"],
      ];
      const bars: Record<string, HTMLElement> = {};
      const outs: Record<string, HTMLElement> = {};
      const ranges: Record<string, HTMLInputElement> = {};
      const lane = h("div", { class: "wlane" });
      const ctrl = h("div", { class: "wctrl" });
      const quick = h("div", { class: "wquick" });
      const fillR = (r: HTMLInputElement) =>
        r.style.setProperty("--p", `${((+r.value - (f.min ?? 0)) / ((f.max ?? 100) - (f.min ?? 0))) * 100}%`);
      const sync = () => {
        for (const [, path, cls] of rows) {
          const val = get(schema, path) as number;
          bars[cls].style.width = val + "%";
          outs[cls].textContent = val + "%";
          ranges[cls].value = String(val);
          fillR(ranges[cls]);
        }
        quick.querySelectorAll("button").forEach((b) => {
          const [a, c] = (b as HTMLElement).dataset.v!.split(",").map(Number);
          b.classList.toggle("on", a === get(schema, f.path) && c === get(schema, f.path2!));
        });
      };
      for (const [label, path, cls] of rows) {
        const row = h("div", { class: "wr " + cls });
        row.append(h("div", { class: "wrow " + (cls === "user" ? "r" : "l") }, (bars[cls] = h("i", { class: "wb " + cls }, h("em", {}, label)))));
        lane.append(row);
        const r = h("input", { type: "range", min: f.min, max: f.max, step: 1, value: get(schema, path) }) as HTMLInputElement;
        ranges[cls] = r;
        outs[cls] = h("output");
        r.oninput = () => {
          set(schema, path, +r.value);
          commit(path);
          sync();
        };
        ctrl.append(h("div", { class: "rangerow w" }, h("span", { class: "wl" }, label), r, outs[cls]));
      }
      for (const [a, c, name] of [
        [70, 85, "Tight"],
        [80, 100, "Balanced"],
        [90, 100, "Wide"],
        [100, 100, "Full"],
      ] as const)
        quick.append(
          h(
            "button",
            {
              "data-v": `${a},${c}`,
              title: `${name}: visitor ${a}% · assistant ${c}%`,
              onclick: () => {
                set(schema, f.path, a);
                set(schema, f.path2!, c);
                commit(f.path);
                sync();
              },
            },
            name,
          ),
        );
      sync();
      input = h("div", { class: "widths" }, lane, ctrl, quick);
    } else if (f.type === "textarea") {
      const t = h("textarea", {
        rows: f.path === "customCss" ? 10 : 3,
        class: f.path === "customCss" ? "code" : "",
        spellcheck: f.path === "customCss" ? "false" : null,
      });
      t.value = v;
      t.oninput = () => on(t.value);
      input = t;
    } else {
      const t = h("input", { type: "text", value: v });
      t.oninput = () => on(t.value);
      input = t;
    }

    const wrap = h("div", {
      class: "field" + (f.type === "toggle" ? " inline" : ""),
      "data-path": f.path,
    });
    const splitTag = SPLIT_PATHS.includes(f.path)
      ? h("span", { class: "sec split" }, "light")
      : f.path.endsWith("Dark") && SPLIT_PATHS.includes(f.path.slice(0, -4))
        ? h("span", { class: "sec split dk" }, "dark")
        : null;
    const reset = h(
      "button",
      {
        class: "reset",
        title: "Reset to default",
        onclick: () => {
          set(schema, f.path, structuredClone(get(DEFAULTS, f.path)));
          if (f.path2) set(schema, f.path2, structuredClone(get(DEFAULTS, f.path2)));
          commit(f.path);
          renderBody();
        },
      },
      ico("reset", ""),
      "Reset",
    );
    wrap.append(
      h(
        "div",
        { class: "lbl" },
        h("label", {}, f.label),
        showSection ? h("span", { class: "sec" }, showSection) : null,
        splitTag,
        extra,
        reset,
      ),
      input,
    );
    if (f.hint) wrap.append(h("small", {}, f.hint));
    liveFields.push({ f, wrap });
    return wrap;
  }

  /* ───────── panels ───────── */
  const embedCode = () =>
    `<script src="${api || "https://YOUR-API"}/cdn/copilot.js"\n  data-project-id="${pid || "PROJECT_ID"}"${api ? `\n  data-api-url="${api}"` : ""} async></script>`;
  const download = (name: string, text: string) => {
    const a = h("a", {
      href: URL.createObjectURL(new Blob([text], { type: "application/json" })),
      download: name,
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copy = async (t: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(t);
      toast(msg);
    } catch {
      toast("Clipboard blocked by the browser", true);
    }
  };
  const doImport = () =>
    modal((close) => {
      const ta = h("textarea", {
        placeholder: '{ "theme": { … } }',
        spellcheck: "false",
      });
      const err = h("div", { class: "err" });
      const go = h("button", { class: "btn primary" }, "Import");
      go.onclick = () => {
        try {
          schema = resolve(JSON.parse(ta.value));
          commit("import");
          renderCtl();
          close();
          toast("Schema imported");
        } catch {
          err.textContent = "That is not valid schema JSON.";
        }
      };
      setTimeout(() => ta.focus(), 30);
      return h(
        "div",
        { class: "dlg", role: "dialog" },
        h(
          "header",
          {},
          h("h3", {}, "Import schema"),
          h(
            "p",
            {},
            "Paste JSON exported from another project. Invalid values fall back to safe defaults.",
          ),
        ),
        h("div", { class: "dbody" }, ta, err),
        h(
          "footer",
          {},
          h("button", { class: "btn", onclick: close }, "Cancel"),
          go,
        ),
      );
    });
  const resetAll = async () => {
    if (
      !(await ask(
        "Reset everything?",
        "All settings return to the factory design. You can still undo this.",
        "Reset all",
        true,
      ))
    )
      return;
    schema = structuredClone(DEFAULTS);
    commit("reset");
    renderCtl();
    toast("Reset to defaults");
  };
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    schema = applyPatch(schema, p.patch as any);
    commit("preset:" + p.name);
    renderCtl();
    toast(`Applied “${p.name}”`);
  };
  const presetActive = (p: (typeof PRESETS)[number]) => {
    const t = applyPatch(schema, p.patch as any);
    return same(t, schema);
  };

  function tool(
    icon: string,
    title: string,
    desc: string,
    fn: () => void,
    danger = false,
  ) {
    return h(
      "button",
      { class: "tool" + (danger ? " danger" : ""), onclick: fn },
      ico(icon),
      h("strong", {}, title),
      h("span", {}, desc),
    );
  }

  function renderTemplates(body: HTMLElement) {
    body.append(
      h(
        "div",
        { class: "stat-row" },
        h(
          "div",
          { class: "stat" },
          h("b", {}, String(totalCustom())),
          h("span", {}, "Customised"),
        ),
        h(
          "div",
          { class: "stat" },
          h("b", {}, `${totalFields}`),
          h("span", {}, "Settings"),
        ),
        h(
          "div",
          { class: "stat" },
          h("b", {}, String(hi)),
          h("span", {}, "Edits"),
        ),
      ),
      h("div", { class: "group-title" }, "Templates"),
      h(
        "div",
        { class: "preset-grid" },
        ...PRESETS.map((p) =>
          h(
            "button",
            {
              class: "preset" + (presetActive(p) ? " cur" : ""),
              onclick: () => applyPreset(p),
            },
            presetThumb(p.patch as any),
            h(
              "strong",
              {},
              h("i", { style: `background:${p.swatch}` }),
              p.name,
            ),
            h("span", { class: "desc" }, p.desc),
          ),
        ),
      ),
      h("div", { class: "group-title" }, "Tools"),
      h(
        "div",
        { class: "tool-grid" },
        tool("copy", "Copy JSON", "Schema to clipboard", () =>
          copy(JSON.stringify(schema, null, 2), "Schema JSON copied"),
        ),
        tool("download", "Export file", "Download .json", () => {
          download(
            `copilot-${pid || "design"}.json`,
            JSON.stringify(schema, null, 2),
          );
          toast("Exported");
        }),
        tool("upload", "Import", "Paste a schema", doImport),
        tool("reset", "Reset all", "Back to factory", resetAll, true),
      ),
      h("div", { class: "group-title" }, "Embed"),
      h("div", { class: "snippet" }, embedCode()),
      h(
        "div",
        { style: "margin-top:8px" },
        h(
          "button",
          {
            class: "btn",
            onclick: () => copy(embedCode(), "Embed code copied"),
          },
          ico("embed"),
          "Copy embed code",
        ),
      ),
    );
  }

  function renderBody() {
    const body = ctl.querySelector(".panel-body") as HTMLElement;
    body.replaceChildren();
    liveFields = [];
    const q = query.trim().toLowerCase();
    if (q) {
      const hits = SECTIONS.flatMap((s) =>
        s.fields
          .filter((f) =>
            `${f.label} ${f.hint ?? ""} ${f.path}`.toLowerCase().includes(q),
          )
          .map((f) => [s, f] as const),
      );
      if (!hits.length)
        body.append(
          h(
            "div",
            { class: "empty" },
            h("b", {}, "No matching setting"),
            `Nothing matches “${query}”. Try “color”, “mobile” or “icon”.`,
          ),
        );
      else hits.forEach(([s, f]) => body.append(control(f, s.title)));
    } else if (active === "presets") renderTemplates(body);
    else {
      const s = SECTIONS.find((x) => x.id === active)!;
      let lastGroup = "";
      for (const f of s.fields) {
        if (f.group && f.group !== lastGroup) {
          body.append(h("div", { class: "group-title" }, f.group));
          lastGroup = f.group;
        }
        body.append(control(f));
      }
    }
    syncFields();
  }

  function renderCtl() {
    ctl.textContent = "";
    const q = query.trim();
    const s =
      active === "presets" ? null : SECTIONS.find((x) => x.id === active)!;
    const search = h("input", {
      type: "text",
      placeholder: `Search ${totalFields} settings…`,
      value: query,
      id: "q",
      spellcheck: "false",
    });
    search.oninput = () => {
      query = search.value;
      renderBody();
    };
    search.onkeydown = (e) => {
      if (e.key === "Escape") {
        query = "";
        search.value = "";
        renderBody();
        search.blur();
      }
    };
    const head = h(
      "div",
      { class: "panel-head" },
      h(
        "h2",
        {},
        h("span", { class: "hi" }, ico(SECTION_ICON[active] || "sliders")),
        q ? "Search results" : s ? s.title : "Templates & tools",
      ),
      h(
        "p",
        { class: "blurb" },
        q
          ? "Matching settings across every section."
          : s
            ? s.blurb
            : "Start from a polished look, then fine-tune every detail in the other sections.",
      ),
      h(
        "div",
        { class: "search" },
        ico("search"),
        search,
        h("span", { class: "kbd" }, "/"),
      ),
    );
    ctl.append(head, h("div", { class: "panel-body anim" }));
    ctl.onscroll = () => head.classList.toggle("stuck", ctl.scrollTop > 4);
    renderBody();
  }

  const navKey = (id: string) => {
    const ids = ["presets", ...SECTIONS.map((x) => x.id)];
    const i = ids.indexOf(id);
    return i < 9 ? String(i + 1) : i === ids.length - 1 ? "0" : "";
  };
  function renderNav() {
    const nav = $("nav");
    nav.textContent = "";
    nav.append(h("div", { class: "nav-label" }, "Design"));
    for (const [id, title] of [
      ["presets", "Templates"],
      ...SECTIONS.map((s) => [s.id, s.title]),
    ] as [string, string][]) {
      nav.append(
        h(
          "button",
          {
            "data-id": id,
            title,
            class: id === active && !query ? "on" : "",
            "data-k": navKey(id),
            onclick: () => goSection(id),
          },
          ico(SECTION_ICON[id] || "sliders"),
          h("span", { class: "t" }, title),
          id === "presets" ? null : h("span", { class: "n", hidden: true }),
        ),
      );
    }
    nav.append(
      h(
        "div",
        { class: "nav-foot" },
        h("b", {}, "Tip"),
        h("br"),
        `${MOD}K jumps anywhere · 1–9 switch sections · ? lists every shortcut · right-click for tools.`,
      ),
    );
  }

  /* ───────── command palette ───────── */
  function palette() {
    type Cmd = {
      g: string;
      t: string;
      icon: string;
      hint?: string;
      run: () => void;
    };
    const cmds: Cmd[] = [
      ...[
        ["presets", "Templates & tools"],
        ...SECTIONS.map((s) => [s.id, s.title]),
      ].map(([id, t]) => ({
        g: "Go to",
        t,
        icon: SECTION_ICON[id] || "sliders",
        run: () => goSection(id),
      })),
      ...PRESETS.map((p) => ({
        g: "Apply template",
        t: p.name,
        icon: "sparkles",
        hint: p.desc,
        run: () => applyPreset(p),
      })),
      ...SHORTCUTS.filter((x) => !x.hidden || x.id === "palette").filter((x) => x.id !== "palette" && x.id !== "jump").map((x) => ({
        g: x.group,
        t: x.label,
        icon: x.icon || "zap",
        hint: fmt(x.keys),
        run: x.run,
      })),
      { g: "Tools", t: "Copy embed code", icon: "embed", run: () => copy(embedCode(), "Embed code copied") },
      ...SECTIONS.flatMap((s) =>
        s.fields.map((f) => ({
          g: "Settings",
          t: f.label,
          icon: SECTION_ICON[s.id],
          hint: s.title,
          run: () => locate(f.path),
        })),
      ),
    ];
    modal((close) => {
      let sel = 0,
        shown: Cmd[] = [];
      const list = h("div", { class: "plist" });
      const inp = h("input", {
        placeholder: "Type a command, section or setting…",
        spellcheck: "false",
      });
      const draw = () => {
        const q = inp.value.trim().toLowerCase();
        shown = cmds
          .filter(
            (c) =>
              !q || `${c.t} ${c.g} ${c.hint ?? ""}`.toLowerCase().includes(q),
          )
          .slice(0, 40);
        sel = Math.min(sel, Math.max(0, shown.length - 1));
        list.replaceChildren();
        let g = "";
        shown.forEach((c, i) => {
          if (c.g !== g) {
            list.append(h("div", { class: "pgrp" }, c.g));
            g = c.g;
          }
          const b = h(
            "button",
            {
              class: "pit" + (i === sel ? " sel" : ""),
              onclick: () => {
                close();
                c.run();
              },
            },
            ico(c.icon),
            c.t,
            c.hint ? h("small", {}, c.hint) : null,
          );
          b.onmousemove = () => {
            if (sel !== i) {
              sel = i;
              draw();
            }
          };
          list.append(b);
        });
        if (!shown.length)
          list.append(h("div", { class: "empty" }, "No results"));
        (list.querySelector(".sel") as HTMLElement | null)?.scrollIntoView({
          block: "nearest",
        });
      };
      inp.oninput = () => {
        sel = 0;
        draw();
      };
      inp.onkeydown = (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          sel = Math.min(shown.length - 1, sel + 1);
          draw();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          sel = Math.max(0, sel - 1);
          draw();
        } else if (e.key === "Enter" && shown[sel]) {
          close();
          shown[sel].run();
        } else if (e.key === "Escape") close();
      };
      draw();
      setTimeout(() => inp.focus(), 20);
      return h(
        "div",
        { class: "pal", role: "dialog" },
        h(
          "div",
          { class: "pin" },
          ico("search"),
          inp,
          h("span", { class: "kbd" }, "esc"),
        ),
        list,
      );
    }, false);
  }

  /* ───────── backend ───────── */
  async function load() {
    try {
      const raw = opts.loadConfig
        ? await opts.loadConfig()
        : await (await fetch(`${api}/copilot/${pid}/config`)).json();
      schema = fromServer(raw);
      published = JSON.stringify(schema);
      hist = [published];
      hi = 0;
      renderCtl();
      apply();
    } catch (e) {
      toast("Could not load your saved design: " + (e as Error).message, true);
    }
  }
  async function publish() {
    if (publishing) return;
    if (!connected) {
      copy(JSON.stringify(schema, null, 2), "Offline mode: schema JSON copied");
      return;
    }
    if (!dirty()) return;
    publishing = true;
    apply();
    try {
      if (opts.saveUi) await opts.saveUi(schema);
      else {
        const t = await opts.getToken?.();
        const r = await fetch(`${api}/ai-agent/project/${pid}/config`, {
          method: "PATCH",
          credentials: t ? "same-origin" : "include",
          headers: {
            "Content-Type": "application/json",
            ...(t ? { Authorization: `Bearer ${t}` } : {}),
          },
          body: JSON.stringify({ ui: schema }),
        });
        if (!r.ok)
          throw new Error(`${r.status} ${(await r.text()).slice(0, 160)}`);
      }
      published = JSON.stringify(schema);
      toast("Published — your website now shows this design");
      opts.onPublished?.(schema);
    } catch (e) {
      toast("Publish failed: " + (e as Error).message, true);
    } finally {
      publishing = false;
      apply();
    }
  }


  /* ───────── navigation, section tools, status ───────── */
  let focusMode = false;
  let stageW = 0,
    stageH = 0;
  const sectionOf = (path: string) =>
    SECTIONS.find((s) => s.fields.some((f) => f.path === path || f.path2 === path));
  const fieldDef = (path: string) => SECTIONS.flatMap((s) => s.fields).find((f) => f.path === path);
  const secPaths = (id: string) =>
    SECTIONS.find((s) => s.id === id)!.fields.flatMap((f) => (f.path2 ? [f.path, f.path2] : [f.path]));
  const sectionDirty = (id: string) => secPaths(id).some((p) => !same(get(schema, p), get(DEFAULTS, p)));
  const secTitle = (id: string) => (id === "presets" ? "Templates & tools" : SECTIONS.find((s) => s.id === id)!.title);

  function refreshCtl() {
    const y = ctl.scrollTop;
    renderBody();
    ctl.scrollTop = y;
  }
  function updateStatus() {
    const sec = query ? "Search" : active === "presets" ? "Templates" : SECTIONS.find((s) => s.id === active)!.title;
    $("st-sec").textContent = sec;
    $("st-edit").textContent = `edit ${hi} / ${hist.length - 1}` + (dirty() ? " · unpublished" : "");
    $("st-dev").textContent = `${device === "mobile" ? "Mobile" : "Desktop"} · ${stageW}×${stageH}`;
    $("st-host").textContent = `host site: ${bg === "dark" ? "dark" : "light"}${schema.theme.mode === "auto" ? " · auto" : ""}`;
  }
  function goSection(id: string) {
    active = id;
    query = "";
    if (id === "launcher" || id === "toasts") el.close();
    else if (id !== "presets") el.open();
    renderNav();
    renderCtl();
    apply();
    if (id === "toasts" && schema.toasts.enabled) setTimeout(() => el.previewToast(), 380);
  }
  /** Jump to a setting, scroll it into view and pulse it. */
  function locate(path: string) {
    const sec = sectionOf(path);
    if (!sec) return;
    if (active !== sec.id || query) goSection(sec.id);
    requestAnimationFrame(() => {
      const w = ctl.querySelector<HTMLElement>(`[data-path="${path}"]`);
      if (!w) return;
      w.scrollIntoView({ block: "center", behavior: "smooth" });
      w.classList.remove("flash");
      void w.offsetWidth;
      w.classList.add("flash");
    });
  }
  async function resetSection(id: string) {
    const t = secTitle(id);
    if (id === "presets" || !sectionDirty(id)) return toast(`${t} is already at its defaults`);
    if (!(await ask(`Reset “${t}”?`, "Every setting in this section returns to its default. You can undo this.", "Reset section", true))) return;
    for (const p of secPaths(id)) set(schema, p, structuredClone(get(DEFAULTS, p)));
    commit("reset:" + id);
    renderCtl();
    toast(`${t} reset`);
  }
  function copySection(id: string) {
    if (id === "presets") return copy(JSON.stringify(schema, null, 2), "Full schema copied");
    const o: Record<string, unknown> = {};
    for (const p of secPaths(id)) o[p] = get(schema, p);
    copy(JSON.stringify(o, null, 2), `${secTitle(id)} settings copied`);
  }
  async function pasteSection(id: string) {
    try {
      const o = JSON.parse(await navigator.clipboard.readText());
      const allowed = new Set(id === "presets" ? [] : secPaths(id));
      const next = structuredClone(schema);
      let n = 0;
      for (const [k, v] of Object.entries(o)) if (allowed.has(k)) (set(next, k, v), n++);
      if (!n) throw new Error("none");
      schema = resolve(next);
      commit("paste:" + id);
      renderCtl();
      toast(`Pasted ${n} settings into ${secTitle(id)}`);
    } catch {
      toast("The clipboard doesn’t hold settings copied from this section", true);
    }
  }
  async function pasteValue(f: Field) {
    try {
      const t = (await navigator.clipboard.readText()).trim();
      let v: unknown = t;
      if (f.type === "toggle") v = /^(true|1|on|yes)$/i.test(t);
      else if (f.type === "range") v = parseFloat(t);
      else if (f.type === "lines") v = JSON.parse(t);
      else if (f.type === "color" && t && !/^#[0-9a-f]{6}$/i.test(t)) throw new Error("hex");
      const next = structuredClone(schema);
      set(next, f.path, v);
      schema = resolve(next);
      commit(f.path);
      renderCtl();
      toast("Value pasted");
    } catch {
      toast("The clipboard doesn’t hold a valid value for this setting", true);
    }
  }
  const valueText = (path: string) => {
    const v = get(schema, path);
    return typeof v === "string" ? v : JSON.stringify(v);
  };

  /* ───────── shortcuts (single source of truth: keys, cheat-sheet, palette) ───────── */
  const navIds = () => ["presets", ...SECTIONS.map((s) => s.id)];
  const stepSection = (d: number) => {
    const ids = navIds();
    goSection(ids[(ids.indexOf(active) + d + ids.length) % ids.length]);
  };
  const toggleBg = () => {
    bg = bg === "light" ? "dark" : bg === "dark" ? (site ? "site" : "light") : "light";
    apply();
    toast(`Host site preview: ${bg}${schema.theme.mode === "auto" && bg !== "site" ? " — the widget follows it" : ""}`);
  };
  const toggleDevice = () => {
    device = device === "desktop" ? "mobile" : "desktop";
    apply();
  };
  const toggleWindow = () => (el.opened ? el.close() : el.open());
  const toggleFocus = () => {
    focusMode = !focusMode;
    apply();
    if (focusMode) toast("Focus mode — press F to bring the panels back");
  };
  const previewToast = () => {
    el.close();
    setTimeout(() => el.previewToast(), 140);
  };
  const demoChat = () => {
    el.open();
    el.demo();
  };
  const resetChat = () => {
    el.clear();
    toast("Preview conversation cleared");
  };
  const focusSearch = () => {
    if (active === "presets" && !query) {
      /* the search box exists on every panel */
    }
    (app.querySelector("#q") as HTMLInputElement | null)?.focus();
  };
  const digitIds = () => navIds();

  const SHORTCUTS: Sc[] = [
    { id: "publish", keys: "mod+s", label: "Publish changes", group: "General", icon: "up", run: () => publish() },
    { id: "palette", keys: "mod+k", label: "Command palette", group: "General", icon: "search", run: () => (app.querySelector(".ov") ? app.querySelector(".ov")!.remove() : palette()), hidden: true },
    { id: "undo", keys: "mod+z", label: "Undo", group: "General", icon: "undo", run: () => hi > 0 && goto(hi - 1) },
    { id: "redo", keys: "mod+shift+z", label: "Redo", group: "General", icon: "redo", run: () => hi < hist.length - 1 && goto(hi + 1) },
    { id: "redo2", keys: "mod+y", label: "Redo", group: "General", icon: "redo", run: () => hi < hist.length - 1 && goto(hi + 1), hidden: true },
    { id: "help", keys: "?", label: "Keyboard shortcuts", group: "General", icon: "keyboard", run: () => showShortcuts() },
    { id: "search", keys: "/", label: "Search settings", group: "General", icon: "search", run: focusSearch },
    { id: "focus", keys: "f", label: "Focus on the preview", group: "General", icon: "focus", run: toggleFocus },

    { id: "jump", keys: "1", label: "Jump to a section (0 = last)", group: "Navigate", icon: "layout", show: ["1", "–", "9"], run: () => goSection(digitIds()[0]), hidden: false },
    { id: "prev", keys: "[", label: "Previous section", group: "Navigate", icon: "sliders", run: () => stepSection(-1) },
    { id: "next", keys: "]", label: "Next section", group: "Navigate", icon: "sliders", run: () => stepSection(1) },

    { id: "device", keys: "d", label: "Toggle desktop / mobile", group: "Preview", icon: "phone", run: toggleDevice },
    { id: "bg", keys: "b", label: "Cycle host-site background", group: "Preview", icon: "sun", run: toggleBg },
    { id: "window", keys: "o", label: "Open / close the chat window", group: "Preview", icon: "chat", run: toggleWindow },
    { id: "toast", keys: "t", label: "Preview the auto-toast", group: "Preview", icon: "bell", run: previewToast },
    { id: "demo", keys: "e", label: "Load a sample conversation", group: "Preview", icon: "chat2", run: demoChat },
    { id: "resetchat", keys: "r", label: "Clear the preview conversation", group: "Preview", icon: "trash", run: resetChat },

    { id: "copyjson", keys: "alt+c", label: "Copy schema JSON", group: "Tools", icon: "copy", run: () => copy(JSON.stringify(schema, null, 2), "Schema JSON copied") },
    { id: "export", keys: "alt+e", label: "Export as .json file", group: "Tools", icon: "download", run: () => (download(`copilot-${pid || "design"}.json`, JSON.stringify(schema, null, 2)), toast("Exported")) },
    { id: "import", keys: "alt+i", label: "Import schema…", group: "Tools", icon: "upload", run: () => doImport() },
    { id: "resetsec", keys: "alt+r", label: "Reset this section", group: "Tools", icon: "reset", run: () => resetSection(active) },
    { id: "resetall", keys: "alt+shift+r", label: "Reset everything", group: "Tools", icon: "reset", run: () => resetAll() },
  ];
  const isSingle = (k: string) => !/(mod|alt)\+/.test(k);

  function showShortcuts() {
    modal((close) => {
      const groups = ["General", "Navigate", "Preview", "Tools"];
      const body = h("div", { class: "kgrid" });
      for (const g of groups) {
        const col = h("div", { class: "kgrp" }, h("h4", {}, g));
        for (const sc of SHORTCUTS.filter((x) => x.group === g && !x.hidden)) {
          col.append(
            h(
              "div",
              { class: "krow" },
              h("span", {}, sc.label),
              h("span", { class: "kcap" }, ...(sc.show ?? kbdParts(sc.keys)).map((k) => h("kbd", {}, k))),
            ),
          );
        }
        if (g === "Navigate")
          col.append(h("div", { class: "krow" }, h("span", {}, "Search every setting & command"), h("span", { class: "kcap" }, ...kbdParts("mod+k").map((k) => h("kbd", {}, k)))));
        body.append(col);
      }
      return h(
        "div",
        { class: "dlg wide", role: "dialog", "aria-label": "Keyboard shortcuts" },
        h("header", {}, h("h3", {}, "Keyboard shortcuts"), h("p", {}, "Single keys work whenever you aren’t typing in a field. Right-click any part of the preview or the controls for context tools — hold Shift to get the browser’s own menu.")),
        h("div", { class: "dbody" }, body),
        h("footer", {}, h("span", { class: "fnote" }, h("kbd", {}, "Esc"), " closes this"), h("button", { class: "btn primary", onclick: close }, "Got it")),
      );
    });
  }

  /* ───────── context menu: tools change with the area you right-click ───────── */
  const optPairs = (path: string): [string, string][] =>
    (fieldDef(path)?.options ?? []).map(opt).map((o) => [o.value, o.label] as [string, string]);
  const setPath = (path: string, val: unknown) => {
    set(schema, path, val);
    commit(path);
    refreshCtl();
  };
  const radio = (path: string, label: string, icon?: string): MenuItem => ({
    label,
    icon,
    sub: optPairs(path).map(([v, l]) => ({ label: l, check: get(schema, path) === v, run: () => setPath(path, v) })),
  });
  const flag = (path: string, label: string, icon?: string): MenuItem => ({
    label,
    icon: icon,
    check: !!get(schema, path),
    run: () => setPath(path, !get(schema, path)),
  });
  const steps = (path: string, label: string, vals: number[], unit = "", icon?: string): MenuItem => ({
    label,
    icon,
    sub: vals.map((v) => ({ label: v + unit, check: get(schema, path) === v, run: () => setPath(path, v) })),
  });
  const edit = (path: string, label: string, icon = "sliders"): MenuItem => ({ label, icon, run: () => locate(path) });
  const SEP: MenuItem = { sep: true };

  const common = (): MenuItem[] => [
    SEP,
    { label: "Command palette", icon: "search", kbd: fmt("mod+k"), run: () => palette() },
    { label: "Keyboard shortcuts", icon: "keyboard", kbd: "?", run: showShortcuts },
  ];
  const stageItems = (): MenuItem[] => [
    { label: el.opened ? "Close chat window" : "Open chat window", icon: "chat", kbd: "O", run: toggleWindow },
    { label: "Preview auto-toast", icon: "bell", kbd: "T", run: previewToast },
    { label: "Load sample conversation", icon: "chat2", kbd: "E", run: demoChat },
    { label: "Clear conversation", icon: "trash", kbd: "R", run: resetChat },
    SEP,
    {
      label: "Device",
      icon: "phone",
      sub: [
        { label: "Desktop", check: device === "desktop", run: () => ((device = "desktop"), apply()) },
        { label: "Mobile", check: device === "mobile", run: () => ((device = "mobile"), apply()) },
      ],
    },
    {
      label: "Host site is…",
      icon: "sun",
      kbd: "B",
      sub: [
        { label: "Light", check: bg === "light", run: () => ((bg = "light"), apply()) },
        { label: "Dark", check: bg === "dark", run: () => ((bg = "dark"), apply()) },
        { label: "My website", check: bg === "site", disabled: !site, run: () => ((bg = "site"), apply()) },
      ],
    },
    { label: focusMode ? "Show panels" : "Focus on preview", icon: "focus", kbd: "F", run: toggleFocus },
    SEP,
    { label: "Copy embed code", icon: "embed", run: () => copy(embedCode(), "Embed code copied") },
  ];

  type Area = { title: string; dot: string; items: MenuItem[] };
  function areaFor(e: MouseEvent): Area {
    const path = e.composedPath().filter((n): n is Element => n instanceof Element);
    const hit = (sel: string) => path.find((n) => n.matches(sel));
    const text = (n?: Element) => (n?.textContent || "").trim();

    if (path.includes(el)) {
      if (hit(".toast"))
        return {
          title: "Auto toast",
          dot: "#f59e0b",
          items: [
            edit("toasts.messages", "Edit toast messages…", "bell"),
            radio("toasts.style", "Style", "palette"),
            flag("toasts.sound", "Play a sound", "volume"),
            flag("toasts.dismissible", "Dismiss button"),
            SEP,
            { label: "Show it again", icon: "play", kbd: "T", run: previewToast },
            flag("toasts.enabled", "Toasts enabled", "bell"),
          ],
        };
      if (hit(".launcher"))
        return {
          title: "Launcher button",
          dot: "var(--ac)",
          items: [
            edit("launcher.shape", "Customise launcher…", "chat"),
            { label: el.opened ? "Close chat" : "Open chat", icon: "chat", kbd: "O", run: toggleWindow },
            SEP,
            radio("launcher.shape", "Shape"),
            radio("launcher.position", "Position"),
            steps("launcher.size", "Size", [48, 56, 64, 72, 80], "px"),
            flag("launcher.pulse", "Attention pulse"),
            flag("launcher.glow", "Glow"),
          ],
        };
      if (hit(".code-block"))
        return {
          title: "Code block",
          dot: "#a78bfa",
          items: [
            radio("messages.codeTheme", "Code theme", "code"),
            edit("messages.codeTheme", "Customise rich content…", "code"),
            { label: "Copy code", icon: "copy", run: () => copy(text(hit(".code-block")?.querySelector("pre") || undefined), "Code copied") },
          ],
        };
      if (hit(".m.user"))
        return {
          title: "Visitor bubble",
          dot: "var(--ac)",
          items: [
            edit("messages.userBg", "Customise visitor bubble…", "message"),
            radio("messages.bubbleStyle", "Bubble style"),
            radio("messages.userAlign", "Alignment"),
            steps("messages.userMaxWidth", "Max width", [60, 70, 80, 90, 100], "%"),
            steps("messages.fontSize", "Text size", [12, 13, 13.5, 14, 15, 16], "px"),
            SEP,
            { label: "Copy message", icon: "copy", run: () => copy(text(hit(".m.user")), "Message copied") },
          ],
        };
      if (hit(".m.assistant") || hit(".action-chip") || hit(".tbl-wrap"))
        return {
          title: "Assistant bubble",
          dot: "#38bdf8",
          items: [
            edit("messages.aiBg", "Customise assistant bubble…", "message"),
            radio("messages.aiStyle", "Reply style"),
            radio("messages.bubbleStyle", "Bubble style"),
            steps("messages.aiMaxWidth", "Max width", [70, 85, 100], "%"),
            flag("messages.aiBorder", "Outline"),
            radio("messages.codeTheme", "Code blocks", "code"),
            SEP,
            { label: "Copy reply", icon: "copy", run: () => copy(text(hit(".m.assistant")), "Reply copied") },
          ],
        };
      if (hit(".reasoning-block") || hit(".tool-block"))
        return {
          title: "Reasoning & tools",
          dot: "#f472b6",
          items: [flag("messages.showReasoning", "Show thinking blocks", "zap"), flag("messages.showTools", "Show tool badges", "zap"), edit("messages.showReasoning", "Customise details…", "message")],
        };
      if (hit(".chip"))
        return { title: "Suggested question", dot: "#34d399", items: [edit("behavior.suggestedQuestions", "Edit suggested questions…", "pen")] };
      if (hit(".atts") || hit(".pa"))
        return { title: "Attachments", dot: "#fb923c", items: [edit("composer.uploads", "Upload settings…", "pen"), steps("composer.maxFiles", "Files per message", [1, 2, 4, 6, 10]), steps("composer.maxSizeMB", "Max size", [2, 5, 8, 12, 20], " MB")] };
      if (hit(".composer"))
        return {
          title: "Message input",
          dot: "#fb923c",
          items: [
            edit("composer.style", "Customise input…", "pen"),
            radio("composer.style", "Shape"),
            radio("composer.sendIcon", "Send icon"),
            radio("composer.sendStyle", "Send button"),
            SEP,
            flag("composer.uploads", "Allow attachments", "pen"),
            { ...radio("composer.attachPlacement", "Attach button"), disabled: !schema.composer.uploads },
            flag("composer.sendOnEnter", "Enter sends"),
            flag("composer.showHint", "Show keyboard hint"),
          ],
        };
      if (hit("header") || hit(".fbar"))
        return {
          title: "Header",
          dot: "#facc15",
          items: [
            edit("persona.name", "Edit assistant persona…", "user"),
            radio("panel.headerStyle", "Header style", "palette"),
            flag("panel.showHeader", "Show header"),
            flag("persona.showStatus", "Online status dot"),
            flag("behavior.persistChat", "Remember conversation"),
            radio("behavior.clearButton", "Clear-chat button", "trash"),
          ],
        };
      if (hit(".brand"))
        return { title: "Branding", dot: "#94a3b8", items: [flag("panel.showBranding", "Show “Powered by” line")] };
      return {
        title: "Chat window",
        dot: "#818cf8",
        items: [
          edit("panel.bg", "Customise window…", "window"),
          radio("presentation.mode", "Presentation", "layout"),
          radio("theme.mode", "Appearance", "sun"),
          flag("theme.splitColors", "Separate light & dark colours"),
          flag("theme.glass", "Glass effect"),
          radio("theme.shadow", "Shadow"),
          steps("panel.width", "Width", [340, 380, 420, 480], "px"),
          SEP,
          { label: "Load sample conversation", icon: "chat2", kbd: "E", run: demoChat },
          { label: "Clear conversation", icon: "trash", kbd: "R", run: resetChat },
        ],
      };
    }

    const navBtn = hit("nav button[data-id]") as HTMLElement | undefined;
    if (navBtn) {
      const id = navBtn.dataset.id!;
      return {
        title: secTitle(id),
        dot: "var(--ac)",
        items: [
          { label: "Open section", icon: SECTION_ICON[id] || "sliders", run: () => goSection(id) },
          SEP,
          { label: "Reset section", icon: "reset", kbd: id === active ? fmt("alt+r") : undefined, disabled: id === "presets" || !sectionDirty(id), danger: true, run: () => resetSection(id) },
          { label: "Copy section settings", icon: "copy", run: () => copySection(id) },
          { label: "Paste section settings", icon: "clipboard", disabled: id === "presets", run: () => pasteSection(id) },
        ],
      };
    }

    const fieldEl = hit(".field[data-path]") as HTMLElement | undefined;
    if (fieldEl) {
      const f = fieldDef(fieldEl.dataset.path!);
      if (f) {
        const def = get(DEFAULTS, f.path);
        const items: MenuItem[] = [
          { label: "Reset to default", icon: "reset", disabled: !customised(f), run: () => { set(schema, f.path, structuredClone(def)); if (f.path2) set(schema, f.path2, structuredClone(get(DEFAULTS, f.path2))); commit(f.path); renderBody(); } },
          SEP,
          { label: "Copy value", icon: "copy", run: () => copy(valueText(f.path), "Value copied") },
          { label: "Paste value", icon: "clipboard", disabled: f.type === "widths" || f.type === "icon", run: () => pasteValue(f) },
          { label: "Copy setting path", icon: "code", run: () => copy(f.path, `Copied “${f.path}”`) },
        ];
        if (f.type === "color") {
          items.push(SEP, { label: "Use brand colour", icon: "palette", run: () => setPath(f.path, schema.theme.primaryColor) });
          if (f.optional) items.push({ label: "Clear (automatic)", icon: "x", disabled: !get(schema, f.path), run: () => setPath(f.path, "") });
        }
        if (f.type === "range") {
          const mn = f.min ?? 0, mx = f.max ?? 100;
          items.push(SEP, { label: "Set to minimum", icon: "up", run: () => setPath(f.path, mn) }, { label: "Set to maximum", icon: "up", run: () => setPath(f.path, mx) });
        }
        return { title: f.label, dot: "var(--ac)", items };
      }
    }

    if (hit(".gxs-panel"))
      return {
        title: secTitle(active),
        dot: "var(--ac)",
        items: [
          { label: "Search settings", icon: "search", kbd: "/", run: focusSearch },
          SEP,
          { label: "Reset this section", icon: "reset", kbd: fmt("alt+r"), danger: true, disabled: active === "presets" || !sectionDirty(active), run: () => resetSection(active) },
          { label: "Copy section settings", icon: "copy", run: () => copySection(active) },
          { label: "Paste section settings", icon: "clipboard", disabled: active === "presets", run: () => pasteSection(active) },
        ],
      };

    if (hit(".gxs-top"))
      return {
        title: "Studio",
        dot: "var(--ac)",
        items: [
          { label: "Publish changes", icon: "up", kbd: fmt("mod+s"), disabled: connected && !dirty(), run: () => publish() },
          { label: "Undo", icon: "undo", kbd: fmt("mod+z"), disabled: hi === 0, run: () => goto(hi - 1) },
          { label: "Redo", icon: "redo", kbd: fmt("mod+shift+z"), disabled: hi >= hist.length - 1, run: () => goto(hi + 1) },
          { label: "Discard unpublished changes", icon: "x", danger: true, disabled: !dirty(), run: () => ($("revert") as HTMLButtonElement).click() },
          SEP,
          { label: "Copy schema JSON", icon: "copy", kbd: fmt("alt+c"), run: () => copy(JSON.stringify(schema, null, 2), "Schema JSON copied") },
          { label: "Export .json", icon: "download", kbd: fmt("alt+e"), run: () => (download(`copilot-${pid || "design"}.json`, JSON.stringify(schema, null, 2)), toast("Exported")) },
          { label: "Import schema…", icon: "upload", kbd: fmt("alt+i"), run: doImport },
          { label: "Reset everything", icon: "reset", kbd: fmt("alt+shift+r"), danger: true, run: () => resetAll() },
        ],
      };

    return { title: "Preview stage", dot: "#818cf8", items: stageItems() };
  }

  function onContext(e: MouseEvent) {
    if (e.shiftKey) return; // Shift + right-click = the browser's own menu
    const first = e.composedPath()[0] as HTMLElement | undefined;
    const inWidget = e.composedPath().includes(el);
    // keep native cut/copy/paste inside the Studio's own text inputs
    if (!inWidget && first && /^(INPUT|TEXTAREA)$/.test(first.tagName) && (first as HTMLInputElement).type !== "range" && (first as HTMLInputElement).type !== "color" && (first as HTMLInputElement).type !== "checkbox") return;
    if (app.querySelector(".ov")) return;
    e.preventDefault();
    const a = areaFor(e);
    showMenu(e.clientX, e.clientY, [...a.items, ...common()], { title: a.title, dot: a.dot, ico, host: app });
  }

  /* ───────── wiring ───────── */
  $("proj").textContent =
    opts.projectName || (connected ? pid || "connected" : "offline demo");
  $("livel").style.display = hasLive ? "" : "none";
  $("live").onclick = () => {
    live = !live;
    el.transport = live ? undefined : mock;
    apply();
    toast(
      live
        ? "Preview now talks to your real AI"
        : "Preview uses sample replies",
    );
  };
  app.querySelectorAll<HTMLElement>("#dev button").forEach(
    (b) =>
      (b.onclick = () => {
        device = b.dataset.v as any;
        apply();
      }),
  );
  app.querySelectorAll<HTMLElement>("#bgs button").forEach(
    (b) =>
      (b.onclick = () => {
        bg = b.dataset.v as any;
        apply();
      }),
  );
  const siteIn = $("site") as HTMLInputElement;
  siteIn.value = site;
  siteIn.onchange = () => {
    site = siteIn.value.trim();
    if (site && !/^https?:\/\//.test(site)) site = "https://" + site;
    siteIn.value = site;
    ($("frame") as HTMLIFrameElement).src = site;
    if (site) bg = "site";
    apply();
  };
  if (site) ($("frame") as HTMLIFrameElement).src = site;
  el.addEventListener("gx-toggle", () =>
    app
      .querySelectorAll<HTMLElement>("#win button")
      .forEach((b) =>
        b.classList.toggle("on", (b.dataset.v === "open") === el.opened),
      ),
  );
  app
    .querySelectorAll<HTMLElement>("#win button")
    .forEach(
      (b) =>
        (b.onclick = () => (b.dataset.v === "open" ? el.open() : el.close())),
    );
  $("undo").onclick = () => hi > 0 && goto(hi - 1);
  $("redo").onclick = () => hi < hist.length - 1 && goto(hi + 1);
  $("revert").onclick = async () => {
    if (
      !(await ask(
        "Discard changes?",
        "Your design returns to the last published version.",
        "Discard",
        true,
      ))
    )
      return;
    schema = JSON.parse(published);
    commit("revert");
    renderCtl();
  };
  $("cmdk").onclick = palette;
  $("keys").onclick = showShortcuts;
  $("focus").onclick = toggleFocus;
  $("ptoast").onclick = previewToast;
  $("pdemo").onclick = demoChat;
  app.addEventListener("contextmenu", onContext);
  app.addEventListener("pointerdown", () => unlockAudio(), { once: true });
  const ro = new ResizeObserver(() => {
    stageW = Math.round(stage.clientWidth);
    stageH = Math.round(stage.clientHeight);
    updateStatus();
  });
  ro.observe(stage);
  $("pub").onclick = publish;
  if (opts.onClose) {
    const c = $("close");
    c.style.display = "";
    c.onclick = async () => {
      if (
        !dirty() ||
        (await ask(
          "Close without publishing?",
          "You have unpublished changes that will be lost.",
          "Close anyway",
          true,
        ))
      )
        opts.onClose!();
    };
  }
  const keys = (e: KeyboardEvent) => {
    // composedPath()[0] is the real origin, even for events coming out of the preview widget's shadow DOM
    const t = e.composedPath()[0] as HTMLElement | undefined;
    const typing = !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
    const overlay = !!app.querySelector(".ov");
    if (app.querySelector(".cmenu")) return; // an open menu owns the keyboard (it handles Esc, arrows, Enter itself)
    if (e.key === "Escape") {
      if (overlay) app.querySelector(".ov")!.remove();
      return;
    }
    // digits 1-9 / 0 jump straight to a section
    if (!typing && !overlay && !e.ctrlKey && !e.metaKey && !e.altKey && /^(Digit|Numpad)\d$/.test(e.code)) {
      const d = +e.code.slice(-1);
      const ids = navIds();
      const id = d === 0 ? ids[ids.length - 1] : ids[d - 1];
      if (id) {
        e.preventDefault();
        goSection(id);
      }
      return;
    }
    for (const sc of SHORTCUTS) {
      if (sc.id === "jump" || !match(e, sc.keys)) continue;
      const single = isSingle(sc.keys);
      if (single && (typing || overlay)) continue;
      if ((sc.id === "undo" || sc.id === "redo" || sc.id === "redo2") && typing) continue; // keep native text undo
      if (overlay && !single && sc.id !== "palette" && sc.id !== "publish") continue;
      e.preventDefault();
      sc.run();
      return;
    }
  };
  const warn = (e: BeforeUnloadEvent) => {
    if (dirty()) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  document.addEventListener("keydown", keys);
  addEventListener("beforeunload", warn);

  applyTheme();
  renderNav();
  renderCtl();
  apply();
  el.open();
  if (connected) load();
  return () => {
    mo.disconnect();
    ro.disconnect();
    closeMenu();
    app.removeEventListener("contextmenu", onContext);
    document.removeEventListener("keydown", keys);
    removeEventListener("beforeunload", warn);
    el.remove();
    root.innerHTML = "";
  };
}
