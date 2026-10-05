// Attachments for multimodal models (Gemini / Gemma): images, PDFs, text and code files.
// Images are downscaled and re-encoded in the browser so a phone photo is ~200 KB instead of ~6 MB.

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: "image" | "file";
  /** base64 payload WITHOUT the data: prefix. Kept in memory only, never persisted. */
  data?: string;
  /** tiny preview (data URL). Safe to persist. */
  thumb?: string;
  /** object URL for the full preview. Memory only. */
  url?: string;
};

export type AcceptMode = "images" | "images-docs" | "any";

const IMG = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/heic", "image/heif", "image/svg+xml"];
const TEXT_EXT = "txt md markdown csv tsv json jsonl xml html htm css js mjs ts tsx jsx py java c h cpp hpp cs go rs sql yaml yml toml ini sh bash rb php kt swift log rtf tex vue svelte";
const TEXT_EXTS = new Set(TEXT_EXT.split(" "));

const extOf = (n: string) => (n.split(".").pop() || "").toLowerCase();

/** Value for <input type=file accept>. */
export function acceptAttr(mode: AcceptMode): string {
  if (mode === "images") return "image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif";
  if (mode === "images-docs")
    return `image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif,application/pdf,text/*,application/json,${TEXT_EXT.split(" ").map((e) => "." + e).join(",")}`;
  return "";
}

export function describeAccept(mode: AcceptMode): string {
  return mode === "images" ? "Images only" : mode === "images-docs" ? "Images, PDFs and text files" : "Any file";
}

/** Normalised mime (browsers report odd types for source files, e.g. .ts → video/mp2t). */
export function mimeOf(f: File): string {
  const ext = extOf(f.name);
  if (TEXT_EXTS.has(ext) && !f.type.startsWith("image/")) {
    if (ext === "json" || ext === "jsonl") return "application/json";
    if (ext === "csv" || ext === "tsv") return "text/csv";
    if (ext === "html" || ext === "htm") return "text/html";
    if (ext === "md" || ext === "markdown") return "text/markdown";
    return "text/plain";
  }
  return f.type || "application/octet-stream";
}

export function isAllowed(f: File, mode: AcceptMode): boolean {
  const mime = mimeOf(f);
  const isImg = IMG.includes(mime) || mime.startsWith("image/");
  if (mode === "any") return true;
  if (isImg) return true;
  if (mode === "images") return false;
  return mime === "application/pdf" || mime.startsWith("text/") || mime === "application/json";
}

export function humanSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1048576).toFixed(n < 10485760 ? 1 : 0)} MB`;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function readB64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error("Could not read the file"));
    r.onload = () => res(String(r.result).split(",")[1] || "");
    r.readAsDataURL(blob);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("decode"));
    im.src = url;
  });
}

const toBlob = (c: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob | null>((r) => c.toBlob(r, type, q));

async function processImage(f: File, maxBytes: number): Promise<Attachment> {
  const mime = mimeOf(f);
  const src = URL.createObjectURL(f);
  let img: HTMLImageElement | null = null;
  try {
    img = await loadImage(src);
  } catch {
    img = null;
  }

  // HEIC/HEIF can't be decoded outside Safari: pass the original bytes through untouched.
  if (!img) {
    URL.revokeObjectURL(src);
    if (/hei[cf]/.test(mime) && f.size <= maxBytes) {
      return { id: uid(), name: f.name, mime, size: f.size, kind: "image", data: await readB64(f) };
    }
    throw new Error(`“${f.name}” could not be opened as an image`);
  }

  const MAX = 1600;
  const w0 = img.naturalWidth || img.width;
  const h0 = img.naturalHeight || img.height;
  const scale = Math.min(1, MAX / Math.max(w0, h0));
  const keep = scale === 1 && f.size <= 1_200_000 && /^image\/(png|jpeg|webp)$/.test(mime);

  let blob: Blob = f;
  let outMime = mime;
  if (!keep) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w0 * scale));
    c.height = Math.max(1, Math.round(h0 * scale));
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff"; // JPEG has no alpha
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    const out = (await toBlob(c, "image/jpeg", 0.86)) || f;
    blob = out;
    outMime = out.type || "image/jpeg";
  }
  if (blob.size > maxBytes) {
    URL.revokeObjectURL(src);
    throw new Error(`“${f.name}” is too large (max ${humanSize(maxBytes)})`);
  }

  // tiny square thumbnail for the composer and for persisted history
  const T = 120;
  const tc = document.createElement("canvas");
  tc.width = tc.height = T;
  const tg = tc.getContext("2d")!;
  const side = Math.min(w0, h0);
  tg.fillStyle = "#fff";
  tg.fillRect(0, 0, T, T);
  tg.drawImage(img, (w0 - side) / 2, (h0 - side) / 2, side, side, 0, 0, T, T);
  const thumb = tc.toDataURL("image/jpeg", 0.72);

  URL.revokeObjectURL(src);
  const name = outMime !== mime && !/\.jpe?g$/i.test(f.name) ? f.name.replace(/\.[^.]+$/, "") + ".jpg" : f.name;
  return {
    id: uid(),
    name,
    mime: outMime,
    size: blob.size,
    kind: "image",
    data: await readB64(blob),
    thumb,
    url: URL.createObjectURL(blob),
  };
}

export async function processFile(f: File, maxBytes: number): Promise<Attachment> {
  const mime = mimeOf(f);
  if (mime.startsWith("image/") && mime !== "image/gif") return processImage(f, maxBytes);
  if (mime === "image/gif") {
    // Models want still images: take the first frame.
    return processImage(f, maxBytes);
  }
  if (f.size > maxBytes) throw new Error(`“${f.name}” is too large (max ${humanSize(maxBytes)})`);
  return { id: uid(), name: f.name, mime, size: f.size, kind: "file", data: await readB64(f) };
}

/** Strip heavy fields before saving to localStorage. */
export function lightweight(a: Attachment): Attachment {
  const { data: _d, url: _u, ...rest } = a;
  return rest;
}
