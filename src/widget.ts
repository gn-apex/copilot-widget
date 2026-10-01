// src/widget.ts

import { resolve, fromServer, type WidgetSchema } from "./schema";
import { CSS } from "./styles";

const ICONS: Record<string, string> = {
  chat: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13a7 7 0 0 1 7 7.5Z"/>',
  sparkles:
    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.7M12 17h.01"/>',
  message: '<path d="M4 6h16v10H8l-4 3V6z"/>',
  wave: '<path d="M4 14c2-4 4-6 6-6s3 3 5 3 4-3 5-5"/><path d="M4 18c2-3 4-5 6-5s3 2 5 2 4-2 5-4"/>',
};

const X_SVG = '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const SEND_SVG =
  '<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
const SPARK_SVG =
  '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>';
const CHEVRON_SVG = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
const COPY_SVG =
  '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
const TOOL_RUN_SVG =
  '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
const NAVIGATE_SVG =
  '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M7 7h10v10"/></svg>';
const SHIELD_ALERT_SVG =
  '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></svg>';

export type SuggestedAction = {
  label: string;
  action_type: string;
  payload: string;
};

export type ReasoningBlock = {
  label: string;
  reason?: string;
  text: string;
  isActive: boolean;
  startedAt: number;
  endedAt?: number;
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

export type ConfirmationBlock = {
  payload: Record<string, unknown>;
  status: "pending" | "confirmed" | "declined";
};

export type Msg = {
  role: "user" | "assistant";
  content: string;
  t?: number;
  error?: boolean;
  reasoning?: ReasoningBlock;
  tools?: ToolBlock[];
  actions?: SuggestedAction[];
  confirmation?: ConfirmationBlock;
};

export type Transport = (messages: Msg[]) => Promise<string>;

const CSS_ESC = (u: string) =>
  /^https?:\/\//i.test(u) ? u.replace(/"/g, "%22") : "";

function onColor(hex: string, light = "#ffffff", dark = "#0a0a0a"): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  if (!Number.isFinite(n)) return light;
  const ch = (c: number) =>
    (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const L =
    0.2126 * ch((n >> 16) & 255) +
    0.7152 * ch((n >> 8) & 255) +
    0.0722 * ch(n & 255);
  return (1.05 / (L + 0.05)) * 1.35 >= (L + 0.05) / 0.05 ? light : dark;
}

const setVar = (el: HTMLElement, k: string, v?: string) =>
  v ? el.style.setProperty(k, v) : el.style.removeProperty(k);

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

/**
 * 🔍 Extracts rich contextual metadata from the visitor's active webpage
 */
function extractLivePageContext() {
  if (typeof window === "undefined" || !document) return undefined;

  const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
    .map((el) => (el.textContent || "").trim())
    .filter((t) => t.length > 2 && t.length < 120)
    .slice(0, 8);

  const metaDesc =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content") ||
    document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content") ||
    "";

  let structuredData: any = null;
  const jsonLdScript = document.querySelector(
    'script[type="application/ld+json"]',
  );
  if (jsonLdScript && jsonLdScript.textContent) {
    try {
      const parsed = JSON.parse(jsonLdScript.textContent);
      if (
        parsed["@type"] === "Product" ||
        parsed["@type"] === "Article" ||
        parsed["@type"] === "Organization"
      ) {
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
      /* ignore invalid JSON-LD */
    }
  }

  const selectedText =
    window.getSelection()?.toString().trim().slice(0, 500) || "";

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

/**
 * ⚡ Zero-dependency micro-markdown parser
 * Safe HTML escaping, code blocks with copy buttons, GFM tables, bold, italics, blockquotes, lists.
 */
function renderMicroMarkdown(raw: string): string {
  if (!raw) return "";

  // 1. Extract and stash fenced code blocks to prevent nested parsing
  const codeBlocks: string[] = [];
  let text = raw.replace(
    /```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g,
    (_, lang, code) => {
      const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const langLabel = lang ? lang.toUpperCase() : "CODE";
      const idx = codeBlocks.length;
      codeBlocks.push(
        `<div class="code-block">` +
          `<div class="code-header"><span class="code-lang">${langLabel}</span>` +
          `<button type="button" class="code-copy" data-idx="${idx}">${COPY_SVG}<span>Copy</span></button></div>` +
          `<pre><code>${escapedCode}</code></pre>` +
          `</div>`,
      );
      return `__CODE_BLOCK_${idx}__`;
    },
  );

  // 2. Escape raw HTML tags for XSS safety
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 3. Inline code
  text = text.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  // 4. Markdown Headings
  text = text.replace(/^#### (.*?)$/gm, "<h4>$1</h4>");
  text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // 5. Blockquotes
  text = text.replace(/^&gt;\s?(.*?)$/gm, "<blockquote>$1</blockquote>");

  // 6. Bold & Italics
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // 7. Markdown Links [text](url)
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer nofollow">$1</a>',
  );

  // 8. Markdown Tables
  text = text.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
    const rows = match
      .trim()
      .split("\n")
      .filter((r) => !/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(r));
    if (rows.length < 1) return match;

    let tableHtml = '<div class="gora-table-wrap"><table>';
    rows.forEach((row, i) => {
      const cells = row
        .split("|")
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const tag = i === 0 ? "th" : "td";
      tableHtml += `<tr>${cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join("")}</tr>`;
    });
    tableHtml += "</table></div>";
    return tableHtml;
  });

  // 9. Unordered Lists
  text = text.replace(/(?:^[ \t]*[-*]\s+[^\n]+(?:\n|$))+/gm, (listMatch) => {
    const items = listMatch
      .trim()
      .split("\n")
      .map((line) => line.replace(/^[ \t]*[-*]\s+/, ""));
    return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  });

  // 10. Paragraphs
  const paragraphs = text.split(/\n\s*\n/).map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<ul>") ||
      trimmed.startsWith("<ol>") ||
      trimmed.startsWith("<blockquote>") ||
      trimmed.startsWith("<div") ||
      trimmed.startsWith("__CODE_BLOCK_")
    ) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
  });

  let html = paragraphs.filter(Boolean).join("");

  // 11. Re-insert code blocks
  html = html.replace(
    /__CODE_BLOCK_(\d+)__/g,
    (_, idx) => codeBlocks[+idx] || "",
  );

  return html;
}

const FOCUSABLE =
  'button:not([hidden]):not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class GxCopilot extends HTMLElement {
  cfg: WidgetSchema = resolve({});
  transport?: Transport;
  projectId = "";
  apiUrl = "";
  private msgs: Msg[] = [];
  private busy = false;
  private built = false;
  private compact = false;
  private openedOnce = false;
  private mode = "panel";
  private $!: (s: string) => HTMLElement;
  private styleEl!: HTMLStyleElement;
  private autoTimer?: number;
  private onKey?: (e: KeyboardEvent) => void;
  private onResize?: () => void;
  private onDoc?: (e: PointerEvent) => void;
  private audio?: AudioContext;
  private raf = 0;
  private pendingReason?: string;

  async connectedCallback() {
    this.projectId = this.getAttribute("data-project-id") || "";
    this.apiUrl = (
      this.getAttribute("data-api-url") || location.origin
    ).replace(/\/$/, "");
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
      } catch (e) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
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
    if (this.onKey) removeEventListener("keydown", this.onKey);
    if (this.onResize) removeEventListener("resize", this.onResize);
    if (this.onDoc)
      document.removeEventListener("pointerdown", this.onDoc, true);
    clearTimeout(this.autoTimer);
    cancelAnimationFrame(this.raf);
  }

  setConfig(input: unknown) {
    this.cfg = resolve(input);
    if (!this.built) this.build();
    this.apply();
  }

  private build() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${CSS}</style><style id="custom"></style>
      <div class="gx">
        <div class="backdrop" id="backdrop"></div>
        <section class="panel" role="dialog" aria-label="Chat" id="panel">
          <div class="busybar" id="busybar" aria-hidden="true"></div>
          <button class="x fx" id="fx" aria-label="Close" hidden>${X_SVG}</button>
          <header id="hdr">
            <div id="av"></div>
            <div class="title"><div class="name" id="name"></div><div class="sub" id="sub"></div></div>
            <button class="x" id="close" aria-label="Close">${X_SVG}</button>
          </header>
          <div class="msgs" id="msgs" aria-live="polite"></div>
          <div class="chips" id="chips"></div>
          <div class="composer">
            <textarea id="inp" rows="1" aria-label="Message"></textarea>
            <button class="send" id="send" aria-label="Send message">${SEND_SVG}</button>
          </div>
          <div class="brand" id="brand">POWERED BY GN•APEX</div>
        </section>
        <button class="launcher" id="launch" aria-label="Open chat" aria-expanded="false">
          <span class="ico"><span class="i-main" id="imain"></span><svg class="i-close" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></span>
          <span class="lbl" id="llbl" hidden></span>
        </button>
      </div>`;
    this.$ = (s) => root.getElementById(s) as HTMLElement;
    this.styleEl = this.$("custom") as HTMLStyleElement;
    this.$("launch").onclick = () => this.toggle();
    this.$("close").onclick = () => this.close();
    this.$("fx").onclick = () => this.close();
    this.$("send").onclick = () => this.send();
    this.$("backdrop").onclick = () => {
      if (this.cfg.presentation.closeOnOutside) this.close();
    };

    const inp = this.$("inp") as HTMLTextAreaElement;
    inp.style.height = "40px";
    inp.style.overflowY = "hidden";

    inp.oninput = () => {
      inp.style.height = "40px"; // reset height to recompute accurately
      const scrollH = inp.scrollHeight;
      if (scrollH > 40) {
        inp.style.height = Math.min(scrollH, 110) + "px";
        inp.style.overflowY = scrollH > 110 ? "auto" : "hidden";
      } else {
        inp.style.height = "40px";
        inp.style.overflowY = "hidden";
      }
    };

    this.$("chips").onclick = (e) => {
      const c = (e.target as HTMLElement).closest(".chip");
      if (c) this.send(c.textContent || "");
    };

    this.onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        this.cfg.presentation.closeOnEscape &&
        this.isOpen()
      ) {
        this.close();
        return;
      }
      this.trapFocus(e);
    };
    addEventListener("keydown", this.onKey);

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

    // Event delegation for copy buttons in code blocks
    this.$("msgs").addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest(".code-copy") as HTMLButtonElement | null;
      if (copyBtn) {
        const codePre = copyBtn
          .closest(".code-block")
          ?.querySelector("pre code");
        if (codePre) {
          try {
            await navigator.clipboard.writeText(codePre.textContent || "");
            const label = copyBtn.querySelector("span");
            if (label) label.textContent = "Copied!";
            setTimeout(() => {
              if (label) label.textContent = "Copy";
            }, 1600);
          } catch {}
        }
      }
    });

    this.loadChat();
    this.built = true;
  }

  private trapFocus(e: KeyboardEvent) {
    if (e.key !== "Tab" || !this.isOpen() || !this.cfg.presentation.backdrop)
      return;
    const panel = this.$("panel");
    const list = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => !el.hasAttribute("hidden"));
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

  private apply() {
    const c = this.cfg;
    const gx = this.shadowRoot!.querySelector(".gx") as HTMLElement;
    const dark =
      c.theme.mode === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
        : c.theme.mode === "dark";

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
    const icon = Math.min(L.iconSize, L.size - 4);
    s.setProperty("--gx-icon", icon + "px");
    s.setProperty("--gx-lpad", L.padding + "px");
    s.setProperty("--gx-lsize", L.labelSize + "px");
    const hasLabel = !!L.label;
    const lr =
      L.shape === "pill" || L.shape === "circle"
        ? "999px"
        : L.shape === "square"
          ? Math.round(L.size * 0.22) + "px"
          : Math.round(L.size * 0.32) + "px";
    s.setProperty("--gx-launcher-radius", lr);
    const lbase = L.bg || c.theme.primaryColor;
    s.setProperty("--gx-l-base", lbase);
    s.setProperty(
      "--gx-l-bg",
      L.gradient
        ? `linear-gradient(145deg,${lbase},color-mix(in srgb,${lbase} 68%,#000))`
        : lbase,
    );
    s.setProperty("--gx-l-fg", L.color || onColor(lbase));

    this.mode = effectiveMode(c, this.compact || window.innerWidth <= 480);
    gx.dataset.mode = dark ? "dark" : "light";
    gx.dataset.pos = L.position;
    gx.dataset.pres = this.mode;
    gx.dataset.side = c.presentation.drawerSide;
    gx.dataset.anim = c.presentation.animation;
    gx.dataset.density = c.theme.density;
    gx.dataset.shadow = c.theme.shadow;
    gx.dataset.header = c.panel.headerStyle;
    gx.dataset.bubble = c.messages.bubbleStyle;
    gx.dataset.align = c.messages.userAlign;
    gx.toggleAttribute(
      "data-glass",
      c.theme.glass && c.panel.bgType === "solid",
    );
    gx.toggleAttribute("data-backdrop-blur", c.presentation.backdropBlur);
    gx.toggleAttribute("data-no-backdrop", !c.presentation.backdrop);
    gx.toggleAttribute("data-ai-border", c.messages.aiBorder);

    const P = c.panel;
    const base = P.bg || (dark ? "#0a0a0a" : "#ffffff");
    const img = P.bgType === "image" ? CSS_ESC(P.bgImageUrl) : "";
    const custom = !!P.bg || P.bgType === "gradient" || !!img;
    let panelBg = "";
    if (P.bgType === "gradient") {
      const end =
        P.bg2 || `color-mix(in srgb,${c.theme.primaryColor} 28%,${base})`;
      panelBg = `linear-gradient(${P.gradientAngle}deg,${base},${end})`;
    } else if (img) {
      const veil = `color-mix(in srgb,${base} ${P.bgImageDim}%,transparent)`;
      panelBg = `linear-gradient(${veil},${veil}),url("${img}") center/cover no-repeat`;
    }
    setVar(gx, "--bg", custom ? base : "");
    setVar(gx, "--gx-panel-bg", panelBg);
    setVar(
      gx,
      "--text",
      P.textColor || (custom ? onColor(base, "#fafafa", "#0a0a0a") : ""),
    );
    setVar(gx, "--border", P.borderColor);
    setVar(gx, "--gx-hdr-bg", P.headerBg);
    gx.toggleAttribute("data-hdr-custom", !!P.headerBg);
    setVar(
      gx,
      "--gx-hdr-fg",
      P.headerText ||
        (P.headerBg ? onColor(P.headerBg, "#fafafa", "#0a0a0a") : ""),
    );
    setVar(gx, "--gx-composer-bg", P.composerBg);
    setVar(gx, "--gx-input-bg", P.inputBg);
    setVar(
      gx,
      "--gx-input-fg",
      P.inputBg ? onColor(P.inputBg, "#fafafa", "#0a0a0a") : "",
    );
    setVar(gx, "--gx-on-primary", onColor(c.theme.primaryColor));

    const M = c.messages;
    s.setProperty("--gx-fs", M.fontSize + "px");
    s.setProperty("--gx-mw", M.maxWidth + "%");
    setVar(gx, "--gx-user-bg", M.userBg);
    setVar(
      gx,
      "--gx-user-fg",
      M.userText || onColor(M.userBg || c.theme.primaryColor),
    );
    setVar(gx, "--gx-ai-bg", M.aiBg);
    setVar(
      gx,
      "--gx-ai-fg",
      M.aiText || (M.aiBg ? onColor(M.aiBg, "#fafafa", "#0a0a0a") : ""),
    );

    const launch = this.$("launch");
    launch.hidden = !L.show;
    launch.dataset.shape = L.shape;
    launch.dataset.lpos = L.labelPosition;
    launch.dataset.lmode = L.labelMode;
    launch.toggleAttribute("data-label", hasLabel);
    launch.toggleAttribute("data-glow", L.glow);
    launch.toggleAttribute("data-pulse", L.pulse && !this.openedOnce);
    const cu = L.icon === "custom" ? CSS_ESC(L.customIconUrl) : "";
    this.$("imain").innerHTML = cu
      ? `<img alt="" src="${cu}">`
      : `<svg viewBox="0 0 24 24">${ICONS[L.icon] || ICONS.chat}</svg>`;
    const lbl = this.$("llbl");
    lbl.hidden = !hasLabel;
    lbl.textContent = L.label;

    this.$("name").textContent = c.persona.name;
    this.$("sub").textContent = c.persona.subtitle;
    this.$("av").innerHTML = c.persona.avatarUrl
      ? `<img class="avatar" alt="" src="${CSS_ESC(c.persona.avatarUrl)}">`
      : '<div class="avatar"></div>';
    (this.$("inp") as HTMLTextAreaElement).placeholder = c.behavior.placeholder;
    this.$("brand").hidden = !c.panel.showBranding;
    this.$("hdr").hidden = !c.panel.showHeader;
    this.$("fx").hidden = c.panel.showHeader;
    this.$("panel").setAttribute(
      "aria-label",
      c.persona.name ? `Chat with ${c.persona.name}` : "Chat",
    );

    if (!c.behavior.persistChat) this.clearChat();
    if (!this.msgs.some((m) => m.role === "user")) {
      this.msgs = [
        { role: "assistant", content: c.persona.greeting, t: Date.now() },
      ];
    }
    this.renderMsgs(this.busy);
    this.renderChips();

    this.styleEl.textContent = c.customCss
      .replace(/@import[^;]*;?/gi, "")
      .replace(/url\s*\(/gi, "(")
      .replace(/expression\s*\(/gi, "(");

    this.syncOpen();
  }

  setCompact(on: boolean) {
    this.compact = on;
    this.shadowRoot?.querySelector(".gx")?.toggleAttribute("data-compact", on);
    this.apply();
  }

  get opened() {
    return this.isOpen();
  }

  private isOpen() {
    return (
      this.shadowRoot!.querySelector(".panel")?.hasAttribute("data-open") ??
      false
    );
  }

  private syncOpen() {
    const open = this.isOpen(),
      c = this.cfg,
      launch = this.$("launch");
    launch.toggleAttribute("data-open", open && c.launcher.closeIconWhenOpen);
    const covers = ["sheet", "fullscreen", "drawer"].includes(this.mode);
    const hide =
      open &&
      (c.launcher.hideWhenOpen === "always" ||
        (c.launcher.hideWhenOpen === "auto" && covers));
    launch.toggleAttribute("data-hide", hide);
    launch.setAttribute("aria-expanded", String(open));
    this.dispatchEvent(new CustomEvent("gx-toggle", { detail: open }));
    launch.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    this.$("panel").setAttribute("aria-modal", String(c.presentation.backdrop));
  }

  open() {
    this.$("panel").toggleAttribute("data-open", true);
    this.$("backdrop").toggleAttribute("data-open", true);
    this.openedOnce = true;
    this.$("launch").removeAttribute("data-pulse");
    this.syncOpen();
    (this.$("inp") as HTMLElement).focus({ preventScroll: true });
  }

  close() {
    this.$("panel").toggleAttribute("data-open", false);
    this.$("backdrop").toggleAttribute("data-open", false);
    this.syncOpen();
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  private key() {
    return `gx:chat:${this.projectId}`;
  }

  private canPersist() {
    return !!this.projectId && !this.transport;
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
      localStorage.setItem(this.key(), JSON.stringify(this.msgs.slice(-40)));
    } catch {}
  }

  private clearChat() {
    if (!this.projectId) return;
    try {
      localStorage.removeItem(this.key());
    } catch {}
  }

  private beep() {
    try {
      const A = window.AudioContext || (window as any).webkitAudioContext;
      this.audio = this.audio || new A();
      if (this.audio.state === "suspended") this.audio.resume().catch(() => {});
      const t = this.audio.currentTime;
      [660, 880].forEach((f, i) => {
        const o = this.audio!.createOscillator(),
          g = this.audio!.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.05, t + i * 0.09 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.16);
        o.connect(g).connect(this.audio!.destination);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 0.18);
      });
    } catch {}
  }

  private executeClientAction(action: { type: string; payload: string }) {
    try {
      if (action.type === "SCROLL_TO") {
        const el = document.querySelector(action.payload) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.outline = "3px solid var(--gx-primary, #06b6d4)";
          el.style.outlineOffset = "4px";
          el.style.transition = "outline 0.3s ease";
          setTimeout(() => {
            el.style.outline = "none";
          }, 2400);
        }
      } else if (action.type === "NAVIGATE") {
        window.location.href = action.payload;
      }
    } catch (e) {
      console.debug("[Copilot Action Error]", e);
    }
  }

  // ───────────────────────── rendering ─────────────────────────
  private createReasoningEl(r: ReasoningBlock): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "reasoning-block" + (r.isActive ? " open" : "");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "reasoning-btn";

    const elapsed = r.endedAt
      ? ((r.endedAt - r.startedAt) / 1000).toFixed(1) + "s"
      : "";
    btn.innerHTML =
      `<span class="spark">${SPARK_SVG}</span>` +
      `<span class="title">${r.label}${r.reason ? ` — ${r.reason}` : ""}</span>` +
      `<span class="time">${elapsed}</span>` +
      `<span class="chevron">${CHEVRON_SVG}</span>`;

    btn.onclick = () => wrap.classList.toggle("open");

    const body = document.createElement("div");
    body.className = "reasoning-body";
    body.textContent =
      r.text || (r.isActive ? "Thinking through inquiry..." : "");

    wrap.append(btn, body);
    return wrap;
  }

  private createToolEl(t: ToolBlock): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "tool-block";

    const elapsed = t.endedAt
      ? ((t.endedAt - t.startedAt) / 1000).toFixed(1) + "s"
      : "";
    const isRunning = t.status === "running";
    const statusSvg = isRunning
      ? TOOL_RUN_SVG
      : t.status === "done"
        ? CHECK_SVG
        : X_SVG;

    wrap.innerHTML =
      `<span class="tool-icon">${ICONS.bot}</span>` +
      `<span class="tool-label">${t.label}</span>` +
      `<span class="tool-timer">${elapsed}</span>` +
      `<span class="tool-status-icon ${t.status}">${statusSvg}</span>`;

    return wrap;
  }

  private createConfirmCard(c: ConfirmationBlock): HTMLElement {
    const card = document.createElement("div");
    card.className = "confirm-card";

    card.innerHTML =
      `<div class="confirm-title">${SHIELD_ALERT_SVG}<span>Authorization Required</span></div>` +
      `<div class="confirm-desc">This action has financial or system impact and requires your explicit approval.</div>` +
      `<div class="confirm-btns">` +
      `<button type="button" class="btn-approve">Approve & Execute</button>` +
      `<button type="button" class="btn-decline">Cancel</button>` +
      `</div>`;

    const approveBtn = card.querySelector(".btn-approve") as HTMLButtonElement;
    const declineBtn = card.querySelector(".btn-decline") as HTMLButtonElement;

    if (c.status !== "pending") {
      approveBtn.disabled = true;
      declineBtn.disabled = true;
      approveBtn.textContent =
        c.status === "confirmed" ? "Approved" : "Cancelled";
      if (c.status === "declined") approveBtn.style.display = "none";
    } else {
      approveBtn.onclick = () => {
        c.status = "confirmed";
        this.send("Yes, please proceed with that action.");
      };
      declineBtn.onclick = () => {
        c.status = "declined";
        this.send("No, cancel that action.");
      };
    }

    return card;
  }

  private createActionsEl(actions: SuggestedAction[]): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "suggested-actions";

    for (const act of actions) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "action-chip";
      const iconSvg =
        act.action_type === "NAVIGATE" ? NAVIGATE_SVG : ICONS.chat;
      btn.innerHTML = `${iconSvg}<span>${act.label}</span>`;

      btn.onclick = () => {
        if (act.action_type === "NAVIGATE") {
          window.location.href = act.payload;
        } else {
          this.send(act.payload);
        }
      };
      wrap.appendChild(btn);
    }

    return wrap;
  }

  private row(m: Msg) {
    const c = this.cfg;
    const row = document.createElement("div");
    row.className = "row " + m.role;

    if (m.role === "assistant" && c.messages.showAvatar) {
      const av = c.persona.avatarUrl
        ? document.createElement("img")
        : document.createElement("div");
      av.className = "mav";
      if (av instanceof HTMLImageElement) {
        av.alt = "";
        av.src = CSS_ESC(c.persona.avatarUrl);
      }
      row.appendChild(av);
    }

    const col = document.createElement("div");
    col.className = "col";

    // 1. Render Reasoning Block if present
    if (m.reasoning && (m.reasoning.text || m.reasoning.isActive)) {
      col.appendChild(this.createReasoningEl(m.reasoning));
    }

    // 2. Render Tool Blocks if present
    if (m.tools && m.tools.length > 0) {
      for (const tb of m.tools) {
        col.appendChild(this.createToolEl(tb));
      }
    }

    // 3. Render Confirmation Card (Tier-3) if present
    if (m.confirmation) {
      col.appendChild(this.createConfirmCard(m.confirmation));
    }

    // 4. Main Markdown Content Bubble
    if (m.content) {
      const bubble = document.createElement("div");
      bubble.className = "m " + m.role;
      if (m.role === "assistant") {
        bubble.innerHTML = renderMicroMarkdown(m.content);
      } else {
        bubble.textContent = m.content;
      }

      if (m.error) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "retry";
        btn.textContent = "Try again";
        btn.onclick = () => this.retryLast();
        bubble.appendChild(document.createElement("br"));
        bubble.appendChild(btn);
      }
      col.appendChild(bubble);
    }

    // 5. Render Suggested Actions if present
    if (m.actions && m.actions.length > 0) {
      col.appendChild(this.createActionsEl(m.actions));
    }

    if (c.messages.showTimestamps && m.t) {
      const ts = document.createElement("div");
      ts.className = "ts";
      ts.textContent = new Date(m.t).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      col.appendChild(ts);
    }

    row.appendChild(col);
    return row;
  }

  private renderMsgs(typing = false) {
    const box = this.$("msgs");
    box.textContent = "";

    for (const m of this.msgs) {
      box.appendChild(this.row(m));
    }

    if (typing && this.cfg.persona.typingIndicator) {
      const d = document.createElement("div");
      d.className = "m assistant";
      d.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
      const dummy: Msg = { role: "assistant", content: "" };
      const row = document.createElement("div");
      row.className = "row assistant";
      const col = document.createElement("div");
      col.className = "col";
      col.appendChild(d);
      row.appendChild(col);
      box.appendChild(row);
    }
    box.scrollTop = box.scrollHeight;
  }

  private renderChips() {
    const show = this.msgs.length <= 1;
    this.$("chips").innerHTML = show
      ? this.cfg.behavior.suggestedQuestions
          .map(
            (q) =>
              `<button type="button" class="chip">${q.replace(/[&<>"]/g, (x) => `&#${x.charCodeAt(0)};`)}</button>`,
          )
          .join("")
      : "";
  }

  private setBusyUI(on: boolean) {
    const send = this.$("send") as HTMLButtonElement;
    const inp = this.$("inp") as HTMLTextAreaElement;
    send.toggleAttribute("disabled", on);
    inp.toggleAttribute("disabled", on);
    this.shadowRoot!.querySelector(".gx")!.toggleAttribute("data-busy", on);
    if (!on) inp.focus({ preventScroll: true });
  }

  private retryLast() {
    if (this.busy) return;
    const lastUser = [...this.msgs].reverse().find((m) => m.role === "user");
    if (lastUser) this.send(lastUser.content, true);
  }

  async send(text?: string, isRetry = false) {
    const inp = this.$("inp") as HTMLTextAreaElement,
      content = (text ?? inp.value).trim();
    if (this.busy || (!content && !isRetry)) return;

    if (isRetry) {
      if (this.msgs[this.msgs.length - 1]?.error) this.msgs.pop();
    } else {
      inp.value = "";
      inp.style.height = "40px";
      inp.style.overflowY = "hidden";
      this.msgs.push({ role: "user", content, t: Date.now() });
    }

    this.busy = true;
    this.setBusyUI(true);
    this.renderChips();
    this.renderMsgs(true);

    const history = this.msgs
      .filter((m, i) => !(i === 0 && m.role === "assistant"))
      .map(({ role, content }) => ({ role, content }));

    try {
      if (this.transport) {
        const reply = await this.transport(history);
        this.msgs.push({ role: "assistant", content: reply, t: Date.now() });
      } else {
        await this.streamReply(history);
      }

      if (this.cfg.behavior.soundOnReply) this.beep();
    } catch {
      this.msgs.push({
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        t: Date.now(),
        error: true,
      });
    }

    this.busy = false;
    this.setBusyUI(false);
    this.renderMsgs();
    this.saveChat();
  }

  /**
   * ⚡ Real-time SSE streaming parser with Live Reasoning, Tool Badges, and Action dispatch
   */
  private async streamReply(history: { role: string; content: string }[]) {
    const pageContext = extractLivePageContext();

    const response = await fetch(
      `${this.apiUrl}/copilot/${this.projectId}/stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          pageContext,
        }),
      },
    );

    if (!response.ok || !response.body) {
      throw new Error(`Stream failed (${response.status})`);
    }

    const assistantMsg: Msg = {
      role: "assistant",
      content: "",
      t: Date.now(),
      tools: [],
      actions: [],
    };
    this.msgs.push(assistantMsg);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payloadStr = trimmed.replace(/^data:\s*/, "");
        if (payloadStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(payloadStr);

          switch (parsed.type) {
            case "mode":
              this.pendingReason = parsed.reason;
              break;

            case "phase":
              if (parsed.phase === "reasoning_start") {
                assistantMsg.reasoning = {
                  label: parsed.label || "Reasoning through inquiry...",
                  reason: this.pendingReason,
                  text: "",
                  isActive: true,
                  startedAt: Date.now(),
                };
              } else if (
                parsed.phase === "reasoning_end" &&
                assistantMsg.reasoning
              ) {
                assistantMsg.reasoning.isActive = false;
                assistantMsg.reasoning.endedAt = Date.now();
              }
              break;

            case "thought":
              if (!assistantMsg.reasoning) {
                assistantMsg.reasoning = {
                  label: "Reasoning through inquiry...",
                  text: "",
                  isActive: true,
                  startedAt: Date.now(),
                };
              }
              assistantMsg.reasoning.text += parsed.delta;
              break;

            case "token":
              if (assistantMsg.reasoning && assistantMsg.reasoning.isActive) {
                assistantMsg.reasoning.isActive = false;
                assistantMsg.reasoning.endedAt = Date.now();
              }
              assistantMsg.content += parsed.delta;
              break;

            case "tool_start":
              assistantMsg.tools = assistantMsg.tools || [];
              assistantMsg.tools.push({
                tool: parsed.tool,
                label: parsed.label || "Operating platform...",
                args: parsed.args || {},
                status: "running",
                startedAt: Date.now(),
              });
              break;

            case "tool_end":
              if (assistantMsg.tools) {
                const target = [...assistantMsg.tools]
                  .reverse()
                  .find((t) => t.tool === parsed.tool);
                if (target) {
                  target.status = "done";
                  target.result = parsed.result;
                  target.endedAt = Date.now();
                }
              }
              break;

            case "suggested_actions":
              assistantMsg.actions = Array.isArray(parsed.payload)
                ? parsed.payload
                : [];
              break;

            case "action_confirmation_required":
              assistantMsg.confirmation = {
                payload: parsed.payload || {},
                status: "pending",
              };
              break;

            case "error":
              assistantMsg.content += `\n\n⚠️ ${parsed.message}`;
              break;
          }

          // Live update the transcript
          this.renderMsgs(false);
        } catch {
          if (payloadStr) {
            assistantMsg.content += payloadStr;
            this.renderMsgs(false);
          }
        }
      }
    }
  }
}
