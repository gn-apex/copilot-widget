// A small LaTeX → HTML renderer covering what chat models actually emit:
// fractions, roots, super/subscripts, Greek, operators, big operators, accents, \text, matrices, cases, aligned.
// Output uses CSS classes (.mf .mr .ms …) styled in styles.ts. Everything is escaped; nothing is evaluated.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SYM: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ϵ", varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ",
  iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", varpi: "ϖ", rho: "ρ", varrho: "ϱ", sigma: "σ",
  varsigma: "ς", tau: "τ", upsilon: "υ", phi: "ϕ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
  times: "×", cdot: "·", div: "÷", pm: "±", mp: "∓", ast: "∗", star: "⋆", circ: "∘", bullet: "•", oplus: "⊕", otimes: "⊗",
  leq: "≤", le: "≤", geq: "≥", ge: "≥", neq: "≠", ne: "≠", approx: "≈", equiv: "≡", sim: "∼", simeq: "≃", cong: "≅", propto: "∝",
  ll: "≪", gg: "≫", prec: "≺", succ: "≻",
  infty: "∞", partial: "∂", nabla: "∇", forall: "∀", exists: "∃", nexists: "∄", emptyset: "∅", varnothing: "∅", neg: "¬", lnot: "¬",
  land: "∧", wedge: "∧", lor: "∨", vee: "∨", cap: "∩", cup: "∪", subset: "⊂", supset: "⊃", subseteq: "⊆", supseteq: "⊇",
  in: "∈", notin: "∉", ni: "∋", setminus: "∖", angle: "∠", perp: "⊥", parallel: "∥", therefore: "∴", because: "∵",
  rightarrow: "→", to: "→", leftarrow: "←", gets: "←", leftrightarrow: "↔", Rightarrow: "⇒", Leftarrow: "⇐", Leftrightarrow: "⇔",
  implies: "⟹", iff: "⟺", mapsto: "↦", uparrow: "↑", downarrow: "↓", longrightarrow: "⟶", hookrightarrow: "↪",
  ldots: "…", dots: "…", cdots: "⋯", vdots: "⋮", ddots: "⋱", prime: "′", degree: "°", hbar: "ℏ", ell: "ℓ",
  Re: "ℜ", Im: "ℑ", aleph: "ℵ", langle: "⟨", rangle: "⟩", lfloor: "⌊", rfloor: "⌋", lceil: "⌈", rceil: "⌉",
  lbrace: "{", rbrace: "}", vert: "|", Vert: "‖", mid: "∣", backslash: "\\", checkmark: "✓", dagger: "†",
  mathbb: "", // handled as function
};
const BB: Record<string, string> = { R: "ℝ", N: "ℕ", Z: "ℤ", Q: "ℚ", C: "ℂ", P: "ℙ", E: "𝔼", H: "ℍ", F: "𝔽" };
const BIG: Record<string, string> = { sum: "∑", prod: "∏", coprod: "∐", int: "∫", iint: "∬", iiint: "∭", oint: "∮", bigcup: "⋃", bigcap: "⋂" };
const FUNCS = new Set([
  "sin", "cos", "tan", "cot", "sec", "csc", "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh", "log", "ln", "lg", "exp",
  "min", "max", "sup", "inf", "lim", "limsup", "liminf", "det", "dim", "ker", "gcd", "deg", "arg", "mod", "Pr", "argmax", "argmin",
]);
const SPACE: Record<string, string> = { ",": "\u2009", ";": "\u2005", ":": "\u2005", "!": "", " ": " ", quad: "\u2003", qquad: "\u2003\u2003", enspace: "\u2002" };

type P = { s: string; i: number };

function skipWs(p: P) {
  while (p.i < p.s.length && /\s/.test(p.s[p.i])) p.i++;
}

/** One "argument": a {group} or a single token (letter, digit, command). */
function arg(p: P): string {
  skipWs(p);
  if (p.i >= p.s.length) return "";
  if (p.s[p.i] === "{") {
    p.i++;
    return seq(p, "}");
  }
  if (p.s[p.i] === "\\") return one(p);
  const ch = p.s[p.i++];
  return atom(ch);
}

/** Raw text of a {group} (for \text, \begin{env}). */
function rawGroup(p: P): string {
  skipWs(p);
  if (p.s[p.i] !== "{") return p.s[p.i++] || "";
  let depth = 1;
  const start = ++p.i;
  while (p.i < p.s.length && depth) {
    const c = p.s[p.i++];
    if (c === "{") depth++;
    else if (c === "}") depth--;
  }
  return p.s.slice(start, p.i - 1);
}

const atom = (ch: string) =>
  /[a-zA-Z]/.test(ch) ? `<i class="mi">${ch}</i>` : /[0-9]/.test(ch) ? `<span class="mn">${ch}</span>` : `<span class="mo">${esc(ch)}</span>`;

function seq(p: P, until?: string): string {
  let out = "";
  while (p.i < p.s.length) {
    const c = p.s[p.i];
    if (until && c === until) {
      p.i++;
      return out;
    }
    if (c === "}") {
      p.i++;
      continue;
    }
    out += scripts(p, one(p));
  }
  return out;
}

/** Attach ^ and _ to the preceding base. */
function scripts(p: P, base: string): string {
  let sup = "";
  let sub = "";
  for (;;) {
    skipWs(p);
    const c = p.s[p.i];
    if (c === "^") {
      p.i++;
      sup = arg(p);
    } else if (c === "_") {
      p.i++;
      sub = arg(p);
    } else if (c === "'") {
      p.i++;
      sup += "′";
    } else break;
  }
  if (sup && sub) return `${base}<span class="mss"><sup>${sup}</sup><sub>${sub}</sub></span>`;
  if (sup) return `${base}<sup>${sup}</sup>`;
  if (sub) return `${base}<sub>${sub}</sub>`;
  return base;
}

function matrix(body: string, open: string, close: string, align = "c"): string {
  const rows = body.split(/\\\\/).map((r) => r.trim()).filter(Boolean);
  const html = rows
    .map((r) => `<tr>${r.split("&").map((c) => `<td>${math(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<span class="mmat" data-a="${align}">${open ? `<span class="mbr">${open}</span>` : ""}<table>${html}</table>${close ? `<span class="mbr">${close}</span>` : ""}</span>`;
}

function one(p: P): string {
  const s = p.s;
  const c = s[p.i];
  if (c === "{") {
    p.i++;
    return `<span class="mg">${seq(p, "}")}</span>`;
  }
  if (c !== "\\") {
    p.i++;
    if (c === "&") return "";
    if (c === "~") return "\u00a0";
    if (/\s/.test(c)) return "";
    if (c === "-") return `<span class="mo">−</span>`;
    if (/[=<>+*/|()[\],.;:!?±]/.test(c) || c === "%") return `<span class="mo">${esc(c)}</span>`;
    return atom(c);
  }
  // command
  p.i++;
  const m = /^[a-zA-Z]+/.exec(s.slice(p.i));
  if (!m) {
    const ch = s[p.i++] || "";
    if (ch === "\\") return `<br class="mbrk">`;
    if (ch in SPACE) return SPACE[ch];
    if ("{}%$#&_|".includes(ch)) return `<span class="mo">${esc(ch === "|" ? "‖" : ch)}</span>`;
    return esc(ch);
  }
  const name = m[0];
  p.i += name.length;

  switch (name) {
    case "frac":
    case "dfrac":
    case "tfrac": {
      const a = arg(p);
      const b = arg(p);
      return `<span class="mf"><span class="mfn">${a}</span><span class="mfd">${b}</span></span>`;
    }
    case "binom": {
      const a = arg(p);
      const b = arg(p);
      return `<span class="mbr">(</span><span class="mf nb"><span class="mfn">${a}</span><span class="mfd">${b}</span></span><span class="mbr">)</span>`;
    }
    case "sqrt": {
      skipWs(p);
      let idx = "";
      if (s[p.i] === "[") {
        const e = s.indexOf("]", p.i);
        if (e > 0) {
          idx = math(s.slice(p.i + 1, e));
          p.i = e + 1;
        }
      }
      return `<span class="mr">${idx ? `<sup class="mri">${idx}</sup>` : ""}<svg class="mrs" viewBox="0 0 10 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0.6 11.5 2.6 10 5 18.6 9.6 0.6" vector-effect="non-scaling-stroke"/></svg><span class="mrb">${arg(p)}</span></span>`;
    }
    case "text":
    case "mathrm":
    case "textrm":
    case "operatorname":
    case "mbox":
    case "mathsf":
    case "textsf":
      return `<span class="mt">${esc(rawGroup(p)).replace(/ /g, "\u00a0")}</span>`;
    case "textbf":
    case "mathbf":
    case "boldsymbol":
    case "bm":
      return `<b class="mb">${arg(p)}</b>`;
    case "mathit":
    case "textit":
      return `<i>${arg(p)}</i>`;
    case "mathcal":
    case "mathscr":
    case "mathfrak":
      return `<span class="mcal">${arg(p)}</span>`;
    case "mathbb": {
      const g = rawGroup(p).trim();
      return `<span class="mo">${BB[g] || esc(g)}</span>`;
    }
    case "overline":
    case "bar":
    case "widebar":
      return `<span class="mov">${arg(p)}</span>`;
    case "underline":
      return `<span class="mun">${arg(p)}</span>`;
    case "vec":
      return `<span class="mac" data-a="→">${arg(p)}</span>`;
    case "hat":
    case "widehat":
      return `<span class="mac" data-a="^">${arg(p)}</span>`;
    case "tilde":
    case "widetilde":
      return `<span class="mac" data-a="~">${arg(p)}</span>`;
    case "dot":
      return `<span class="mac" data-a="˙">${arg(p)}</span>`;
    case "ddot":
      return `<span class="mac" data-a="¨">${arg(p)}</span>`;
    case "boxed":
      return `<span class="mbx">${arg(p)}</span>`;
    case "cancel":
      return `<span class="mcx">${arg(p)}</span>`;
    case "left":
    case "right":
    case "big":
    case "Big":
    case "bigg":
    case "Bigg":
    case "bigl":
    case "bigr": {
      skipWs(p);
      if (s[p.i] === ".") {
        p.i++;
        return "";
      }
      if (s[p.i] === "\\") {
        const save = p.i;
        const mm = /^\\([a-zA-Z]+|.)/.exec(s.slice(p.i));
        if (mm) {
          const n = mm[1];
          if (n === "{" || n === "}" ) {
            p.i += 2;
            return `<span class="mbr">${n}</span>`;
          }
          if (n === "|") {
            p.i += 2;
            return `<span class="mbr">‖</span>`;
          }
          if (n in SYM && /^(langle|rangle|lfloor|rfloor|lceil|rceil|lbrace|rbrace|vert|Vert)$/.test(n)) {
            p.i += mm[0].length;
            return `<span class="mbr">${SYM[n]}</span>`;
          }
        }
        p.i = save;
        return "";
      }
      const d = s[p.i++] || "";
      return `<span class="mbr">${esc(d)}</span>`;
    }
    case "begin": {
      const env = rawGroup(p).replace(/\*$/, "");
      const endTag = `\\end{${env}`;
      let end = s.indexOf(endTag, p.i);
      if (end < 0) end = s.length;
      const body = s.slice(p.i, end);
      p.i = Math.min(s.length, end + endTag.length);
      if (s[p.i] === "*") p.i++;
      if (s[p.i] === "}") p.i++;
      switch (env) {
        case "pmatrix": return matrix(body, "(", ")");
        case "bmatrix": return matrix(body, "[", "]");
        case "Bmatrix": return matrix(body, "{", "}");
        case "vmatrix": return matrix(body, "|", "|");
        case "Vmatrix": return matrix(body, "‖", "‖");
        case "cases": return matrix(body, "{", "", "l");
        case "aligned":
        case "align":
        case "split":
        case "gather":
        case "array":
        case "eqnarray": return matrix(body, "", "", "r");
        default: return matrix(body, "", "");
      }
    }
    case "limits":
    case "nolimits":
    case "displaystyle":
    case "textstyle":
    case "scriptstyle":
    case "label":
    case "nonumber":
    case "notag":
      return "";
    case "not":
      return "";
  }

  if (name in BIG) return `<span class="mbig">${BIG[name]}</span>`;
  if (FUNCS.has(name)) return `<span class="mt mfn2">${name}</span>`;
  if (name in SYM && SYM[name]) {
    const isGreek = /^[α-ωΑ-Ω]$/.test(SYM[name]) || /^[ϵϑϖϱςϕ]$/.test(SYM[name]);
    return isGreek && name[0] === name[0].toLowerCase()
      ? `<i class="mi">${SYM[name]}</i>`
      : `<span class="mo">${SYM[name]}</span>`;
  }
  return `<span class="mt">${esc(name)}</span>`;
}

/** Render a TeX fragment to an HTML string. Never throws. */
export function math(tex: string): string {
  try {
    const p: P = { s: tex.trim(), i: 0 };
    let out = "";
    while (p.i < p.s.length) out += scripts(p, one(p));
    return out;
  } catch {
    return esc(tex);
  }
}

export const mathInline = (tex: string) => `<span class="math" role="math" aria-label="${esc(tex).replace(/"/g, "&quot;")}">${math(tex)}</span>`;
export const mathBlock = (tex: string) => `<div class="math-block" role="math" aria-label="${esc(tex).replace(/"/g, "&quot;")}"><div class="math">${math(tex)}</div></div>`;
