// Markdown → safe HTML for AI replies (Gemini / Gemma / GPT style output).
//
// Supported: headings, paragraphs, hard breaks, **bold**, *italic*, ***both***, ~~strike~~, ==highlight==, `code`,
// fenced code (``` and ~~~, with syntax highlighting, streaming-safe when unclosed), blockquotes (nested),
// GitHub-style callouts (> [!NOTE]), ordered / unordered / nested / task lists, GFM tables with alignment,
// horizontal rules, links, autolinks, images, LaTeX math ($…$, $$…$$, \(…\), \[…\], \begin{…}), a safe subset of
// inline HTML (<br> <kbd> <sup> <sub> <mark> <u> …) and backslash escapes.
//
// Safety: every character of input is escaped; only fixed markup is produced; URLs are limited to http(s)/mailto/tel.

import { mathBlock, mathInline } from "./math";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const COPY_SVG =
  '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const WRAP_SVG = '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h14a3 3 0 0 1 0 6h-4m0 0 2-2m-2 2 2 2M3 18h5"/></svg>';

/* ───────────────────────── syntax highlighting ───────────────────────── */

const words = (s: string) => new Set(s.split(/\s+/));
const KW_JS = words(
  "async await break case catch class const continue debugger default delete do else enum export extends finally for from function get if implements import in instanceof interface let new of package private protected public return set static super switch this throw try type typeof var void while with yield as readonly abstract declare namespace null true false undefined NaN Infinity",
);
const KW_PY = words(
  "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield None True False self cls match case",
);
const KW_C = words(
  "auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while class public private protected virtual new delete this template typename namespace using try catch throw nullptr true false bool string var val fun func fn let mut impl trait pub use mod match loop where self Self super crate in is as import package interface extends implements final abstract override throws synchronized boolean byte null foreach readonly async await yield defer go chan map range select fallthrough type nil object data sealed lateinit when init constructor",
);
const KW_SQL = words(
  "select from where and or not in is null like between join left right inner outer full cross on group by order having limit offset insert into values update set delete create table alter drop index view primary key foreign references unique default distinct as union all exists case when then else end count sum avg min max asc desc with returning",
);
const KW_SH = words(
  "if then else elif fi for while do done case esac function in return exit export local echo cd ls cat grep sed awk sudo apt npm npx yarn pnpm git docker curl wget chmod mkdir rm cp mv source alias unset set read test true false pip python node make kubectl",
);

type Spec = { re: RegExp; kw?: Set<string>; ci?: boolean; json?: boolean };

const STR_C = `"(?:\\\\.|[^"\\\\\\n])*"?|'(?:\\\\.|[^'\\\\\\n])*'?`;
const NUM = `\\b(?:0x[\\da-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\b`;
const WORD = `[A-Za-z_$][\\w$]*`;
const mk = (comment: string, str: string, extra = "") =>
  new RegExp(`(?<c>${comment})|(?<s>${str})|${extra}(?<n>${NUM})|(?<w>${WORD})`, "g");

const SPECS: Record<string, Spec> = {
  js: { re: mk(`//[^\\n]*|/\\*[\\s\\S]*?(?:\\*/|$)`, `${STR_C}|\`(?:\\\\.|[^\`\\\\])*\`?`), kw: KW_JS },
  c: { re: mk(`//[^\\n]*|/\\*[\\s\\S]*?(?:\\*/|$)|^[ \\t]*#[a-z]+[^\\n]*`, STR_C), kw: KW_C },
  py: {
    re: mk(`#[^\\n]*`, `"""[\\s\\S]*?(?:"""|$)|'''[\\s\\S]*?(?:'''|$)|${STR_C}`, `(?<d>@[\\w.]+)|`),
    kw: KW_PY,
  },
  sh: { re: mk(`#[^\\n]*`, STR_C, `(?<d>\\$\\{?[\\w]+\\}?|--?[a-zA-Z][\\w-]*)|`), kw: KW_SH },
  sql: { re: mk(`--[^\\n]*|/\\*[\\s\\S]*?(?:\\*/|$)`, `'(?:''|[^'])*'?|"[^"]*"?`), kw: KW_SQL, ci: true },
  json: {
    re: new RegExp(`(?<k>"(?:\\\\.|[^"\\\\\\n])*"(?=\\s*:))|(?<s>"(?:\\\\.|[^"\\\\\\n])*"?)|(?<n>-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)|(?<w>true|false|null)`, "g"),
    json: true,
  },
  yaml: {
    re: new RegExp(`(?<c>#[^\\n]*)|(?<s>${STR_C})|(?<k>^[ \\t-]*[\\w.\\-"]+(?=\\s*:))|(?<n>${NUM})|(?<w>true|false|null|yes|no)`, "gm"),
  },
  css: {
    re: new RegExp(
      `(?<c>/\\*[\\s\\S]*?(?:\\*/|$))|(?<s>${STR_C})|(?<d>@[\\w-]+)|(?<k>[\\w-]+(?=\\s*:(?!:)))|(?<n>#[\\da-fA-F]{3,8}\\b|-?\\d*\\.?\\d+(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?)`,
      "g",
    ),
  },
  html: {
    re: new RegExp(
      `(?<c><!--[\\s\\S]*?(?:-->|$))|(?<t></?[\\w:-]+)|(?<k>[\\w:@.-]+(?==))|(?<s>${STR_C})`,
      "g",
    ),
  },
};

const ALIAS: Record<string, string> = {
  javascript: "js", jsx: "js", ts: "js", tsx: "js", typescript: "js", mjs: "js", node: "js", json5: "json", jsonc: "json",
  python: "py", python3: "py", py3: "py",
  bash: "sh", shell: "sh", zsh: "sh", console: "sh", terminal: "sh", powershell: "sh", ps1: "sh", cmd: "sh",
  java: "c", kotlin: "c", kt: "c", cpp: "c", "c++": "c", cc: "c", cs: "c", csharp: "c", go: "c", golang: "c", rust: "c", rs: "c",
  swift: "c", php: "c", dart: "c", scala: "c", objc: "c", h: "c", hpp: "c", glsl: "c", solidity: "c",
  postgres: "sql", postgresql: "sql", mysql: "sql", sqlite: "sql", plsql: "sql",
  yml: "yaml", toml: "yaml", ini: "yaml", env: "yaml",
  scss: "css", sass: "css", less: "css",
  xml: "html", svg: "html", vue: "html", svelte: "html", jsp: "html",
};

const LANG_LABEL: Record<string, string> = {
  js: "JavaScript", javascript: "JavaScript", ts: "TypeScript", typescript: "TypeScript", tsx: "TSX", jsx: "JSX",
  py: "Python", python: "Python", sh: "Shell", bash: "Bash", zsh: "Zsh", sql: "SQL", json: "JSON", yaml: "YAML", yml: "YAML",
  html: "HTML", css: "CSS", scss: "SCSS", cpp: "C++", cs: "C#", csharp: "C#", go: "Go", rs: "Rust", rust: "Rust", java: "Java",
  kt: "Kotlin", kotlin: "Kotlin", php: "PHP", swift: "Swift", md: "Markdown", markdown: "Markdown", xml: "XML", toml: "TOML",
  dockerfile: "Dockerfile", diff: "Diff", text: "Text", txt: "Text", plaintext: "Text", c: "C", dart: "Dart", ruby: "Ruby", rb: "Ruby",
};

function highlight(code: string, lang: string): string {
  const key = lang.toLowerCase();
  const spec = SPECS[ALIAS[key] || key];
  if (!spec) {
    if (key === "diff" || key === "patch") {
      return code
        .split("\n")
        .map((l) => {
          const e = esc(l);
          return l.startsWith("+") && !l.startsWith("+++")
            ? `<span class="tk-add">${e}</span>`
            : l.startsWith("-") && !l.startsWith("---")
              ? `<span class="tk-del">${e}</span>`
              : l.startsWith("@@")
                ? `<span class="tk-d">${e}</span>`
                : e;
        })
        .join("\n");
    }
    return esc(code);
  }
  let out = "";
  let last = 0;
  spec.re.lastIndex = 0;
  for (const m of code.matchAll(spec.re)) {
    const i = m.index ?? 0;
    if (i > last) out += esc(code.slice(last, i));
    const g = m.groups || {};
    const text = m[0];
    let cls = "";
    if (g.c) cls = "c";
    else if (g.s) cls = "s";
    else if (g.k) cls = "p";
    else if (g.d) cls = "d";
    else if (g.t) cls = "t";
    else if (g.n) cls = "n";
    else if (g.w) {
      const w = spec.ci ? text.toLowerCase() : text;
      if (spec.json) cls = "k";
      else if (spec.kw?.has(w)) cls = "k";
      else if (/^[ \t]*\(/.test(code.slice(i + text.length, i + text.length + 4))) cls = "f";
      else if (/^[A-Z][a-z]/.test(text)) cls = "t";
      else if (/^(true|false|null|yes|no)$/.test(text)) cls = "k";
    }
    out += cls ? `<span class="tk-${cls}">${esc(text)}</span>` : esc(text);
    last = i + text.length;
  }
  return out + esc(code.slice(last));
}

function codeBlock(lang: string, code: string): string {
  const l = lang.trim();
  const label = LANG_LABEL[l.toLowerCase()] || (l ? l : "Code");
  return (
    `<div class="code-block"><div class="code-header"><span class="code-lang">${esc(label)}</span>` +
    `<span class="code-actions"><button type="button" class="code-wrap" title="Wrap lines" aria-label="Wrap lines">${WRAP_SVG}</button>` +
    `<button type="button" class="code-copy" aria-label="Copy code">${COPY_SVG}<span>Copy</span></button></span></div>` +
    `<pre><code>${highlight(code.replace(/\n$/, ""), l)}</code></pre></div>`
  );
}

/* ───────────────────────── inline ───────────────────────── */

const OPEN = "\uE000";
const CLOSE = "\uE001";

function safeUrl(u: string): string | null {
  const url = u.trim().replace(/^<|>$/g, "");
  return /^(https?:\/\/|mailto:|tel:)/i.test(url) ? url : null;
}

const INLINE_TAGS = /<(\/?)(br|kbd|sup|sub|mark|u|b|i|em|strong|s|del|small|abbr)\s*\/?>/gi;

function inline(src: string): string {
  const stash: string[] = [];
  const keep = (html: string) => OPEN + (stash.push(html) - 1) + CLOSE;
  let t = src.replace(/[\uE000\uE001]/g, "");

  // 1. code spans
  t = t.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) =>
    keep(`<code class="inline-code">${esc(code.replace(/^ (.*) $/, "$1"))}</code>`),
  );

  // 2. math
  t = t.replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => keep(mathInline(m)));
  t = t.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => keep(`<span class="math-disp">${mathInline(m)}</span>`));
  t = t.replace(/(?<![\\$\w])\$(?![\s$])((?:\\.|[^$\\\n])+?)(?<![\s\\])\$(?![\w$])/g, (all, m) =>
    /^[\d.,\s]*$/.test(m) ? all : keep(mathInline(m)),
  );

  // 3. backslash escapes
  t = t.replace(/\\([\\`*_{}[\]()#+\-.!|~>$<])/g, (_, c) => keep(esc(c)));

  // 4. safe inline HTML (only if the tags are balanced, so nothing can leak out of this fragment)
  const balance: Record<string, number> = {};
  for (const m of t.matchAll(INLINE_TAGS)) {
    const n = m[2].toLowerCase();
    if (n === "br") continue;
    balance[n] = (balance[n] || 0) + (m[1] ? -1 : 1);
  }
  t = t.replace(INLINE_TAGS, (_, slash, name) => {
    const n = name.toLowerCase();
    if (n === "br") return keep("<br>");
    return balance[n] === 0 ? keep(`<${slash}${n}>`) : _;
  });

  // 5. images
  t = t.replace(/!\[([^\]]*)\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+"([^"]*)")?\s*\)/g, (all, alt, url, title) => {
    const u = safeUrl(url);
    if (!u || !/^https?:/i.test(u)) return all;
    return keep(
      `<img class="md-img" src="${esc(u)}" alt="${esc(alt)}"${title ? ` title="${esc(title)}"` : ""} loading="lazy" referrerpolicy="no-referrer">`,
    );
  });

  // 6. links  [text](url "title")
  t = t.replace(/\[([^\]]+)\]\(\s*(<[^>]+>|[^\s)]+(?:\([^\s)]*\))?[^\s)]*)(?:\s+"([^"]*)")?\s*\)/g, (all, text, url, title) => {
    const u = safeUrl(url);
    if (!u) return all;
    return keep(
      `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow"${title ? ` title="${esc(title)}"` : ""}>${inline(text)}</a>`,
    );
  });

  // 7. autolinks <https://…> and bare URLs
  t = t.replace(/<((?:https?:\/\/|mailto:)[^\s<>]+)>/gi, (_, u) =>
    keep(`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow">${esc(u)}</a>`),
  );
  t = t.replace(/(^|[\s(>])((?:https?:\/\/)[^\s<>"']+)/gi, (_, pre, u) => {
    const m = /[.,;:!?)\]}]+$/.exec(u);
    const trail = m ? m[0] : "";
    const clean = trail ? u.slice(0, -trail.length) : u;
    return `${pre}${keep(`<a href="${esc(clean)}" target="_blank" rel="noopener noreferrer nofollow">${esc(clean)}</a>`)}${trail}`;
  });

  // 8. escape what is left, then emphasis
  t = esc(t);
  t = t.replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, "<strong><em>$1</em></strong>");
  t = t.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?![\w])/g, "$1<strong>$2</strong>");
  t = t.replace(/\*(?=[^\s*])([^*\n]*?[^\s*])\*(?!\*)/g, "<em>$1</em>");
  t = t.replace(/(^|[^\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?![\w])/g, "$1<em>$2</em>");
  t = t.replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<del>$1</del>");
  t = t.replace(/==(?=\S)([\s\S]*?\S)==/g, "<mark>$1</mark>");

  // 9. restore (stash entries may themselves contain tokens)
  const re = new RegExp(`${OPEN}(\\d+)${CLOSE}`, "g");
  for (let i = 0; i < 4 && re.test(t); i++) {
    re.lastIndex = 0;
    t = t.replace(re, (_, n) => stash[+n] ?? "");
  }
  return t;
}

/* ───────────────────────── blocks ───────────────────────── */

const RE_FENCE = /^(\s*)(`{3,}|~{3,})\s*([^\s`]*)[^`]*$/;
const RE_HEAD = /^\s{0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const RE_HR = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const RE_LI = /^(\s*)([-*+•]|\d{1,9}[.)])(\s+)(.*)$/;
const RE_QUOTE = /^\s{0,3}>\s?/;
const RE_TDELIM = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
const RE_MATH_ENV = /^\s*\\begin\{(equation\*?|align\*?|aligned|gather\*?|multline\*?|eqnarray\*?|split|matrix|pmatrix|bmatrix|cases|array)\}/;
const ALERTS: Record<string, [string, string]> = {
  note: ["note", "Note"], info: ["note", "Info"], tip: ["tip", "Tip"], success: ["tip", "Success"], important: ["important", "Important"],
  warning: ["warning", "Warning"], caution: ["danger", "Caution"], danger: ["danger", "Danger"],
};

const isBlank = (l: string) => !l.trim();
const indentOf = (l: string) => l.length - l.trimStart().length;
const startsBlock = (l: string) => RE_HEAD.test(l) || RE_FENCE.test(l) || RE_HR.test(l) || RE_QUOTE.test(l) || /^\s*(\$\$|\\\[)/.test(l);

function splitRow(row: string): string[] {
  let r = row.trim();
  if (r.startsWith("|")) r = r.slice(1);
  if (r.endsWith("|") && !r.endsWith("\\|")) r = r.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < r.length; i++) {
    if (r[i] === "\\" && r[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (r[i] === "|") {
      cells.push(cur);
      cur = "";
    } else cur += r[i];
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function table(head: string, delim: string, rows: string[]): string {
  const al = splitRow(delim).map((c) => (/^:-+:$/.test(c) ? "center" : /-:$/.test(c) ? "right" : /^:-/.test(c) ? "left" : ""));
  const cell = (tag: string, c: string, i: number) =>
    `<${tag}${al[i] ? ` style="text-align:${al[i]}"` : ""}>${inline(c)}</${tag}>`;
  const hc = splitRow(head);
  return (
    `<div class="tbl-wrap"><table><thead><tr>${hc.map((c, i) => cell("th", c, i)).join("")}</tr></thead>` +
    `<tbody>${rows
      .map((r) => {
        const cs = splitRow(r);
        while (cs.length < hc.length) cs.push("");
        return `<tr>${cs.slice(0, Math.max(hc.length, 1)).map((c, i) => cell("td", c, i)).join("")}</tr>`;
      })
      .join("")}</tbody></table></div>`
  );
}

function list(lines: string[], start: number, tight0: boolean): { html: string; next: number } {
  const first = RE_LI.exec(lines[start])!;
  const base = first[1].length;
  const ordered = /\d/.test(first[2][0]);
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const items: string[] = [];
  let loose = false;
  let k = start;

  while (k < lines.length) {
    const m = RE_LI.exec(lines[k]);
    if (!m || Math.abs(m[1].length - base) > 1 || /\d/.test(m[2][0]) !== ordered) break;
    const ind = m[1].length;
    const kids: string[] = [];
    let j = k + 1;
    let blankInside = false;
    let task: boolean | null = null;
    let head = m[4];
    const tm = /^\[( |x|X)\]\s+([\s\S]*)$/.exec(head);
    if (tm) {
      task = tm[1] !== " ";
      head = tm[2];
    }

    while (j < lines.length) {
      const ln = lines[j];
      if (isBlank(ln)) {
        let q = j + 1;
        while (q < lines.length && isBlank(lines[q])) q++;
        if (q >= lines.length) {
          j = q;
          break;
        }
        const nxt = lines[q];
        if (indentOf(nxt) > ind + 1) {
          kids.push("");
          blankInside = true;
          j = q;
          continue;
        }
        const nm = RE_LI.exec(nxt);
        if (nm && Math.abs(nm[1].length - base) <= 1 && /\d/.test(nm[2][0]) === ordered) loose = true;
        j = q;
        break;
      }
      if (indentOf(ln) > ind + 1) {
        kids.push(ln);
        j++;
        continue;
      }
      if (RE_LI.test(ln) || startsBlock(ln)) break;
      if (blankInside) break;
      kids.push(ln); // lazy continuation
      j++;
    }

    const min = Math.min(...kids.filter((l) => l.trim()).map(indentOf), 1e9);
    const body = [head, ...kids.map((l) => (min < 1e9 ? l.slice(Math.min(min, indentOf(l))) : l))];
    const useTight = tight0 && !loose && !blankInside;
    let inner = blocks(body, useTight);
    if (task !== null) inner = `<span class="cb${task ? " on" : ""}" aria-hidden="true"></span>${inner}`;
    items.push(`<li${task !== null ? ' class="task"' : ""}>${inner}</li>`);
    k = j;
  }
  const tag = ordered ? "ol" : "ul";
  const attr = ordered && startNum !== 1 ? ` start="${startNum}"` : "";
  return { html: `<${tag}${attr}>${items.join("")}</${tag}>`, next: k };
}

function blocks(lines: string[], tight = false): string {
  const out: string[] = [];
  let i = 0;
  const paras: string[] = [];
  const flush = () => {
    if (!paras.length) return;
    const html = paras.map((l) => inline(l.trim())).join("<br>");
    out.push(tight ? `<span class="t">${html}</span>` : `<p>${html}</p>`);
    paras.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      flush();
      i++;
      continue;
    }

    // fenced code
    let m = RE_FENCE.exec(line);
    if (m) {
      flush();
      const [, ind, fence, lang] = m;
      const buf: string[] = [];
      i++;
      while (i < lines.length) {
        const cl = lines[i].trim();
        if (cl.startsWith(fence[0].repeat(fence.length)) && /^[`~]+$/.test(cl)) {
          i++;
          break;
        }
        buf.push(lines[i].startsWith(ind) ? lines[i].slice(ind.length) : lines[i].trimStart());
        i++;
      }
      out.push(codeBlock(lang, buf.join("\n")));
      continue;
    }

    // display math
    const mathOpen = /^\s*(\$\$|\\\[)(.*)$/.exec(line);
    if (mathOpen) {
      const close = mathOpen[1] === "$$" ? "$$" : "\\]";
      const rest = mathOpen[2];
      const ci = rest.indexOf(close);
      if (ci >= 0) {
        flush();
        out.push(mathBlock(rest.slice(0, ci)));
        i++;
        continue;
      }
      let j = i + 1;
      const buf = [rest];
      let done = false;
      while (j < lines.length) {
        const k2 = lines[j].indexOf(close);
        if (k2 >= 0) {
          buf.push(lines[j].slice(0, k2));
          done = true;
          j++;
          break;
        }
        buf.push(lines[j]);
        j++;
      }
      if (done) {
        flush();
        out.push(mathBlock(buf.join("\n")));
        i = j;
        continue;
      }
    }
    const env = RE_MATH_ENV.exec(line);
    if (env) {
      const endTag = `\\end{${env[1]}}`;
      let j = i;
      const buf: string[] = [];
      let done = false;
      while (j < lines.length) {
        buf.push(lines[j]);
        if (lines[j].includes(endTag)) {
          done = true;
          j++;
          break;
        }
        j++;
      }
      if (done) {
        flush();
        out.push(mathBlock(buf.join("\n")));
        i = j;
        continue;
      }
    }

    // heading
    m = RE_HEAD.exec(line);
    if (m) {
      flush();
      const lvl = m[1].length;
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
      i++;
      continue;
    }

    // hr
    if (RE_HR.test(line)) {
      flush();
      out.push("<hr>");
      i++;
      continue;
    }

    // table
    if (line.includes("|") && i + 1 < lines.length && RE_TDELIM.test(lines[i + 1]) && lines[i + 1].includes("-") && (lines[i + 1].includes("|") || line.trim().startsWith("|"))) {
      flush();
      const rows: string[] = [];
      let j = i + 2;
      while (j < lines.length && !isBlank(lines[j]) && lines[j].includes("|")) rows.push(lines[j++]);
      out.push(table(line, lines[i + 1], rows));
      i = j;
      continue;
    }

    // blockquote / callout
    if (RE_QUOTE.test(line)) {
      flush();
      const buf: string[] = [];
      while (i < lines.length && (RE_QUOTE.test(lines[i]) || (buf.length && !isBlank(lines[i]) && !startsBlock(lines[i]) && !RE_LI.test(lines[i])))) {
        buf.push(lines[i].replace(RE_QUOTE, ""));
        i++;
      }
      const al = /^\s*\[!(\w+)\]\s*(.*)$/.exec(buf[0] || "");
      if (al && ALERTS[al[1].toLowerCase()]) {
        const [kind, title] = ALERTS[al[1].toLowerCase()];
        const rest = al[2] ? [al[2], ...buf.slice(1)] : buf.slice(1);
        out.push(`<div class="callout c-${kind}"><div class="callout-t">${title}</div>${blocks(rest)}</div>`);
      } else out.push(`<blockquote>${blocks(buf)}</blockquote>`);
      continue;
    }

    // list (a bullet may interrupt a paragraph; "N." only if N is 1 or the line above ended with ':')
    const lm = RE_LI.exec(line);
    if (lm) {
      const num = /^\d+/.exec(lm[2]);
      const prev = paras[paras.length - 1] || "";
      const canInterrupt = !paras.length || !num || num[0] === "1" || /[:：]\s*$/.test(prev);
      if (canInterrupt) {
        flush();
        const r = list(lines, i, true);
        out.push(r.html);
        i = r.next;
        continue;
      }
    }

    paras.push(line);
    i++;
  }
  flush();
  // a tight item with a single paragraph and nothing else renders as bare inline text
  if (tight && out.length === 1 && out[0].startsWith('<span class="t">')) return out[0].slice(16, -7);
  return out.join("");
}

/** Convert markdown to sanitized HTML. Never throws. */
export function renderMarkdown(raw: string): string {
  if (!raw) return "";
  try {
    const text = raw.replace(/\r\n?/g, "\n").replace(/\t/g, "    ");
    return blocks(text.split("\n"));
  } catch {
    return `<p>${esc(raw)}</p>`;
  }
}

