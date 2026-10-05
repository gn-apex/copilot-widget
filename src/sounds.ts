// Synthesised UI sounds. No audio files, no network: every sound is a few sine/triangle
// oscillators shaped by an envelope and softened by a low-pass filter.

export const SOUNDS = [
  { id: "chime", label: "Chime", hint: "Two soft rising notes" },
  { id: "pop", label: "Pop", hint: "A tiny bubble burst" },
  { id: "bubble", label: "Bubble", hint: "Glides upward" },
  { id: "glass", label: "Glass", hint: "Clear, airy shimmer" },
  { id: "marimba", label: "Marimba", hint: "Warm wooden pair" },
  { id: "droplet", label: "Droplet", hint: "Water drip" },
  { id: "harp", label: "Harp", hint: "Gentle arpeggio" },
  { id: "ping", label: "Ping", hint: "Single clean note" },
  { id: "bell", label: "Bell", hint: "Soft ringing bell" },
] as const;

export type SoundName = (typeof SOUNDS)[number]["id"];
export const SOUND_IDS = SOUNDS.map((s) => s.id) as SoundName[];

type Note = {
  f: number; // start frequency (Hz)
  t: number; // start offset (s)
  d: number; // duration (s)
  g?: number; // relative gain 0..1
  to?: number; // glide target frequency
  type?: OscillatorType;
  a?: number; // attack (s)
};

const P: Record<SoundName, Note[]> = {
  chime: [
    { f: 784, t: 0, d: 0.55, g: 0.9 },
    { f: 1175, t: 0.09, d: 0.75, g: 0.7 },
  ],
  pop: [{ f: 640, to: 170, t: 0, d: 0.13, g: 1, a: 0.003 }],
  bubble: [
    { f: 320, to: 920, t: 0, d: 0.17, g: 0.85 },
    { f: 480, to: 1250, t: 0.07, d: 0.15, g: 0.5 },
  ],
  glass: [
    { f: 1568, t: 0, d: 0.95, g: 0.5 },
    { f: 2349, t: 0, d: 0.7, g: 0.28 },
    { f: 3136, t: 0, d: 0.5, g: 0.12 },
  ],
  marimba: [
    { f: 523, t: 0, d: 0.34, g: 0.95, a: 0.003 },
    { f: 2092, t: 0, d: 0.07, g: 0.22, a: 0.002 },
    { f: 659, t: 0.12, d: 0.36, g: 0.85, a: 0.003 },
    { f: 2636, t: 0.12, d: 0.07, g: 0.2, a: 0.002 },
  ],
  droplet: [
    { f: 1500, to: 520, t: 0, d: 0.11, g: 0.9, a: 0.003 },
    { f: 900, to: 380, t: 0.13, d: 0.15, g: 0.4, a: 0.003 },
  ],
  harp: [523, 659, 784, 1047].map((f, i) => ({
    f,
    t: i * 0.07,
    d: 0.6,
    g: 0.7 - i * 0.05,
    type: "triangle" as OscillatorType,
  })),
  ping: [
    { f: 1319, t: 0, d: 0.85, g: 0.8, a: 0.004 },
    { f: 2638, t: 0, d: 0.4, g: 0.12 },
  ],
  bell: [
    { f: 880, t: 0, d: 1.25, g: 0.6 },
    { f: 2217, t: 0, d: 0.85, g: 0.25 },
    { f: 3520, t: 0, d: 0.5, g: 0.12 },
  ],
};

let ctx: AudioContext | undefined;

function context(): AudioContext | undefined {
  try {
    const A = window.AudioContext || (window as any).webkitAudioContext;
    if (!A) return undefined;
    ctx = ctx || new A();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return undefined;
  }
}

/** Call from a user gesture (click / keypress) so later sounds are allowed to play. */
export function unlockAudio() {
  context();
}

/** Play a sound. volume is 0..1. Never throws; silently does nothing if audio is blocked. */
export function playSound(name: SoundName, volume = 0.5) {
  try {
    const patch = P[name] || P.chime;
    const a = context();
    if (!a || a.state === "closed") return;
    const v = Math.max(0, Math.min(1, volume));
    if (v === 0) return;

    const master = a.createGain();
    master.gain.value = 0.22 * v;
    const lp = a.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 5200;
    lp.Q.value = 0.4;
    master.connect(lp).connect(a.destination);

    const t0 = a.currentTime + 0.01;
    for (const n of patch) {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = n.type || "sine";
      const s = t0 + n.t;
      o.frequency.setValueAtTime(n.f, s);
      if (n.to) o.frequency.exponentialRampToValueAtTime(n.to, s + n.d);
      const peak = Math.max(0.0002, n.g ?? 0.8);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(peak, s + (n.a ?? 0.012));
      g.gain.exponentialRampToValueAtTime(0.0001, s + n.d);
      o.connect(g).connect(master);
      o.start(s);
      o.stop(s + n.d + 0.05);
    }
  } catch {
    /* audio is optional */
  }
}
