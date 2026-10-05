// Detects whether the website the widget sits on is currently light or dark, and watches for changes.
//
// Order of evidence (first conclusive answer wins):
//   1. class names on <html>/<body>      next-themes (attribute="class"), Tailwind darkMode:"class", Docusaurus…
//   2. data-* attributes                  next-themes (attribute="data-theme"), Bootstrap 5.3 (data-bs-theme), DaisyUI…
//   3. inline/computed `color-scheme`     next-themes sets style="color-scheme: dark"
//   4. real background luminance          sites that do their own thing entirely
//   5. OS preference                      prefers-color-scheme

export type Scheme = "light" | "dark";

const ATTRS = [
  "data-theme",
  "data-mode",
  "data-color-mode",
  "data-color-scheme",
  "data-bs-theme",
  "data-appearance",
  "data-scheme",
  "data-ui-theme",
  "data-darkreader-scheme",
];

function fromWord(v: string | null | undefined): Scheme | null {
  if (!v) return null;
  const s = v.toLowerCase();
  // "light dark" (both) is not an answer; "dark-blue", "theme-dark", "night" are
  if (/\b(light|day)\b/.test(s) && /\b(dark|night)\b/.test(s)) return null;
  if (/(^|[^a-z])(dark|night|black)([^a-z]|$)/.test(s)) return "dark";
  if (/(^|[^a-z])(light|day|white)([^a-z]|$)/.test(s)) return "light";
  return null;
}

function fromClasses(el: Element | null): Scheme | null {
  if (!el) return null;
  let dark = false;
  let light = false;
  el.classList.forEach((c) => {
    const k = c.toLowerCase();
    if (k === "dark" || k === "dark-mode" || k === "dark-theme" || k === "theme-dark" || k === "night" || k.endsWith("-dark")) dark = true;
    else if (k === "light" || k === "light-mode" || k === "light-theme" || k === "theme-light" || k.endsWith("-light")) light = true;
  });
  return dark && !light ? "dark" : light && !dark ? "light" : null;
}

function luminance(rgb: string): number | null {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat);
  if (p.length < 3 || p.some((n) => !Number.isFinite(n))) return null;
  if (p.length >= 4 && p[3] < 0.5) return null; // transparent → no evidence
  const ch = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * ch(p[0]) + 0.7152 * ch(p[1]) + 0.0722 * ch(p[2]);
}

export function detectHostScheme(): Scheme {
  if (typeof document === "undefined") return "light";
  const html = document.documentElement;
  const body = document.body;

  // 1. classes
  const c = fromClasses(html) ?? fromClasses(body);
  if (c) return c;

  // 2. data attributes
  for (const el of [html, body]) {
    if (!el) continue;
    for (const a of ATTRS) {
      const v = fromWord(el.getAttribute(a));
      if (v) return v;
    }
  }

  // 3. color-scheme (inline first, because computed always inherits the UA default "normal")
  for (const el of [html, body]) {
    const inline = el?.style?.colorScheme;
    const v = fromWord(inline);
    if (v) return v;
  }
  try {
    const cs = getComputedStyle(html).colorScheme;
    const v = cs === "dark" ? "dark" : cs === "light" ? "light" : null;
    if (v) return v;
  } catch {
    /* ignore */
  }

  // 4. what the page actually looks like
  try {
    for (const el of [body, html]) {
      if (!el) continue;
      const L = luminance(getComputedStyle(el).backgroundColor);
      if (L !== null) return L < 0.32 ? "dark" : "light";
    }
  } catch {
    /* ignore */
  }

  // 5. OS
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Calls `cb` (rAF-throttled) whenever the host's theme could have changed. Returns an unsubscribe fn. */
export function watchHostScheme(cb: (s: Scheme) => void): () => void {
  if (typeof document === "undefined") return () => {};
  let last: Scheme | null = null;
  let raf = 0;
  const check = () => {
    raf = 0;
    const s = detectHostScheme();
    if (s !== last) {
      last = s;
      cb(s);
    }
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(check);
  };
  const mo = new MutationObserver(queue);
  const opts: MutationObserverInit = {
    attributes: true,
    attributeFilter: ["class", "style", ...ATTRS],
  };
  mo.observe(document.documentElement, opts);
  if (document.body) mo.observe(document.body, opts);
  else document.addEventListener("DOMContentLoaded", () => document.body && mo.observe(document.body, opts), { once: true });
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", queue);
  // Some sites swap theme via a late stylesheet; re-check once after load.
  addEventListener("load", queue, { once: true });
  check();
  return () => {
    mo.disconnect();
    mq.removeEventListener?.("change", queue);
    cancelAnimationFrame(raf);
  };
}
