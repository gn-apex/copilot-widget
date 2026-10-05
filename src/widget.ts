// src/widget.ts — the embeddable chat widget (custom element, shadow DOM).

import { resolve, fromServer, type WidgetSchema } from "./schema";
import { CSS } from "./styles";
import { renderMarkdown } from "./markdown";
import { playSound, unlockAudio } from "./sounds";
import { detectHostScheme, watchHostScheme, type Scheme } from "./hosttheme";
import { processFile, isAllowed, acceptAttr, describeAccept, humanSize, lightweight, type Attachment } from "./files";

export type { Attachment } from "./files";

const ICONS: Record<string, string> = {
  chat: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13a7 7 0 0 1 7 7.5Z"/>',
  sparkles:
    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.7M12 17h.01"/>',
  message: '<path d="M4 6h16v10H8l-4 3V6z"/>',
  wave: '<path d="M4 14c2-4 4-6 6-6s3 3 5 3 4-3 5-5"/><path d="M4 18c2-3 4-5 6-5s3 2 5 2 4-2 5-4"/>',
};
const svg = (p: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const P = {
  x: "M18 6 6 18M6 6l12 12",
  paperclip: "m21.4 11.6-9.2 9.2a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5",
  plus: "M12 5v14M5 12h14",
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.8"/><path d="m21 15-4.5-4.5L6 21"/>',
  arrow: "M12 19V5M5 12l7-7 7 7",
  plane: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  chevron: "m9 6 6 6-6 6",
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/>',
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6",
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  down: "M12 5v14M5 12l7 7 7-7",
  refresh: "M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: "M20 6 9 17l-5-5",
  chevDown: "m6 9 6 6 6-6",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  run: "M21 12a9 9 0 1 1-6.219-8.56",
  nav: "M7 17L17 7M7 7h10v10",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h.01",
};
const ic = (k: keyof typeof P) => svg(P[k].startsWith("<") ? P[k] : `<path d="${P[k]}"/>`);

export type SuggestedAction = { label: string; action_type: string; payload: string };
export type ReasoningBlock = {
  label: string;
  reason?: string;
  text: string;
  isActive: boolean;
  startedAt: number;
  endedAt?: number;
  open?: boolean;
};
export type ToolBlock = {
  tool: string;
  label: string;
  args: Record<string, unknown>;
  status: "running" | "done" | "error";
  startedAt: number;
  endedAt?: number;
  result?: unknown;
};
export type ConfirmationBlock = { payload: Record<string, unknown>; status: "pending" | "confirmed" | "declined" };

export type Msg = {
  role: "user" | "assistant";
  content: string;
  t?: number;
  error?: boolean;
  reasoning?: ReasoningBlock;
  tools?: ToolBlock[];
  actions?: SuggestedAction[];
  confirmation?: ConfirmationBlock;
  attachments?: Attachment[];
};

/** What a custom transport receives. `attachments[].data` is base64 (no data: prefix). */
export type Transport = (messages: Msg[]) => Promise<string>;

const CSS_ESC = (u: string) => (/^https?:\/\//i.test(u) ? u.replace(/"/g, "%22") : "");
const safeNav = (u: string) => /^(https?:\/\/|\/|#|mailto:|tel:)/i.test((u || "").trim());

function onColor(hex: string, light = "#ffffff", dark = "#0a0a0a"): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  if (!Number.isFinite(n)) return light;
  const ch = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
  return (1.05 / (L + 0.05)) * 1.35 >= (L + 0.05) / 0.05 ? light : dark;
}

const setVar = (el: HTMLElement, k: string, v?: string) => (v ? el.style.setProperty(k, v) : el.style.removeProperty(k));

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function effectiveMode(cfg: WidgetSchema, compact: boolean): string {
  const m = cfg.presentation.mobileMode;
  if (!compact || m === "auto") {
    if (compact) {
      const desk = cfg.presentation.mode;
      if (desk === "panel" || desk === "popover") return "sheet";
      if (desk === "dialog") return "fullscreen";
      return desk;
    }
    return cfg.presentation.mode;
  }
  return m;
}

/** Rich contextual metadata from the visitor's active page (sent with each chat request). */
function extractLivePageContext() {
  if (typeof window === "undefined" || !document) return undefined;
  const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
    .map((e) => (e.textContent || "").trim())
    .filter((t) => t.length > 2 && t.length < 120)
    .slice(0, 8);
  const metaDesc =
    document.querySelector('meta[name="description"]')?.getAttribute("content") ||
    document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
    "";
  let structuredData: any = null;
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld && ld.textContent) {
    try {
      const parsed = JSON.parse(ld.textContent);
      if (["Product", "Article", "Organization"].includes(parsed["@type"])) {
        structuredData = {
          type: parsed["@type"],
          name: parsed.name || parsed.headline,
          description: parsed.description,
          price: parsed.offers?.price || parsed.offers?.lowPrice,
          currency: parsed.offers?.priceCurrency,
          availability: parsed.offers?.availability,
        };
      }
    } catch {
      /* invalid JSON-LD */
    }
  }
  const selectedText = window.getSelection()?.toString().trim().slice(0, 500) || "";
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    title: document.title,
    metaDescription: metaDesc.slice(0, 300),
    headings,
    structuredData,
    selectedText: selectedText || undefined,
  };
}

async function copyText(text: string, within: HTMLElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const t = document.createElement("textarea");
      t.value = text;
      t.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      within.appendChild(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const FOCUSABLE = 'button:not([hidden]):not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const isTouch = () => matchMedia("(pointer:coarse)").matches;

export class GxCopilot extends HTMLElement {
  cfg: WidgetSchema = resolve({});
  transport?: Transport;
  projectId = "";
  apiUrl = "";
  /** Studio sets this: no auto-open / auto-toasts, no persistence. */
  previewMode = false;
  /** Studio sets this to simulate the host website's theme when theme.mode = "auto". */
  simulateHost: Scheme | null = null;

  private msgs: Msg[] = [];
  private pending: Attachment[] = [];
  private busyFiles = 0;
  private busy = false;
  private built = false;
  private compact = false;
  private openedOnce = false;
  private mode = "panel";
  private hostScheme: Scheme = "light";
  private unwatch?: () => void;
  private mq?: MediaQueryList;
  private mqFn?: () => void;
  private $!: (s: string) => HTMLElement;
  private styleEl!: HTMLStyleElement;
  private autoTimer?: number;
  private autoScheduled = false;
  private toastTimer?: number;
  private toastEl?: HTMLElement;
  private toastShown = 0;
  private toastHideT?: number;
  private engaged = false;
  private onWinKey?: (e: KeyboardEvent) => void;
  private onResize?: () => void;
  private onDoc?: (e: PointerEvent) => void;
  private raf = 0;
  private renderRaf = 0;
  private pendingReason?: string;
  private abort?: AbortController;
  private cache = new Map<Msg, { sig: string; el: HTMLElement }>();
  private cfgSig = "";
  private hydrated = false;
  private typingEl?: HTMLElement;
  private stick = true;
  private noticeT?: number;
  private unread = 0;
  private dragDepth = 0;

  private get ta() {
    return this.$("inp") as HTMLTextAreaElement;
  }

  async connectedCallback() {
    this.projectId = this.getAttribute("data-project-id") || "";
    this.apiUrl = (this.getAttribute("data-api-url") || location.origin).replace(/\/$/, "");
    if (!this.projectId || this.built) return;
    const raw = await this.fetchConfigResilient();
    if (!raw || raw.enabled === false) return;
    this.setConfig(fromServer(raw));
  }

  private async fetchConfigResilient(): Promise<any | null> {
    const url = `${this.apiUrl}/copilot/${this.projectId}/config`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        try {
          localStorage.setItem(this.cacheKey(), JSON.stringify(json));
        } catch {}
        return json;
      } catch {
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
      }
    }
    try {
      const cached = localStorage.getItem(this.cacheKey());
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  }

  private cacheKey() {
    return `gx:cfg:${this.projectId}`;
  }

  disconnectedCallback() {
    if (this.onWinKey) {
      removeEventListener("keydown", this.onWinKey, true);
      removeEventListener("keypress", this.onWinKey, true);
      removeEventListener("keyup", this.onWinKey, true);
    }
    if (this.onResize) removeEventListener("resize", this.onResize);
    if (this.onDoc) document.removeEventListener("pointerdown", this.onDoc, true);
    this.unwatch?.();
    if (this.mq && this.mqFn) this.mq.removeEventListener?.("change", this.mqFn);
    clearTimeout(this.autoTimer);
    clearTimeout(this.toastTimer);
    clearTimeout(this.toastHideT);
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.renderRaf);
    this.abort?.abort();
  }

  setConfig(input: unknown) {
    this.cfg = resolve(input);
    if (!this.built) this.build();
    this.apply();
    this.scheduleAutomation();
  }

  /* ───────────────────────── build ───────────────────────── */
  private build() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${CSS}</style><style id="custom"></style>
      <div class="gx">
        <div class="backdrop" id="backdrop"></div>
        <section class="panel" role="dialog" aria-label="Chat" id="panel">
          <div class="busybar" id="busybar" aria-hidden="true"></div>
          <div class="fbar" id="fbar" hidden>
            <button class="x danger" id="fclear" type="button" aria-label="Clear conversation" title="Clear conversation">${ic("trash")}</button>
            <button class="x" id="fx" type="button" aria-label="Close">${ic("x")}</button>
          </div>
          <header id="hdr">
            <div class="avwrap"><div id="av"></div><i class="sdot" id="sdot"></i></div>
            <div class="title"><div class="name" id="name"></div><div class="sub" id="sub"></div></div>
            <div class="hact">
              <button class="x danger" id="clear" type="button" aria-label="Clear conversation" title="Clear conversation">${ic("trash")}</button>
              <button class="x" id="close" type="button" aria-label="Close">${ic("x")}</button>
            </div>
          </header>
          <div class="msgwrap">
            <div class="msgs" id="msgs" role="log" aria-live="polite"></div>
            <button class="tobottom" id="tobottom" type="button" aria-label="Scroll to latest">${ic("down")}</button>
          </div>
          <div class="chips" id="chips"></div>
          <div class="notice" id="notice" role="status" hidden></div>
          <div class="composer" id="composer">
            <div class="cwrap">
              <button class="attach" id="attach-out" type="button" hidden></button>
              <div class="cbox">
                <div class="atts" id="atts" hidden></div>
                <div class="crow">
                  <button class="attach" id="attach-in" type="button"></button>
                  <textarea id="inp" rows="1" aria-label="Message" enterkeyhint="send"></textarea>
                  <button class="send" id="send" type="button" aria-label="Send message"></button>
                </div>
              </div>
            </div>
            <div class="cfoot" id="cfoot"></div>
            <input type="file" id="file" multiple hidden>
          </div>
          <div class="brand" id="brand">POWERED BY GN•APEX</div>
          <div class="dropzone" id="drop"><div>${ic("upload")}<b>Drop to attach</b><span id="dropsub"></span></div></div>
        </section>
        <div class="toasts" id="toasts" aria-live="polite"></div>
        <button class="launcher" id="launch" type="button" aria-label="Open chat" aria-expanded="false">
          <span class="ico"><span class="i-main" id="imain"></span><svg class="i-close" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></span>
          <span class="lbl" id="llbl" hidden></span>
          <span class="badge" aria-hidden="true"></span>
        </button>
      </div>`;
    this.$ = (s) => root.getElementById(s) as HTMLElement;
    this.styleEl = this.$("custom") as HTMLStyleElement;

    this.$("launch").onclick = () => this.toggle();
    this.$("close").onclick = () => this.close();
    this.$("fx").onclick = () => this.close();
    this.$("clear").onclick = () => this.confirmClear();
    this.$("fclear").onclick = () => this.confirmClear();
    this.$("send").onclick = () => (this.busy ? this.stop() : this.send());
    this.$("backdrop").onclick = () => {
      if (this.cfg.presentation.closeOnOutside) this.close();
    };
    for (const id of ["attach-in", "attach-out"]) this.$(id).onclick = () => (this.$("file") as HTMLInputElement).click();
    (this.$("file") as HTMLInputElement).onchange = (e) => {
      const f = (e.target as HTMLInputElement).files;
      if (f?.length) this.addFiles(Array.from(f));
      (e.target as HTMLInputElement).value = "";
    };

    // ── textarea
    const ta = this.ta;
    ta.oninput = () => {
      this.fitTextarea();
      this.syncComposer();
    };
    ta.onpaste = (e) => {
      const files = Array.from(e.clipboardData?.files || []);
      if (files.length && this.cfg.composer.uploads) {
        e.preventDefault();
        this.addFiles(files);
      }
    };

    // Keyboard. Visitors' sites often have global hotkeys (or a modal/carousel) that swallow Space and other keys.
    // This runs in the capture phase on window, before the page's own bubble listeners, and also repairs the
    // character if something earlier already cancelled it.
    this.onWinKey = (e: KeyboardEvent) => {
      const inField = e.composedPath()[0] === ta;
      if (e.type === "keydown") {
        if (inField) {
          if (e.defaultPrevented && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing) {
            ta.setRangeText(e.key, ta.selectionStart, ta.selectionEnd, "end");
            ta.dispatchEvent(new Event("input", { bubbles: true }));
          }
          this.onTextKey(e);
        } else if (this.isOpen()) {
          if (e.key === "Escape") this.onEscape(e);
          this.trapFocus(e);
        }
      }
      if (inField) e.stopImmediatePropagation();
    };
    for (const t of ["keydown", "keypress", "keyup"]) addEventListener(t, this.onWinKey as EventListener, true);

    this.$("chips").onclick = (e) => {
      const c = (e.target as HTMLElement).closest(".chip");
      if (c) this.send(c.textContent || "");
    };

    this.onDoc = (e: PointerEvent) => {
      const p = this.cfg.presentation;
      if (!this.isOpen() || !p.closeOnOutside || p.backdrop) return;
      if (!e.composedPath().includes(this)) this.close();
    };
    document.addEventListener("pointerdown", this.onDoc, true);

    this.onResize = () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.apply();
      });
    };
    addEventListener("resize", this.onResize);

    // ── theme sources
    this.hostScheme = detectHostScheme();
    this.unwatch = watchHostScheme((s) => {
      this.hostScheme = s;
      if (this.cfg.theme.mode === "auto" && !this.simulateHost) this.applyLook();
    });
    this.mq = matchMedia("(prefers-color-scheme: dark)");
    this.mqFn = () => this.cfg.theme.mode === "system" && this.applyLook();
    this.mq.addEventListener?.("change", this.mqFn);

    // ── transcript interactions (delegated)
    const msgs = this.$("msgs");
    msgs.addEventListener("click", async (e) => {
      const t = e.target as HTMLElement;
      const copyBtn = t.closest(".code-copy") as HTMLButtonElement | null;
      if (copyBtn) {
        const code = copyBtn.closest(".code-block")?.querySelector("pre code");
        if (code && (await copyText(code.textContent || "", this.$("panel")))) this.flash(copyBtn, "Copied");
        return;
      }
      const wrapBtn = t.closest(".code-wrap") as HTMLElement | null;
      if (wrapBtn) {
        const on = wrapBtn.closest(".code-block")!.toggleAttribute("data-wrap");
        wrapBtn.toggleAttribute("data-on", on);
        return;
      }
      const img = t.closest("img.md-img") as HTMLImageElement | null;
      if (img) this.lightbox(img.src);
    });
    msgs.addEventListener("scroll", () => {
      const away = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
      this.stick = away < 70;
      this.$("tobottom").toggleAttribute("data-show", away > 140);
    });
    this.$("tobottom").onclick = () => this.scrollBottom(true);

    // ── drag & drop anywhere on the panel
    const panel = this.$("panel");
    const hasFiles = (e: DragEvent) => !!e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");
    const gx = root.querySelector(".gx") as HTMLElement;
    panel.addEventListener("dragenter", (e) => {
      if (!this.cfg.composer.uploads || !this.cfg.composer.dragDrop || !hasFiles(e)) return;
      e.preventDefault();
      this.dragDepth++;
      gx.toggleAttribute("data-drag", true);
    });
    panel.addEventListener("dragover", (e) => {
      if (hasFiles(e) && this.cfg.composer.dragDrop) e.preventDefault();
    });
    panel.addEventListener("dragleave", () => {
      this.dragDepth = Math.max(0, this.dragDepth - 1);
      if (!this.dragDepth) gx.toggleAttribute("data-drag", false);
    });
    panel.addEventListener("drop", (e) => {
      this.dragDepth = 0;
      gx.toggleAttribute("data-drag", false);
      if (!this.cfg.composer.uploads || !this.cfg.composer.dragDrop || !hasFiles(e)) return;
      e.preventDefault();
      this.addFiles(Array.from(e.dataTransfer!.files));
    });
    panel.addEventListener("pointerdown", () => unlockAudio(), { once: true });

    this.loadChat();
    this.built = true;
  }

  /* ───────────────────────── keyboard ───────────────────────── */
  private onEscape(e: KeyboardEvent) {
    const panel = this.$("panel");
    const top = panel.querySelector(".lightbox, .veil") as HTMLElement | null;
    if (top) {
      top.remove();
      e.preventDefault();
      return;
    }
    if (this.cfg.presentation.closeOnEscape) this.close();
  }

  private onTextKey(e: KeyboardEvent) {
    if (e.key === "Escape") return this.onEscape(e);
    if (e.key === "Tab") return this.trapFocus(e);
    if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
    const mod = e.ctrlKey || e.metaKey;
    const wantsSend = this.cfg.composer.sendOnEnter ? !e.shiftKey && !e.altKey : mod;
    if (wantsSend) {
      e.preventDefault();
      if (!this.busy) this.send();
    }
  }

  private trapFocus(e: KeyboardEvent) {
    if (e.key !== "Tab" || !this.isOpen() || !this.cfg.presentation.backdrop) return;
    const list = Array.from(this.$("panel").querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => !x.hasAttribute("hidden") && x.offsetParent !== null);
    if (!list.length) return;
    const first = list[0],
      last = list[list.length - 1];
    const active = this.shadowRoot!.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !list.includes(active!))) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ───────────────────────── theme & config → DOM ───────────────────────── */
  private isDark(): boolean {
    const m = this.cfg.theme.mode;
    if (m === "dark") return true;
    if (m === "light") return false;
    if (m === "system") return matchMedia("(prefers-color-scheme: dark)").matches;
    return (this.simulateHost || this.hostScheme) === "dark";
  }

  private apply() {
    const c = this.cfg;
    const gx = this.shadowRoot!.querySelector(".gx") as HTMLElement;
    this.mode = effectiveMode(c, this.compact || window.innerWidth <= 480);

    const s = this.style;
    s.setProperty("--gx-primary", c.theme.primaryColor);
    s.setProperty("--gx-accent", c.theme.accentColor);
    s.setProperty("--gx-radius", c.theme.radius + "px");
    s.setProperty("--gx-font", c.theme.font);
    s.setProperty("--gx-size", c.launcher.size + "px");
    s.setProperty("--gx-ox", c.launcher.offsetX + "px");
    s.setProperty("--gx-oy", c.launcher.offsetY + "px");
    s.setProperty("--gx-w", c.panel.width + "px");
    s.setProperty("--gx-h", c.panel.height + "px");
    s.setProperty("--gx-bw", c.panel.borderWidth + "px");

    const L = c.launcher;
    s.setProperty("--gx-icon", Math.min(L.iconSize, L.size - 4) + "px");
    s.setProperty("--gx-lpad", L.padding + "px");
    s.setProperty("--gx-lsize", L.labelSize + "px");
    const lr = L.shape === "pill" || L.shape === "circle" ? "999px" : L.shape === "square" ? Math.round(L.size * 0.22) + "px" : Math.round(L.size * 0.32) + "px";
    s.setProperty("--gx-launcher-radius", lr);
    const lbase = L.bg || c.theme.primaryColor;
    s.setProperty("--gx-l-base", lbase);
    s.setProperty("--gx-l-bg", L.gradient ? `linear-gradient(145deg,${lbase},color-mix(in srgb,${lbase} 68%,#000))` : lbase);
    s.setProperty("--gx-l-fg", L.color || onColor(lbase));
    s.setProperty("--gx-on-primary", onColor(c.theme.primaryColor));

    const M = c.messages;
    s.setProperty("--gx-fs", M.fontSize + "px");
    s.setProperty("--gx-lh", String(M.lineHeight));
    s.setProperty("--gx-umw", M.userMaxWidth + "%");
    s.setProperty("--gx-amw", M.aiMaxWidth + "%");
    s.setProperty("--gx-gap", M.gap + "px");
    s.setProperty("--gx-py", M.padding + "px");
    s.setProperty("--gx-rows", String(c.composer.maxRows));

    gx.dataset.pos = L.position;
    gx.dataset.pres = this.mode;
    gx.dataset.side = c.presentation.drawerSide;
    gx.dataset.anim = c.presentation.animation;
    gx.dataset.density = c.theme.density;
    gx.dataset.shadow = c.theme.shadow;
    gx.dataset.header = c.panel.headerStyle;
    gx.dataset.bubble = M.bubbleStyle;
    gx.dataset.align = M.userAlign;
    gx.dataset.aistyle = M.aiStyle;
    gx.dataset.manim = M.animate;
    gx.dataset.actions = M.showActions;
    gx.dataset.code = M.codeTheme;
    gx.toggleAttribute("data-avatar", M.showAvatar);
    gx.toggleAttribute("data-glass", c.theme.glass && c.panel.bgType === "solid");
    gx.toggleAttribute("data-backdrop-blur", c.presentation.backdropBlur);
    gx.toggleAttribute("data-no-backdrop", !c.presentation.backdrop);
    gx.toggleAttribute("data-ai-border", M.aiBorder);

    const launch = this.$("launch");
    launch.hidden = !L.show;
    launch.dataset.shape = L.shape;
    launch.dataset.lpos = L.labelPosition;
    launch.dataset.lmode = L.labelMode;
    launch.toggleAttribute("data-label", !!L.label);
    launch.toggleAttribute("data-glow", L.glow);
    launch.toggleAttribute("data-pulse", L.pulse && !this.openedOnce);
    const cu = L.icon === "custom" ? CSS_ESC(L.customIconUrl) : "";
    this.$("imain").innerHTML = cu ? `<img alt="" src="${cu}">` : `<svg viewBox="0 0 24 24">${ICONS[L.icon] || ICONS.chat}</svg>`;
    const lbl = this.$("llbl");
    lbl.hidden = !L.label;
    lbl.textContent = L.label;

    // persona
    this.$("name").textContent = c.persona.name;
    this.$("sub").textContent = c.persona.subtitle;
    const av = this.$("av");
    av.replaceChildren();
    if (c.persona.avatarUrl && CSS_ESC(c.persona.avatarUrl)) {
      const im = el("img", "avatar");
      im.alt = "";
      im.src = CSS_ESC(c.persona.avatarUrl);
      av.append(im);
    } else av.append(el("div", "avatar"));
    this.$("sdot").hidden = !c.persona.showStatus;
    this.$("brand").hidden = !c.panel.showBranding;
    this.$("hdr").hidden = !c.panel.showHeader;
    this.$("fbar").hidden = c.panel.showHeader;
    this.$("panel").setAttribute("aria-label", c.persona.name ? `Chat with ${c.persona.name}` : "Chat");

    // composer
    const cp = c.composer;
    const comp = this.$("composer");
    comp.dataset.cs = cp.style;
    const icon = { paperclip: ic("paperclip"), plus: ic("plus"), image: ic("image") }[cp.attachIcon];
    this.$("attach-in").innerHTML = icon;
    this.$("attach-out").innerHTML = icon;
    for (const id of ["attach-in", "attach-out"]) this.$(id).setAttribute("aria-label", "Attach files");
    const showAtt = cp.uploads;
    this.$("attach-in").hidden = !(showAtt && cp.attachPlacement === "inside");
    this.$("attach-out").hidden = !(showAtt && cp.attachPlacement === "outside");
    (this.$("file") as HTMLInputElement).accept = acceptAttr(cp.accept);
    this.$("dropsub").textContent = describeAccept(cp.accept);
    this.$("send").dataset.ss = cp.sendStyle;
    this.ta.placeholder = c.behavior.placeholder;
    this.ta.maxLength = cp.maxChars > 0 ? cp.maxChars + 400 : -1; // soft limit: counter turns red, send is blocked
    this.ta.autofocus = cp.autofocus;
    this.renderAttachments();
    this.fitTextarea();
    this.syncComposer();

    // transcript
    if (!c.behavior.persistChat) this.clearStored();
    if (!this.msgs.some((m) => m.role === "user")) {
      this.msgs = [{ role: "assistant", content: c.persona.greeting, t: this.msgs[0]?.t || Date.now() }];
    }
    const sig = [M.showAvatar, M.showSender, M.showActions, M.showReasoning, M.showTools, M.showTimestamps, M.aiStyle, c.persona.avatarUrl, c.persona.name, c.messages.userAlign].join("|");
    if (sig !== this.cfgSig) {
      this.cfgSig = sig;
      this.cache.clear();
    }
    this.applyLook();
    this.renderMsgs();
    this.renderChips();
    this.updateClearButtons();

    this.styleEl.textContent = c.customCss.replace(/@import[^;]*;?/gi, "").replace(/url\s*\(/gi, "(").replace(/expression\s*\(/gi, "(");
    this.syncOpen();
  }

  /** Everything that depends on light vs dark. Cheap; called when the host's theme flips. */
  private applyLook() {
    const c = this.cfg;
    const gx = this.shadowRoot!.querySelector(".gx") as HTMLElement;
    const dark = this.isDark();
    const split = c.theme.splitColors;
    const pk = (light: string, darkv: string) => (split && dark ? darkv : light);
    gx.dataset.mode = dark ? "dark" : "light";

    const P = c.panel;
    const bgV = pk(P.bg, P.bgDark);
    const bg2V = pk(P.bg2, P.bg2Dark);
    const base = bgV || (dark ? "#0a0a0a" : "#ffffff");
    const img = P.bgType === "image" ? CSS_ESC(P.bgImageUrl) : "";
    const custom = !!bgV || P.bgType === "gradient" || !!img;
    let panelBg = "";
    if (P.bgType === "gradient") {
      const end = bg2V || `color-mix(in srgb,${c.theme.primaryColor} 28%,${base})`;
      panelBg = `linear-gradient(${P.gradientAngle}deg,${base},${end})`;
    } else if (img) {
      const veil = `color-mix(in srgb,${base} ${P.bgImageDim}%,transparent)`;
      panelBg = `linear-gradient(${veil},${veil}),url("${img}") center/cover no-repeat`;
    }
    setVar(gx, "--bg", custom ? base : "");
    setVar(gx, "--gx-panel-bg", panelBg);
    setVar(gx, "--text", pk(P.textColor, P.textColorDark) || (custom ? onColor(base, "#fafafa", "#0a0a0a") : ""));
    setVar(gx, "--border", pk(P.borderColor, P.borderColorDark));
    const hb = pk(P.headerBg, P.headerBgDark);
    setVar(gx, "--gx-hdr-bg", hb);
    gx.toggleAttribute("data-hdr-custom", !!hb);
    setVar(gx, "--gx-hdr-fg", pk(P.headerText, P.headerTextDark) || (hb ? onColor(hb, "#fafafa", "#0a0a0a") : ""));
    setVar(gx, "--gx-composer-bg", pk(P.composerBg, P.composerBgDark));
    const ib = pk(P.inputBg, P.inputBgDark);
    setVar(gx, "--gx-input-bg", ib);
    setVar(gx, "--gx-input-fg", ib ? onColor(ib, "#fafafa", "#0a0a0a") : "");

    const M = c.messages;
    const ubg = pk(M.userBg, M.userBgDark);
    setVar(gx, "--gx-user-bg", ubg);
    setVar(gx, "--gx-user-fg", pk(M.userText, M.userTextDark) || onColor(ubg || c.theme.primaryColor));
    const abg = pk(M.aiBg, M.aiBgDark);
    setVar(gx, "--gx-ai-bg", abg);
    setVar(gx, "--gx-ai-fg", pk(M.aiText, M.aiTextDark) || (abg ? onColor(abg, "#fafafa", "#0a0a0a") : ""));
  }

  setCompact(on: boolean) {
    this.compact = on;
    this.shadowRoot?.querySelector(".gx")?.toggleAttribute("data-compact", on);
    if (this.built) this.apply();
  }

  /* ───────────────────────── open / close ───────────────────────── */
  get opened() {
    return this.built && this.isOpen();
  }

  private isOpen() {
    return this.shadowRoot?.querySelector(".panel")?.hasAttribute("data-open") ?? false;
  }

  private syncOpen() {
    const open = this.isOpen(),
      c = this.cfg,
      launch = this.$("launch");
    launch.toggleAttribute("data-open", open && c.launcher.closeIconWhenOpen);
    const covers = ["sheet", "fullscreen", "drawer"].includes(this.mode);
    const hide = open && (c.launcher.hideWhenOpen === "always" || (c.launcher.hideWhenOpen === "auto" && covers));
    launch.toggleAttribute("data-hide", hide);
    launch.setAttribute("aria-expanded", String(open));
    launch.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    this.$("panel").setAttribute("aria-modal", String(c.presentation.backdrop));
    this.dispatchEvent(new CustomEvent("gx-toggle", { detail: open }));
  }

  open() {
    if (!this.built) return;
    this.engaged = true;
    this.hideToast();
    this.$("panel").toggleAttribute("data-open", true);
    this.$("backdrop").toggleAttribute("data-open", true);
    this.openedOnce = true;
    this.$("launch").removeAttribute("data-pulse");
    this.unread = 0;
    this.$("launch").toggleAttribute("data-unread", false);
    this.syncOpen();
    this.scrollBottom();
    if (this.cfg.composer.autofocus && !isTouch()) this.ta.focus({ preventScroll: true });
  }

  close() {
    if (!this.built) return;
    this.$("panel").toggleAttribute("data-open", false);
    this.$("backdrop").toggleAttribute("data-open", false);
    this.syncOpen();
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  /* ───────────────────────── automation: auto-open + auto-toasts ───────────────────────── */
  private sget(k: string) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  }
  private sset(k: string, v: string) {
    try {
      sessionStorage.setItem(k, v);
    } catch {}
  }
  private sk(name: string) {
    return `gx:${name}:${this.projectId || "local"}`;
  }

  private scheduleAutomation() {
    clearTimeout(this.autoTimer);
    clearTimeout(this.toastTimer);
    this.hideToast(true);
    if (this.previewMode || this.engaged) return;
    const b = this.cfg.behavior;
    const phone = this.compact || window.innerWidth <= 480;

    if (b.autoOpenAfterSeconds > 0 && (!phone || b.autoOpenOnMobile) && !(b.autoOpenOncePerSession && this.sget(this.sk("ao")))) {
      this.autoTimer = window.setTimeout(() => {
        if (this.engaged || this.isOpen()) return;
        this.sset(this.sk("ao"), "1");
        this.open();
      }, b.autoOpenAfterSeconds * 1000);
    }
    this.armToast(this.cfg.toasts.delay * 1000);
  }

  private armToast(ms: number) {
    const T = this.cfg.toasts;
    const phone = this.compact || window.innerWidth <= 480;
    if (!T.enabled || !T.messages.length || (phone && !T.mobile)) return;
    if (this.toastShown >= T.maxShows) return;
    if (T.respectDismiss && this.sget(this.sk("td"))) return;
    const prior = parseInt(this.sget(this.sk("tc")) || "0", 10) || 0;
    if (prior >= T.maxShows) return;
    this.toastTimer = window.setTimeout(() => {
      if (!this.engaged && !this.isOpen()) this.showToast();
      if (T.repeatEvery > 0) this.armToast(T.repeatEvery * 1000);
    }, ms);
  }

  /** Show the configured toast right now (used by the Studio's “Preview toast”). */
  previewToast() {
    if (this.built) this.showToast(true);
  }

  private showToast(force = false) {
    const T = this.cfg.toasts;
    if (!T.messages.length) return;
    const idx = force ? 0 : this.toastShown % T.messages.length;
    this.hideToast(true);
    const box = this.$("toasts");
    const t = el("div", "toast");
    t.dataset.style = T.style;
    t.setAttribute("role", "status");
    const body = el("div", "tb");
    if (T.showName && T.style !== "pill") {
      const n = el("div", "tn");
      n.textContent = this.cfg.persona.name;
      body.append(n);
    }
    const tt = el("div", "tt");
    tt.textContent = T.messages[idx];
    body.append(tt);
    if (T.replies.length && T.style !== "pill") {
      const r = el("div", "tr");
      for (const q of T.replies) {
        const b = el("button");
        b.type = "button";
        b.textContent = q;
        b.onclick = (e) => {
          e.stopPropagation();
          this.hideToast();
          this.open();
          this.send(q);
        };
        r.append(b);
      }
      body.append(r);
    }
    if (T.showAvatar) {
      const url = CSS_ESC(this.cfg.persona.avatarUrl);
      const a = url ? el("img", "tav") : el("div", "tav");
      if (a instanceof HTMLImageElement) {
        a.alt = "";
        a.src = url;
      }
      t.append(a);
    }
    t.append(body);
    if (T.dismissible) {
      const x = el("button", "tx", ic("x"));
      x.type = "button";
      x.setAttribute("aria-label", "Dismiss");
      x.onclick = (e) => {
        e.stopPropagation();
        this.hideToast();
        if (T.respectDismiss && !force) this.sset(this.sk("td"), "1");
      };
      t.append(x);
    }
    if (T.duration > 0) {
      const p = el("i", "tp");
      p.style.setProperty("--td", T.duration + "s");
      if (T.pauseOnHover) p.setAttribute("data-pause", "");
      t.append(p);
      const arm = () => {
        clearTimeout(this.toastHideT);
        this.toastHideT = window.setTimeout(() => this.hideToast(), T.duration * 1000);
      };
      arm();
      if (T.pauseOnHover) {
        t.onmouseenter = () => clearTimeout(this.toastHideT);
        t.onmouseleave = () => {
          p.style.animation = "none";
          void p.offsetWidth;
          p.style.animation = "";
          arm();
        };
      }
    }
    t.onclick = () => {
      this.hideToast();
      this.open();
    };
    box.append(t);
    this.toastEl = t;
    if (!force) {
      this.toastShown++;
      this.sset(this.sk("tc"), String((parseInt(this.sget(this.sk("tc")) || "0", 10) || 0) + 1));
    }
    if (T.sound) playSound(T.soundName, this.cfg.behavior.soundVolume / 100);
  }

  private hideToast(now = false) {
    clearTimeout(this.toastHideT);
    const t = this.toastEl;
    if (!t) return;
    this.toastEl = undefined;
    if (now) return t.remove();
    t.classList.add("out");
    setTimeout(() => t.remove(), 260);
  }

  /* ───────────────────────── storage ───────────────────────── */
  private key() {
    return `gx:chat:${this.projectId}`;
  }
  private canPersist() {
    return !!this.projectId && !this.transport && !this.previewMode;
  }
  private loadChat() {
    if (!this.cfg.behavior.persistChat || !this.canPersist()) return;
    try {
      const v = JSON.parse(localStorage.getItem(this.key()) || "[]");
      if (Array.isArray(v) && v.length) this.msgs = v.slice(-40);
    } catch {}
  }
  private saveChat() {
    if (!this.cfg.behavior.persistChat || !this.canPersist()) return;
    try {
      const slim = this.msgs.slice(-40).map((m) => ({
        role: m.role,
        content: m.content,
        t: m.t,
        error: m.error,
        attachments: m.attachments?.map(lightweight),
        actions: m.actions,
      }));
      localStorage.setItem(this.key(), JSON.stringify(slim));
    } catch {}
  }
  private clearStored() {
    if (!this.projectId) return;
    try {
      localStorage.removeItem(this.key());
    } catch {}
  }

  /* ───────────────────────── clear conversation ───────────────────────── */
  private hasConversation() {
    return this.msgs.some((m) => m.role === "user");
  }

  private updateClearButtons() {
    const mode = this.cfg.behavior.clearButton;
    const show = mode === "always" ? true : mode === "never" ? false : this.cfg.behavior.persistChat && this.hasConversation();
    for (const id of ["clear", "fclear"]) {
      const b = this.$(id);
      b.hidden = !show;
      b.toggleAttribute("disabled", !this.hasConversation());
      (b as HTMLElement).style.opacity = this.hasConversation() ? "" : ".4";
    }
  }

  private confirmClear() {
    if (!this.hasConversation()) return;
    const panel = this.$("panel");
    panel.querySelector(".veil")?.remove();
    const v = el("div", "veil");
    v.innerHTML = `<div class="dlg" role="alertdialog" aria-label="Clear conversation"><h4>Clear this conversation?</h4><p>Your messages will be removed from this device. This can’t be undone.</p><div class="btns"><button type="button" data-k="no">Cancel</button><button type="button" class="danger" data-k="yes">Clear</button></div></div>`;
    v.onclick = (e) => {
      const k = (e.target as HTMLElement).closest("button")?.dataset.k;
      if (k === "yes") this.clear();
      if (k || e.target === v) v.remove();
    };
    panel.append(v);
    (v.querySelector('[data-k="no"]') as HTMLElement).focus();
  }

  /** Wipe the conversation (and stored copy). */
  clear() {
    this.abort?.abort();
    this.busy = false;
    this.setBusyUI(false);
    this.msgs = [{ role: "assistant", content: this.cfg.persona.greeting, t: Date.now() }];
    this.pending.forEach((a) => a.url && URL.revokeObjectURL(a.url));
    this.pending = [];
    this.clearStored();
    this.cache.clear();
    this.renderAttachments();
    this.renderMsgs();
    this.renderChips();
    this.updateClearButtons();
    this.syncComposer();
    this.stick = true;
  }

  /** Studio helper: fill the chat with a realistic conversation so every style is visible at once. */
  demo() {
    if (!this.built) return;
    const c = this.cfg;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 120;
    const g = cv.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 120, 120);
    grad.addColorStop(0, c.theme.primaryColor);
    grad.addColorStop(1, c.theme.accentColor);
    g.fillStyle = grad;
    g.fillRect(0, 0, 120, 120);
    g.fillStyle = "rgba(255,255,255,.85)";
    g.beginPath();
    g.arc(60, 52, 22, 0, 7);
    g.fill();
    g.fillRect(24, 84, 72, 10);
    const t = Date.now();
    const md = [
      "Here’s the short version:",
      "",
      "| Plan | Seats | Price |",
      "|:--|:-:|--:|",
      "| Starter | 3 | $9 |",
      "| **Apex** | Unlimited | $29 |",
      "",
      "> [!TIP]",
      "> Annual billing saves **20%**.",
      "",
      "1. Install the SDK",
      "   ```bash",
      "   npm install @apex/sdk",
      "   ```",
      "2. Initialise it — see the [docs](https://example.com):",
      "   - [x] Works in Node 18+",
      "   - [ ] Edge runtime *(soon)*",
      "",
      "Solving for $x$: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
    ].join("\n");
    this.msgs = [
      { role: "assistant", content: c.persona.greeting, t: t - 90000 },
      { role: "user", content: "hi!", t: t - 80000 },
      { role: "user", content: "Can you compare your plans and show me how to get started? I also attached our current setup.", t: t - 70000, attachments: [{ id: "d1", name: "setup.png", mime: "image/png", size: 48000, kind: "image", thumb: cv.toDataURL("image/jpeg", 0.8) }] },
      {
        role: "assistant",
        content: md,
        t: t - 60000,
        reasoning: { label: "Thought for 2.1s", text: "The visitor wants a plan comparison and setup steps. I’ll check pricing, then give a table and a quick start.", isActive: false, startedAt: t - 62100, endedAt: t - 60000 },
        tools: [{ tool: "pricing", label: "Looked up current pricing", args: {}, status: "done", startedAt: t - 61000, endedAt: t - 60400 }],
        actions: [
          { label: "See pricing", action_type: "NAVIGATE", payload: "/pricing" },
          { label: "Talk to sales", action_type: "MESSAGE", payload: "Talk to sales" },
        ],
      },
    ];
    this.cache.clear();
    this.hydrated = false;
    this.stick = true;
    this.renderMsgs();
    this.renderChips();
    this.updateClearButtons();
    this.scrollBottom();
  }

  /* ───────────────────────── small UI helpers ───────────────────────── */
  private flash(btn: HTMLElement, text: string) {
    const label = btn.querySelector("span");
    const prev = label?.textContent;
    btn.setAttribute("data-done", "");
    if (label) label.textContent = text;
    setTimeout(() => {
      btn.removeAttribute("data-done");
      if (label && prev) label.textContent = prev;
    }, 1500);
  }

  private notice(text: string) {
    const n = this.$("notice");
    n.textContent = text;
    n.hidden = false;
    clearTimeout(this.noticeT);
    this.noticeT = window.setTimeout(() => (n.hidden = true), 4200);
  }

  private lightbox(src: string) {
    const panel = this.$("panel");
    panel.querySelector(".lightbox")?.remove();
    const lb = el("div", "lightbox");
    const im = el("img");
    im.src = src;
    im.alt = "";
    const x = el("button", "", ic("x"));
    x.type = "button";
    x.setAttribute("aria-label", "Close preview");
    lb.append(im, x);
    lb.onclick = () => lb.remove();
    panel.append(lb);
  }

  private scrollBottom(smooth = false) {
    const box = this.$("msgs");
    box.scrollTo({ top: box.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    this.stick = true;
  }

  private fitTextarea() {
    const ta = this.ta;
    ta.style.height = "36px";
    const max = this.cfg.composer.maxRows * 20 + 16;
    const h = Math.min(Math.max(ta.scrollHeight, 36), max);
    ta.style.height = h + "px";
    ta.style.overflowY = ta.scrollHeight > max ? "auto" : "hidden";
  }

  /** Send button state, character counter and hint line. */
  private syncComposer() {
    const cp = this.cfg.composer;
    const len = this.ta.value.length;
    const has = !!this.ta.value.trim() || this.pending.length > 0;
    const over = cp.maxChars > 0 && len > cp.maxChars;
    const send = this.$("send");
    const ready = has && !over && !this.busyFiles && !this.busy;
    send.toggleAttribute("data-ready", ready);
    send.toggleAttribute("data-stop", this.busy);
    send.innerHTML = this.busy ? ic("stop") : ic(cp.sendIcon === "plane" ? "plane" : cp.sendIcon === "chevron" ? "chevron" : "arrow");
    send.setAttribute("aria-label", this.busy ? "Stop generating" : "Send message");
    send.toggleAttribute("aria-disabled", !ready && !this.busy);

    const foot = this.$("cfoot");
    foot.replaceChildren();
    if (cp.showHint && !isTouch()) {
      const h = el("span");
      h.textContent = cp.sendOnEnter ? "Enter to send · Shift+Enter for a new line" : "Ctrl+Enter to send";
      foot.append(h);
    }
    if (cp.maxChars > 0 && len > cp.maxChars * 0.8) {
      const c = el("span", "count");
      c.textContent = `${len}/${cp.maxChars}`;
      c.toggleAttribute("data-warn", len > cp.maxChars * 0.9);
      c.toggleAttribute("data-over", over);
      foot.append(c);
    }
  }

  /* ───────────────────────── attachments ───────────────────────── */
  private async addFiles(files: File[]) {
    const cp = this.cfg.composer;
    if (!cp.uploads) return;
    const room = cp.maxFiles - this.pending.length - this.busyFiles;
    if (room <= 0) return this.notice(`You can attach up to ${cp.maxFiles} files per message.`);
    const take = files.slice(0, room);
    if (files.length > room) this.notice(`Only ${cp.maxFiles} files per message — extra files were skipped.`);
    for (const f of take) {
      if (!isAllowed(f, cp.accept)) {
        this.notice(`“${f.name}” isn’t supported. ${describeAccept(cp.accept)} only.`);
        continue;
      }
      this.busyFiles++;
      this.renderAttachments();
      this.syncComposer();
      try {
        const a = await processFile(f, cp.maxSizeMB * 1048576);
        this.pending.push(a);
      } catch (e) {
        this.notice((e as Error).message || "Could not attach that file.");
      }
      this.busyFiles--;
      this.renderAttachments();
      this.syncComposer();
    }
    if (!isTouch()) this.ta.focus({ preventScroll: true });
  }

  private renderAttachments() {
    const box = this.$("atts");
    box.replaceChildren();
    box.hidden = !this.pending.length && !this.busyFiles;
    for (const a of this.pending) {
      const pa = el("div", "pa" + (a.kind === "file" ? " file" : ""));
      if (a.kind === "image") {
        const b = el("button", "th");
        b.type = "button";
        b.setAttribute("aria-label", `Preview ${a.name}`);
        const im = el("img");
        im.alt = "";
        im.src = a.thumb || a.url || "";
        b.append(im);
        b.onclick = () => this.lightbox(a.url || a.thumb || "");
        pa.append(b);
      } else {
        pa.innerHTML = ic("file");
        const meta = el("div", "meta");
        const n = el("b");
        n.textContent = a.name;
        const s = el("small");
        s.textContent = humanSize(a.size);
        meta.append(n, s);
        pa.append(meta);
      }
      const rm = el("button", "rm", ic("x"));
      rm.type = "button";
      rm.setAttribute("aria-label", `Remove ${a.name}`);
      rm.onclick = () => {
        this.pending = this.pending.filter((p) => p.id !== a.id);
        if (a.url) URL.revokeObjectURL(a.url);
        this.renderAttachments();
        this.syncComposer();
        this.ta.focus({ preventScroll: true });
      };
      pa.append(rm);
      box.append(pa);
    }
    for (let i = 0; i < this.busyFiles; i++) box.append(el("div", "pa busy file", '<div class="meta"><b>Adding…</b></div>'));
  }

  /* ───────────────────────── transcript rendering ───────────────────────── */
  private actions(m: Msg, last: boolean): HTMLElement | null {
    if (!m.content || m.error) return null;
    const wrap = el("div", "macts");
    const copy = el("button", "mact", `${ic("copy")}<span>Copy</span>`);
    copy.type = "button";
    copy.setAttribute("aria-label", "Copy message");
    copy.onclick = async () => {
      if (await copyText(m.content, this.$("panel"))) this.flash(copy, "Copied");
    };
    wrap.append(copy);
    if (m.role === "assistant" && last && !this.busy && this.hasConversation()) {
      const re = el("button", "mact", `${ic("refresh")}<span>Regenerate</span>`);
      re.type = "button";
      re.onclick = () => this.regenerate();
      wrap.append(re);
    }
    return wrap;
  }

  private reasoningEl(r: ReasoningBlock): HTMLElement {
    const wrap = el("div", "reasoning-block" + (r.isActive ? " live" : "") + (r.open ?? r.isActive ? " open" : ""));
    const btn = el("button", "reasoning-btn");
    btn.type = "button";
    const elapsed = r.endedAt ? ((r.endedAt - r.startedAt) / 1000).toFixed(1) + "s" : "";
    btn.innerHTML = `<span class="spark">${ic("spark")}</span><span class="title"></span><span class="time">${elapsed}</span><span class="chevron">${ic("chevDown")}</span>`;
    (btn.querySelector(".title") as HTMLElement).textContent = r.label + (r.reason ? ` — ${r.reason}` : "");
    btn.onclick = () => {
      r.open = !wrap.classList.contains("open");
      wrap.classList.toggle("open");
    };
    const body = el("div", "reasoning-body");
    body.textContent = r.text || (r.isActive ? "Thinking through the question…" : "");
    wrap.append(btn, body);
    return wrap;
  }

  private toolEl(t: ToolBlock): HTMLElement {
    const w = el("div", "tool-block");
    const elapsed = t.endedAt ? ((t.endedAt - t.startedAt) / 1000).toFixed(1) + "s" : "";
    const status = t.status === "running" ? P.run : t.status === "done" ? P.check : P.x;
    w.innerHTML = `<span class="tool-icon">${svg(ICONS.bot)}</span><span class="tool-label"></span><span class="tool-timer">${elapsed}</span><span class="tool-status-icon ${t.status}">${svg(`<path d="${status}"/>`)}</span>`;
    (w.querySelector(".tool-label") as HTMLElement).textContent = t.label;
    return w;
  }

  private confirmEl(c: ConfirmationBlock): HTMLElement {
    const card = el("div", "confirm-card");
    card.innerHTML = `<div class="confirm-title">${ic("shield")}<span>Authorization required</span></div><div class="confirm-desc">This action has financial or system impact and needs your explicit approval.</div><div class="confirm-btns"><button type="button" class="btn-approve">Approve &amp; run</button><button type="button" class="btn-decline">Cancel</button></div>`;
    const ok = card.querySelector(".btn-approve") as HTMLButtonElement;
    const no = card.querySelector(".btn-decline") as HTMLButtonElement;
    if (c.status !== "pending") {
      ok.disabled = no.disabled = true;
      ok.textContent = c.status === "confirmed" ? "Approved" : "Cancelled";
      if (c.status === "declined") ok.style.display = "none";
    } else {
      ok.onclick = () => {
        c.status = "confirmed";
        this.send("Yes, please proceed with that action.");
      };
      no.onclick = () => {
        c.status = "declined";
        this.send("No, cancel that action.");
      };
    }
    return card;
  }

  private actionsEl(list: SuggestedAction[]): HTMLElement {
    const wrap = el("div", "suggested-actions");
    for (const a of list) {
      const b = el("button", "action-chip", a.action_type === "NAVIGATE" ? ic("nav") : svg(ICONS.chat));
      b.type = "button";
      const s = el("span");
      s.textContent = a.label;
      b.append(s);
      b.onclick = () => {
        if (a.action_type === "NAVIGATE") {
          if (safeNav(a.payload)) window.location.href = a.payload;
        } else this.send(a.payload);
      };
      wrap.append(b);
    }
    return wrap;
  }

  private attachmentsEl(list: Attachment[]): HTMLElement {
    const w = el("div", "atts-v");
    const solo = list.length === 1;
    for (const a of list) {
      if (a.kind === "image") {
        const b = el("button", "att-img" + (solo ? " solo" : ""));
        b.type = "button";
        b.setAttribute("aria-label", `Open ${a.name}`);
        const im = el("img");
        im.alt = a.name;
        im.src = a.thumb || a.url || "";
        b.append(im);
        b.onclick = () => this.lightbox(a.url || a.thumb || "");
        w.append(b);
      } else {
        const f = el("div", "att-file", ic("file"));
        const n = el("b");
        n.textContent = a.name;
        const s = el("small");
        s.textContent = humanSize(a.size);
        f.append(n, s);
        w.append(f);
      }
    }
    return w;
  }

  private signature(m: Msg, last: boolean): string {
    return [
      m.role,
      m.content,
      m.error ? 1 : 0,
      m.reasoning ? `${m.reasoning.text.length}${m.reasoning.isActive}${m.reasoning.open}${m.reasoning.endedAt ?? ""}` : "",
      (m.tools || []).map((t) => t.status).join(","),
      m.actions?.length ?? 0,
      m.confirmation?.status ?? "",
      m.attachments?.length ?? 0,
      last ? "L" : "",
      last && this.busy ? "B" : "",
    ].join("\u0001");
  }

  private row(m: Msg, last: boolean): HTMLElement {
    const c = this.cfg;
    const M = c.messages;
    const row = el("div", "row " + m.role);

    if (m.role === "assistant" && M.showAvatar) {
      const url = CSS_ESC(c.persona.avatarUrl);
      const av = url ? el("img", "mav") : el("div", "mav");
      if (av instanceof HTMLImageElement) {
        av.alt = "";
        av.src = url;
      }
      row.append(av);
    }

    const col = el("div", "col");
    const showReasoning = M.showReasoning && m.reasoning && (m.reasoning.text || m.reasoning.isActive);
    const showTools = M.showTools && m.tools && m.tools.length > 0;
    const typing =
      m.role === "assistant" && last && this.busy && !m.content && c.persona.typingIndicator && !m.reasoning?.isActive && !m.tools?.some((t) => t.status === "running");
    const hasBubble = !!m.content || typing || !!m.attachments?.length;
    const hasBadges = !!(showReasoning || showTools || m.confirmation || m.actions?.length);
    if (hasBubble && hasBadges && m.role === "assistant") col.setAttribute("data-b", "");

    if (M.showSender && m.role === "assistant") {
      const s = el("div", "sender");
      s.textContent = c.persona.name;
      col.append(s);
    }
    if (showReasoning) col.append(this.reasoningEl(m.reasoning!));
    if (showTools) for (const t of m.tools!) col.append(this.toolEl(t));
    if (m.confirmation) col.append(this.confirmEl(m.confirmation));

    if (typing) {
      col.append(el("div", "m assistant typing", '<span class="dots"><i></i><i></i><i></i></span>'));
    } else if (m.content || m.attachments?.length) {
      const bubble = el("div", "m " + m.role);
      if (m.role === "assistant") bubble.innerHTML = renderMarkdown(m.content);
      else {
        if (m.attachments?.length) {
          bubble.classList.add("has-att");
          bubble.append(this.attachmentsEl(m.attachments));
          if (!m.content) bubble.classList.add("att-only");
        }
        if (m.content) bubble.append(document.createTextNode(m.content));
      }
      if (m.error) {
        const btn = el("button", "retry");
        btn.type = "button";
        btn.textContent = "Try again";
        btn.style.cssText = "margin-top:8px;display:block;border:1px solid currentColor;background:transparent;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer";
        btn.onclick = () => this.retryLast();
        bubble.append(btn);
      }
      col.append(bubble);
    }

    if (M.showActions !== "off") {
      const a = this.actions(m, last);
      if (a) col.append(a);
    }
    if (m.actions && m.actions.length) col.append(this.actionsEl(m.actions));
    if (M.showTimestamps && m.t) {
      const ts = el("div", "ts");
      ts.textContent = new Date(m.t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      col.append(ts);
    }
    row.append(col);
    return row;
  }

  /** Incremental: only rows whose content changed are rebuilt, so streaming never flickers or resets state. */
  private renderMsgs() {
    const box = this.$("msgs");
    const prevH = box.scrollHeight;
    const wantBottom = this.stick;
    const keep = new Set<Msg>();
    const order: HTMLElement[] = [];
    this.msgs.forEach((m, i) => {
      const last = i === this.msgs.length - 1;
      keep.add(m);
      const sig = this.signature(m, last);
      const hit = this.cache.get(m);
      if (hit && hit.sig === sig) return order.push(hit.el);
      const node = this.row(m, last);
      if (!hit && this.hydrated && c_anim(this.cfg)) node.classList.add("enter");
      this.cache.set(m, { sig, el: node });
      order.push(node);
    });
    for (const k of [...this.cache.keys()]) if (!keep.has(k)) this.cache.delete(k);

    const last = this.msgs[this.msgs.length - 1];
    if (this.busy && this.cfg.persona.typingIndicator && last?.role === "user") {
      if (!this.typingEl) {
        this.typingEl = el("div", "row assistant", '<div class="col"><div class="m assistant typing"><span class="dots"><i></i><i></i><i></i></span></div></div>');
        if (this.hydrated && c_anim(this.cfg)) this.typingEl.classList.add("enter");
      }
      if (this.cfg.messages.showAvatar) {
        /* avatar for the typing row */
        if (!this.typingEl.querySelector(".mav")) {
          const url = CSS_ESC(this.cfg.persona.avatarUrl);
          const av = url ? el("img", "mav") : el("div", "mav");
          if (av instanceof HTMLImageElement) {
            av.alt = "";
            av.src = url;
          }
          this.typingEl.prepend(av);
        }
      }
      order.push(this.typingEl);
    } else this.typingEl = undefined;

    // reconcile DOM order
    order.forEach((node, i) => {
      if (box.children[i] !== node) box.insertBefore(node, box.children[i] || null);
    });
    while (box.children.length > order.length) box.lastElementChild!.remove();

    this.hydrated = true;
    if (wantBottom) box.scrollTop = box.scrollHeight;
    else box.scrollTop = box.scrollTop + (box.scrollHeight - prevH) * 0;
    this.updateClearButtons();
  }

  private scheduleRender() {
    if (this.renderRaf) return;
    this.renderRaf = requestAnimationFrame(() => {
      this.renderRaf = 0;
      this.renderMsgs();
    });
  }

  private renderChips() {
    const show = this.msgs.length <= 1;
    const box = this.$("chips");
    box.replaceChildren();
    if (!show) return;
    for (const q of this.cfg.behavior.suggestedQuestions) {
      const b = el("button", "chip");
      b.type = "button";
      b.textContent = q;
      box.append(b);
    }
  }

  /* ───────────────────────── sending ───────────────────────── */
  private setBusyUI(on: boolean) {
    this.ta.toggleAttribute("disabled", false);
    this.shadowRoot!.querySelector(".gx")!.toggleAttribute("data-busy", on);
    this.syncComposer();
    if (!on && !isTouch()) this.ta.focus({ preventScroll: true });
  }

  private retryLast() {
    if (this.busy) return;
    const lastUser = [...this.msgs].reverse().find((m) => m.role === "user");
    if (lastUser) this.send(lastUser.content, true);
  }

  private regenerate() {
    if (this.busy) return;
    const lastMsg = this.msgs[this.msgs.length - 1];
    if (lastMsg?.role === "assistant") this.msgs.pop();
    const lastUser = [...this.msgs].reverse().find((m) => m.role === "user");
    if (lastUser) this.send(lastUser.content, true);
  }

  stop() {
    this.abort?.abort();
  }

  async send(text?: string, isRetry = false) {
    const inp = this.ta;
    const content = (text ?? inp.value).trim();
    const fromComposer = text === undefined;
    const files = fromComposer ? this.pending : [];
    const cp = this.cfg.composer;
    if (this.busy || this.busyFiles) return;
    if (!content && !files.length && !isRetry) return;
    if (fromComposer && cp.maxChars > 0 && content.length > cp.maxChars) return;

    if (isRetry) {
      if (this.msgs[this.msgs.length - 1]?.error) this.msgs.pop();
    } else {
      if (fromComposer) {
        inp.value = "";
        this.pending = [];
        this.renderAttachments();
        this.fitTextarea();
      }
      this.msgs.push({ role: "user", content, t: Date.now(), attachments: files.length ? files : undefined });
      if (this.cfg.behavior.soundOnSend) playSound("pop", this.cfg.behavior.soundVolume / 100);
    }

    this.stick = true;
    this.busy = true;
    this.setBusyUI(true);
    this.renderChips();
    this.renderMsgs();

    const history = this.msgs
      .filter((m, i) => !(i === 0 && m.role === "assistant"))
      .map((m) => {
        const atts = (m.attachments || []).filter((a) => a.data).map((a) => ({ name: a.name, mime: a.mime, data: a.data! }));
        const body: any = { role: m.role, content: m.content || (atts.length ? "Please look at the attached file(s)." : "") };
        if (atts.length) body.attachments = atts;
        return body;
      });

    this.abort = new AbortController();
    try {
      if (this.transport) {
        const reply = await this.transport(history as Msg[]);
        this.msgs.push({ role: "assistant", content: reply, t: Date.now() });
      } else {
        await this.streamReply(history, this.abort.signal);
      }
      this.onReply();
    } catch (e) {
      const aborted = (e as Error)?.name === "AbortError" || this.abort.signal.aborted;
      const tail = this.msgs[this.msgs.length - 1];
      if (aborted) {
        if (tail?.role === "assistant" && !tail.content && !tail.reasoning?.text) this.msgs.pop();
        if (tail?.reasoning) tail.reasoning.isActive = false;
      } else {
        if (tail?.role === "assistant" && !tail.content && !tail.error) this.msgs.pop();
        this.msgs.push({ role: "assistant", content: "Sorry, something went wrong. Please try again.", t: Date.now(), error: true });
      }
    }

    this.busy = false;
    this.abort = undefined;
    this.setBusyUI(false);
    this.renderMsgs();
    this.saveChat();
  }

  private onReply() {
    if (this.cfg.behavior.soundOnReply) playSound(this.cfg.behavior.sound, this.cfg.behavior.soundVolume / 100);
    if (!this.isOpen()) {
      this.unread++;
      this.$("launch").toggleAttribute("data-unread", true);
    }
  }

  /** Real-time SSE streaming: live reasoning, tool badges, suggested actions, confirmation cards. */
  private async streamReply(history: any[], signal: AbortSignal) {
    const response = await fetch(`${this.apiUrl}/copilot/${this.projectId}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, pageContext: extractLivePageContext() }),
      signal,
    });
    if (!response.ok || !response.body) throw new Error(`Stream failed (${response.status})`);

    const msg: Msg = { role: "assistant", content: "", t: Date.now(), tools: [], actions: [] };
    this.msgs.push(msg);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;

    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payloadStr = trimmed.replace(/^data:\s*/, "");
        if (payloadStr === "[DONE]") {
          finished = true;
          break;
        }
        try {
          const p = JSON.parse(payloadStr);
          switch (p.type) {
            case "mode":
              this.pendingReason = p.reason;
              break;
            case "phase":
              if (p.phase === "reasoning_start") {
                msg.reasoning = { label: p.label || "Reasoning through inquiry…", reason: this.pendingReason, text: "", isActive: true, startedAt: Date.now() };
              } else if (p.phase === "reasoning_end" && msg.reasoning) {
                msg.reasoning.isActive = false;
                msg.reasoning.endedAt = Date.now();
              }
              break;
            case "thought":
              if (!msg.reasoning) msg.reasoning = { label: "Reasoning through inquiry…", text: "", isActive: true, startedAt: Date.now() };
              msg.reasoning.text += p.delta;
              break;
            case "token":
              if (msg.reasoning?.isActive) {
                msg.reasoning.isActive = false;
                msg.reasoning.endedAt = Date.now();
              }
              msg.content += p.delta;
              break;
            case "tool_start":
              (msg.tools = msg.tools || []).push({ tool: p.tool, label: p.label || "Working on it…", args: p.args || {}, status: "running", startedAt: Date.now() });
              break;
            case "tool_end": {
              const t = [...(msg.tools || [])].reverse().find((x) => x.tool === p.tool);
              if (t) {
                t.status = p.error ? "error" : "done";
                t.result = p.result;
                t.endedAt = Date.now();
              }
              break;
            }
            case "suggested_actions":
              msg.actions = Array.isArray(p.payload) ? p.payload : [];
              break;
            case "action_confirmation_required":
              msg.confirmation = { payload: p.payload || {}, status: "pending" };
              break;
            case "error":
              msg.content += `\n\n⚠️ ${p.message}`;
              break;
          }
        } catch {
          if (payloadStr) msg.content += payloadStr;
        }
        this.scheduleRender();
      }
    }
    if (msg.reasoning?.isActive) {
      msg.reasoning.isActive = false;
      msg.reasoning.endedAt = Date.now();
    }
    this.scheduleRender();
  }
}

const c_anim = (c: WidgetSchema) => c.messages.animate !== "none";
