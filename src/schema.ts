// The ONE contract shared by: widget runtime, playground designer, backend storage, customer dashboard.
export interface WidgetSchema {
  version: 1;
  theme: {
    mode: "light" | "dark" | "system";
    primaryColor: string;
    accentColor: string;
    radius: number;
    font: string;
    density: "compact" | "comfortable" | "spacious";
    glass: boolean;
    shadow: "none" | "soft" | "medium" | "bold";
  };
  launcher: {
    show: boolean;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    shape: "rounded" | "circle" | "pill" | "square";
    size: number;
    icon: "chat" | "sparkles" | "bot" | "help" | "message" | "wave" | "custom";
    customIconUrl: string;
    label: string; // empty = icon only
    offsetX: number;
    offsetY: number;
    pulse: boolean;
    /** Optional colour overrides — empty string = use brand colour / auto contrast */
    bg: string;
    color: string;
    gradient: boolean;
    glow: boolean;
    /** Icon box size in px */
    iconSize: number;
    /** Horizontal padding (px) when a label is showing */
    padding: number;
    labelPosition: "after" | "before";
    labelMode: "always" | "hover";
    labelSize: number;
    /** Swap the icon for a close ✕ while the window is open (label folds away) */
    closeIconWhenOpen: boolean;
    /** auto = hide when the window would cover the button */
    hideWhenOpen: "auto" | "always" | "never";
  };
  presentation: {
    /** Desktop / default mode */
    mode: "panel" | "drawer" | "sheet" | "dialog" | "popover" | "fullscreen";
    /** Override when viewport is mobile-sized */
    mobileMode: "auto" | "sheet" | "fullscreen" | "drawer" | "panel";
    /** Drawer side when mode=drawer */
    drawerSide: "right" | "left" | "bottom";
    /** Backdrop dim + blur behind overlay modes */
    backdrop: boolean;
    backdropBlur: boolean;
    /** Close on outside click / escape */
    closeOnOutside: boolean;
    closeOnEscape: boolean;
    animation: "fade" | "slide" | "scale" | "spring";
  };
  panel: {
    width: number;
    height: number;
    showBranding: boolean;
    headerStyle: "gradient" | "solid" | "minimal" | "glass";
    showHeader: boolean;
    /** Window body background. Empty colours = neutral default for the current appearance */
    bgType: "solid" | "gradient" | "image";
    bg: string;
    bg2: string;
    gradientAngle: number;
    bgImageUrl: string;
    bgImageDim: number;
    textColor: string;
    borderColor: string;
    borderWidth: number;
    headerBg: string;
    headerText: string;
    composerBg: string;
    inputBg: string;
  };
  persona: {
    name: string;
    subtitle: string;
    avatarUrl: string;
    greeting: string;
    typingIndicator: boolean;
  };
  behavior: {
    placeholder: string;
    suggestedQuestions: string[];
    autoOpenAfterSeconds: number;
    soundOnReply: boolean;
    persistChat: boolean;
  };
  messages: {
    bubbleStyle: "rounded" | "soft" | "sharp" | "bubble";
    showTimestamps: boolean;
    userAlign: "right" | "left";
    userBg: string;
    userText: string;
    aiBg: string;
    aiText: string;
    aiBorder: boolean;
    fontSize: number;
    maxWidth: number;
    showAvatar: boolean;
  };
  customCss: string;
}

export type PartialSchema = {
  [K in keyof WidgetSchema]?: WidgetSchema[K] extends object
    ? Partial<WidgetSchema[K]>
    : WidgetSchema[K];
};

// ★ THE DEFAULT DESIGN — edit these values to change what every new project looks like.
export const DEFAULTS: WidgetSchema = {
  version: 1,
  theme: {
    mode: "dark",
    primaryColor: "#06b6d4",
    accentColor: "#22d3ee",
    radius: 18,
    font: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    density: "comfortable",
    glass: false,
    shadow: "medium",
  },
  launcher: {
    show: true,
    position: "bottom-right",
    shape: "rounded",
    size: 58,
    icon: "chat",
    customIconUrl: "",
    label: "",
    offsetX: 20,
    offsetY: 20,
    pulse: false,
    bg: "",
    color: "",
    gradient: true,
    glow: true,
    iconSize: 26,
    padding: 18,
    labelPosition: "after",
    labelMode: "always",
    labelSize: 13,
    closeIconWhenOpen: true,
    hideWhenOpen: "auto",
  },
  presentation: {
    mode: "panel",
    mobileMode: "auto",
    drawerSide: "right",
    backdrop: false, // no page overlay by default: visitors can keep using the site while chatting
    backdropBlur: false,
    closeOnOutside: false,
    closeOnEscape: true,
    animation: "spring",
  },
  panel: {
    width: 400,
    height: 620,
    showBranding: true,
    headerStyle: "gradient",
    showHeader: true,
    bgType: "solid",
    bg: "",
    bg2: "",
    gradientAngle: 160,
    bgImageUrl: "",
    bgImageDim: 80,
    textColor: "",
    borderColor: "",
    borderWidth: 1,
    headerBg: "",
    headerText: "",
    composerBg: "",
    inputBg: "",
  },
  persona: {
    name: "AI Assistant",
    subtitle: "Typically replies instantly",
    avatarUrl: "",
    greeting: "Hi! How can I help you today?",
    typingIndicator: true,
  },
  behavior: {
    placeholder: "Ask anything…",
    suggestedQuestions: [],
    autoOpenAfterSeconds: 0,
    soundOnReply: false,
    persistChat: false,
  },
  messages: {
    bubbleStyle: "soft",
    showTimestamps: false,
    userAlign: "right",
    userBg: "",
    userText: "",
    aiBg: "",
    aiText: "",
    aiBorder: false,
    fontSize: 13.5,
    maxWidth: 85,
    showAvatar: false,
  },
  customCss: "",
};

const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
  (allowed as readonly string[]).includes(v as string) ? (v as T) : d;
const num = (v: unknown, d: number, min: number, max: number) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const str = (v: unknown, d: string, max = 500) =>
  typeof v === "string" && v.trim() ? v.slice(0, max) : d;
const hex = (v: unknown, d: string) =>
  typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : d;
const hexOpt = (v: unknown) =>
  typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())
    ? v.trim()
    : "";
const url = (v: unknown) =>
  typeof v === "string" && /^https?:\/\//i.test(v.trim())
    ? v.trim().slice(0, 500)
    : "";
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);

/** Defaults + validation + legacy mapping. Never throws; bad values fall back to defaults. */
export function resolve(input: any = {}): WidgetSchema {
  const d = DEFAULTS;
  const t = input.theme ?? {};
  const l = input.launcher ?? {};
  const p = input.panel ?? {};
  const pe = input.persona ?? {};
  const b = input.behavior ?? {};
  const pr = input.presentation ?? {};
  const m = input.messages ?? {};

  return {
    version: 1,
    theme: {
      mode: pick(t.mode, ["light", "dark", "system"] as const, d.theme.mode),
      primaryColor: hex(t.primaryColor, d.theme.primaryColor),
      accentColor: hex(t.accentColor ?? t.primaryColor, d.theme.accentColor),
      radius: num(t.radius ?? t.borderRadius, d.theme.radius, 0, 40),
      font: str(t.font, d.theme.font, 200),
      density: pick(
        t.density,
        ["compact", "comfortable", "spacious"] as const,
        d.theme.density,
      ),
      glass: bool(t.glass, d.theme.glass),
      shadow: pick(
        t.shadow,
        ["none", "soft", "medium", "bold"] as const,
        d.theme.shadow,
      ),
    },
    launcher: {
      show: (l.show ?? b.showLauncher ?? d.launcher.show) !== false,
      position: pick(
        l.position ?? t.position,
        ["bottom-right", "bottom-left", "top-right", "top-left"] as const,
        d.launcher.position,
      ),
      shape: pick(
        l.shape,
        ["rounded", "circle", "pill", "square"] as const,
        d.launcher.shape,
      ),
      size: num(l.size, d.launcher.size, 40, 96),
      icon: pick(
        l.icon ?? b.launcherIcon,
        [
          "chat",
          "sparkles",
          "bot",
          "help",
          "message",
          "wave",
          "custom",
        ] as const,
        d.launcher.icon,
      ),
      customIconUrl:
        typeof l.customIconUrl === "string"
          ? l.customIconUrl.slice(0, 500)
          : "",
      label: str(l.label, d.launcher.label, 24),
      offsetX: num(l.offsetX, d.launcher.offsetX, 0, 80),
      offsetY: num(l.offsetY, d.launcher.offsetY, 0, 80),
      pulse: bool(l.pulse, d.launcher.pulse),
      bg: hexOpt(l.bg),
      color: hexOpt(l.color),
      gradient: bool(l.gradient, d.launcher.gradient),
      glow: bool(l.glow, d.launcher.glow),
      iconSize: num(l.iconSize, d.launcher.iconSize, 12, 56),
      padding: num(l.padding, d.launcher.padding, 0, 40),
      labelPosition: pick(
        l.labelPosition,
        ["after", "before"] as const,
        d.launcher.labelPosition,
      ),
      labelMode: pick(
        l.labelMode,
        ["always", "hover"] as const,
        d.launcher.labelMode,
      ),
      labelSize: num(l.labelSize, d.launcher.labelSize, 10, 20),
      closeIconWhenOpen: bool(
        l.closeIconWhenOpen,
        d.launcher.closeIconWhenOpen,
      ),
      hideWhenOpen: pick(
        l.hideWhenOpen,
        ["auto", "always", "never"] as const,
        d.launcher.hideWhenOpen,
      ),
    },
    presentation: {
      mode: pick(
        pr.mode,
        [
          "panel",
          "drawer",
          "sheet",
          "dialog",
          "popover",
          "fullscreen",
        ] as const,
        d.presentation.mode,
      ),
      mobileMode: pick(
        pr.mobileMode,
        ["auto", "sheet", "fullscreen", "drawer", "panel"] as const,
        d.presentation.mobileMode,
      ),
      drawerSide: pick(
        pr.drawerSide,
        ["right", "left", "bottom"] as const,
        d.presentation.drawerSide,
      ),
      backdrop: bool(pr.backdrop, d.presentation.backdrop),
      backdropBlur: bool(pr.backdropBlur, d.presentation.backdropBlur),
      closeOnOutside: bool(pr.closeOnOutside, d.presentation.closeOnOutside),
      closeOnEscape: bool(pr.closeOnEscape, d.presentation.closeOnEscape),
      animation: pick(
        pr.animation,
        ["fade", "slide", "scale", "spring"] as const,
        d.presentation.animation,
      ),
    },
    panel: {
      width: num(p.width, d.panel.width, 280, 720),
      height: num(p.height, d.panel.height, 320, 900),
      showBranding: p.showBranding !== false,
      headerStyle: pick(
        p.headerStyle,
        ["gradient", "solid", "minimal", "glass"] as const,
        d.panel.headerStyle,
      ),
      showHeader: p.showHeader !== false,
      bgType: pick(
        p.bgType,
        ["solid", "gradient", "image"] as const,
        d.panel.bgType,
      ),
      bg: hexOpt(p.bg),
      bg2: hexOpt(p.bg2),
      gradientAngle: num(p.gradientAngle, d.panel.gradientAngle, 0, 360),
      bgImageUrl: url(p.bgImageUrl),
      bgImageDim: num(p.bgImageDim, d.panel.bgImageDim, 0, 100),
      textColor: hexOpt(p.textColor),
      borderColor: hexOpt(p.borderColor),
      borderWidth: num(p.borderWidth, d.panel.borderWidth, 0, 4),
      headerBg: hexOpt(p.headerBg),
      headerText: hexOpt(p.headerText),
      composerBg: hexOpt(p.composerBg),
      inputBg: hexOpt(p.inputBg),
    },
    persona: {
      name: str(pe.name, d.persona.name, 80),
      subtitle: str(pe.subtitle, d.persona.subtitle, 120),
      avatarUrl: typeof pe.avatarUrl === "string" ? pe.avatarUrl : "",
      greeting: str(pe.greeting, d.persona.greeting, 500),
      typingIndicator: pe.typingIndicator !== false,
    },
    behavior: {
      placeholder: str(b.placeholder, d.behavior.placeholder, 120),
      suggestedQuestions: Array.isArray(b.suggestedQuestions)
        ? b.suggestedQuestions
            .filter((q: unknown) => typeof q === "string" && q.trim())
            .slice(0, 8)
        : [],
      autoOpenAfterSeconds: num(b.autoOpenAfterSeconds, 0, 0, 120),
      soundOnReply: bool(b.soundOnReply, d.behavior.soundOnReply),
      persistChat: bool(b.persistChat, d.behavior.persistChat),
    },
    messages: {
      bubbleStyle: pick(
        m.bubbleStyle,
        ["rounded", "soft", "sharp", "bubble"] as const,
        d.messages.bubbleStyle,
      ),
      showTimestamps: bool(m.showTimestamps, d.messages.showTimestamps),
      userAlign: pick(
        m.userAlign,
        ["right", "left"] as const,
        d.messages.userAlign,
      ),
      userBg: hexOpt(m.userBg),
      userText: hexOpt(m.userText),
      aiBg: hexOpt(m.aiBg),
      aiText: hexOpt(m.aiText),
      aiBorder: bool(m.aiBorder, d.messages.aiBorder),
      fontSize: num(m.fontSize, d.messages.fontSize, 11, 18),
      maxWidth: num(m.maxWidth, d.messages.maxWidth, 55, 100),
      showAvatar: bool(m.showAvatar, d.messages.showAvatar),
    },
    customCss:
      typeof input.customCss === "string"
        ? input.customCss.slice(0, 12000)
        : "",
  };
}

/** Server config -> schema. Studio `ui` wins field-by-field over the legacy theme/persona/behavior blocks. */
export function fromServer(raw: any = {}): WidgetSchema {
  const ui = raw?.ui ?? {};
  const m = (k: string) => ({ ...(raw?.[k] ?? {}), ...(ui?.[k] ?? {}) });
  return resolve({
    ...raw,
    ...ui,
    theme: m("theme"),
    persona: m("persona"),
    behavior: m("behavior"),
    launcher: m("launcher"),
    panel: m("panel"),
    presentation: m("presentation"),
    messages: m("messages"),
  });
}
