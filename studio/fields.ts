// THE STUDIO SCHEMA. Add a field here + a key in src/schema.ts and it appears in the Studio automatically.
import type { PartialSchema, WidgetSchema } from "../src/schema";

export type Opt = string | { value: string; label: string; hint?: string };
export type Field = {
  path: string;
  label: string;
  hint?: string;
  type:
    | "select"
    | "segment"
    | "color"
    | "range"
    | "text"
    | "textarea"
    | "toggle"
    | "lines"
    | "icon"
    | "mode"
    | "sound"
    | "widths";
  options?: Opt[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** widths control: the second value (assistant) */
  path2?: string;
  /** lines control: max entries (default 8) */
  maxItems?: number;
  /** color only: empty string is allowed and means "automatic" */
  optional?: boolean;
  /** Visual group within a section */
  group?: string;
  /** Hide the control unless this returns true (keeps long sections focused) */
  when?: (s: WidgetSchema) => boolean;
};

export type Section = {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  fields: Field[];
};

export const SECTIONS: Section[] = [
  {
    id: "presentation",
    title: "Presentation",
    icon: "🪟",
    blurb:
      "How the assistant appears — panel, drawer, sheet, dialog, or full-screen",
    fields: [
      {
        path: "presentation.mode",
        label: "Desktop mode",
        type: "mode",
        hint: "Panel floats near the launcher. Drawer slides from an edge. Sheet rises from the bottom. Dialog centers. Fullscreen covers everything.",
        options: [
          { value: "panel", label: "Panel", hint: "Classic floating chat" },
          { value: "drawer", label: "Drawer", hint: "Slides from side" },
          { value: "sheet", label: "Sheet", hint: "Bottom sheet" },
          { value: "dialog", label: "Dialog", hint: "Centered modal" },
          { value: "popover", label: "Popover", hint: "Compact near button" },
          {
            value: "fullscreen",
            label: "Fullscreen",
            hint: "Takes the whole viewport",
          },
        ],
      },
      {
        path: "presentation.mobileMode",
        label: "Mobile behaviour",
        type: "segment",
        options: [
          { value: "auto", label: "Smart" },
          { value: "sheet", label: "Sheet" },
          { value: "fullscreen", label: "Cover" },
          { value: "drawer", label: "Drawer" },
          { value: "panel", label: "Panel" },
        ],
        hint: "Smart picks the best mobile experience for the desktop mode you chose.",
      },
      {
        path: "presentation.drawerSide",
        when: (s) =>
          s.presentation.mode === "drawer" ||
          s.presentation.mobileMode === "drawer",
        label: "Drawer / sheet edge",
        type: "segment",
        options: [
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
          { value: "bottom", label: "Bottom" },
        ],
      },
      {
        path: "presentation.animation",
        label: "Open animation",
        type: "segment",
        options: ["fade", "slide", "scale", "spring"],
      },
      {
        path: "presentation.backdrop",
        label: "Dim the page behind",
        type: "toggle",
        hint: "Off = no overlay: visitors can keep scrolling and clicking your site while the chat is open. (Fullscreen always covers the page.)",
      },
      {
        path: "presentation.backdropBlur",
        when: (s) => s.presentation.backdrop,
        label: "Blur background",
        type: "toggle",
      },
      {
        path: "presentation.closeOnOutside",
        label: "Close when clicking the page",
        type: "toggle",
      },
      {
        path: "presentation.closeOnEscape",
        label: "Close on Escape key",
        type: "toggle",
      },
    ],
  },
  {
    id: "brand",
    title: "Brand & Theme",
    icon: "🎨",
    blurb: "Colours, density, glass, shadows and typography",
    fields: [
      {
        path: "theme.primaryColor",
        label: "Brand colour",
        type: "color",
        hint: "Launcher, send button, user bubbles, accents.",
      },
      {
        path: "theme.accentColor",
        label: "Accent colour",
        type: "color",
        hint: "Secondary highlights and focus rings.",
      },
      {
        path: "theme.mode",
        label: "Appearance",
        type: "segment",
        options: [
          { value: "auto", label: "Auto" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "OS" },
        ],
        hint: "Auto follows the website the widget sits on — next-themes, class=\"dark\", data-theme, colour-scheme or the page’s real background — and switches live when the visitor toggles the site theme. OS follows only the device setting.",
      },
      {
        path: "theme.splitColors",
        label: "Separate light & dark colours",
        type: "toggle",
        hint: "Off: one palette for both. On: every colour in Window, Messages and Input gets a second field for dark mode. Pair with Appearance → Auto.",
      },
      {
        path: "theme.radius",
        label: "Corner roundness",
        type: "range",
        min: 0,
        max: 36,
        unit: "px",
      },
      {
        path: "theme.density",
        label: "Spacing density",
        type: "segment",
        options: [
          { value: "compact", label: "Compact" },
          { value: "comfortable", label: "Comfort" },
          { value: "spacious", label: "Spacious" },
        ],
      },
      {
        path: "theme.glass",
        label: "Glass / frosted surfaces",
        type: "toggle",
        hint: "Subtle backdrop-filter blur on panel and header.",
      },
      {
        path: "theme.shadow",
        label: "Elevation",
        type: "segment",
        options: [
          { value: "none", label: "Flat" },
          { value: "soft", label: "Soft" },
          { value: "medium", label: "Medium" },
          { value: "bold", label: "Bold" },
        ],
      },
      {
        path: "theme.font",
        label: "Font family",
        type: "select",
        options: [
          {
            value:
              'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            label: "Modern sans (Inter)",
          },
          {
            value: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            label: "System default",
          },
          {
            value: 'Georgia, "Times New Roman", serif',
            label: "Classic serif",
          },
          {
            value: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
            label: "Monospace",
          },
          {
            value: '"DM Sans", Inter, system-ui, sans-serif',
            label: "DM Sans",
          },
        ],
      },
    ],
  },
  {
    id: "launcher",
    title: "Launcher Button",
    icon: "🚀",
    blurb: "The floating entry point — shape, icon, label and colours",
    fields: [
      {
        group: "Placement",
        path: "launcher.show",
        label: "Show launcher",
        type: "toggle",
        hint: "Turn off if you open the chat from your own button or link.",
      },
      {
        group: "Placement",
        path: "launcher.position",
        label: "Corner",
        type: "select",
        options: [
          { value: "bottom-right", label: "Bottom right" },
          { value: "bottom-left", label: "Bottom left" },
          { value: "top-right", label: "Top right" },
          { value: "top-left", label: "Top left" },
        ],
      },
      {
        group: "Placement",
        path: "launcher.offsetX",
        label: "Horizontal inset",
        type: "range",
        min: 8,
        max: 64,
        unit: "px",
      },
      {
        group: "Placement",
        path: "launcher.offsetY",
        label: "Vertical inset",
        type: "range",
        min: 8,
        max: 64,
        unit: "px",
      },

      {
        group: "Shape & size",
        path: "launcher.shape",
        label: "Shape",
        type: "segment",
        options: [
          { value: "rounded", label: "Rounded" },
          { value: "circle", label: "Circle" },
          { value: "pill", label: "Pill" },
          { value: "square", label: "Square" },
        ],
        hint: "With a label, every shape grows into a wider button and the icon never gets squashed.",
      },
      {
        group: "Shape & size",
        path: "launcher.size",
        label: "Button height",
        type: "range",
        min: 44,
        max: 88,
        unit: "px",
      },
      {
        group: "Shape & size",
        path: "launcher.padding",
        label: "Side padding",
        type: "range",
        min: 0,
        max: 40,
        unit: "px",
        when: (s) => !!s.launcher.label,
        hint: "Space either side of the icon + label.",
      },

      {
        group: "Icon",
        path: "launcher.icon",
        label: "Icon",
        type: "icon",
        options: [
          { value: "chat", label: "Chat" },
          { value: "sparkles", label: "Sparkles" },
          { value: "bot", label: "Bot" },
          { value: "help", label: "Help" },
          { value: "message", label: "Message" },
          { value: "wave", label: "Wave" },
          { value: "custom", label: "Custom URL" },
        ],
      },
      {
        group: "Icon",
        path: "launcher.customIconUrl",
        label: "Custom icon URL",
        type: "text",
        when: (s) => s.launcher.icon === "custom",
        hint: "https:// square PNG / SVG. Transparent background works best.",
      },
      {
        group: "Icon",
        path: "launcher.iconSize",
        label: "Icon size",
        type: "range",
        min: 12,
        max: 56,
        unit: "px",
      },
      {
        group: "Icon",
        path: "launcher.closeIconWhenOpen",
        label: "Show ✕ while open",
        type: "toggle",
        hint: "The icon morphs into a close button and the label folds away.",
      },

      {
        group: "Label",
        path: "launcher.label",
        label: "Button label",
        type: "text",
        hint: "Optional text beside the icon. Leave empty for icon-only.",
      },
      {
        group: "Label",
        path: "launcher.labelPosition",
        label: "Label side",
        type: "segment",
        when: (s) => !!s.launcher.label,
        options: [
          { value: "after", label: "After icon" },
          { value: "before", label: "Before icon" },
        ],
      },
      {
        group: "Label",
        path: "launcher.labelMode",
        label: "Label visibility",
        type: "segment",
        when: (s) => !!s.launcher.label,
        options: [
          { value: "always", label: "Always" },
          { value: "hover", label: "On hover" },
        ],
        hint: "On hover = a compact icon that expands when visitors point at it.",
      },
      {
        group: "Label",
        path: "launcher.labelSize",
        label: "Label size",
        type: "range",
        min: 10,
        max: 20,
        unit: "px",
        when: (s) => !!s.launcher.label,
      },

      {
        group: "Colours",
        path: "launcher.bg",
        label: "Background",
        type: "color",
        optional: true,
        hint: "Empty = your brand colour.",
      },
      {
        group: "Colours",
        path: "launcher.color",
        label: "Icon & label colour",
        type: "color",
        optional: true,
        hint: "Empty = automatic contrast.",
      },
      {
        group: "Colours",
        path: "launcher.gradient",
        label: "Soft gradient",
        type: "toggle",
      },
      {
        group: "Colours",
        path: "launcher.glow",
        label: "Glow",
        type: "toggle",
      },

      {
        group: "Behaviour",
        path: "launcher.pulse",
        label: "Attention pulse",
        type: "toggle",
        hint: "Subtle ring animation (stops after first open).",
      },
      {
        group: "Behaviour",
        path: "launcher.hideWhenOpen",
        label: "Hide button while open",
        type: "segment",
        options: [
          { value: "auto", label: "Auto" },
          { value: "always", label: "Always" },
          { value: "never", label: "Never" },
        ],
        hint: "Auto hides it only when the window would cover it (sheet, drawer, fullscreen). The window always sits above the button.",
      },
    ],
  },
  {
    id: "window",
    title: "Window & Body",
    icon: "📐",
    blurb: "Size, background, text, header and message box colours",
    fields: [
      {
        group: "Size",
        path: "panel.width",
        label: "Width",
        type: "range",
        min: 300,
        max: 640,
        unit: "px",
        hint: "Ignored for drawer / fullscreen / sheet on mobile.",
      },
      {
        group: "Size",
        path: "panel.height",
        label: "Height",
        type: "range",
        min: 360,
        max: 860,
        unit: "px",
      },

      {
        group: "Background",
        path: "panel.bgType",
        label: "Background type",
        type: "segment",
        options: [
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" },
          { value: "image", label: "Image" },
        ],
      },
      {
        group: "Background",
        path: "panel.bg",
        label: "Background colour",
        type: "color",
        optional: true,
        hint: "Empty = neutral black (dark) or white (light). Text, bubbles and borders adapt automatically.",
      },
      {
        group: "Background",
        path: "panel.bg2",
        label: "Gradient end colour",
        type: "color",
        optional: true,
        when: (s) => s.panel.bgType === "gradient",
        hint: "Empty = a tint of your brand colour.",
      },
      {
        group: "Background",
        path: "panel.gradientAngle",
        label: "Gradient angle",
        type: "range",
        min: 0,
        max: 360,
        unit: "°",
        when: (s) => s.panel.bgType === "gradient",
      },
      {
        group: "Background",
        path: "panel.bgImageUrl",
        label: "Background image URL",
        type: "text",
        when: (s) => s.panel.bgType === "image",
        hint: "https:// image. Subtle patterns work best.",
      },
      {
        group: "Background",
        path: "panel.bgImageDim",
        label: "Image veil",
        type: "range",
        min: 0,
        max: 100,
        unit: "%",
        when: (s) => s.panel.bgType === "image",
        hint: "Higher = more of the background colour over the image, for readable text.",
      },

      {
        group: "Text & border",
        path: "panel.textColor",
        label: "Text colour",
        type: "color",
        optional: true,
        hint: "Empty = automatic contrast.",
      },
      {
        group: "Text & border",
        path: "panel.borderColor",
        label: "Border & divider colour",
        type: "color",
        optional: true,
      },
      {
        group: "Text & border",
        path: "panel.borderWidth",
        label: "Border width",
        type: "range",
        min: 0,
        max: 4,
        unit: "px",
      },

      {
        group: "Header",
        path: "panel.showHeader",
        label: "Show header",
        type: "toggle",
      },
      {
        group: "Header",
        path: "panel.headerStyle",
        label: "Header style",
        type: "segment",
        when: (s) => s.panel.showHeader,
        options: [
          { value: "gradient", label: "Gradient" },
          { value: "solid", label: "Solid" },
          { value: "minimal", label: "Minimal" },
          { value: "glass", label: "Glass" },
        ],
      },
      {
        group: "Header",
        path: "panel.headerBg",
        label: "Header background",
        type: "color",
        optional: true,
        when: (s) => s.panel.showHeader,
        hint: "Empty = follow the header style above.",
      },
      {
        group: "Header",
        path: "panel.headerText",
        label: "Header text colour",
        type: "color",
        optional: true,
        when: (s) => s.panel.showHeader,
      },

      {
        group: "Input area",
        path: "panel.composerBg",
        label: "Input bar background",
        type: "color",
        optional: true,
      },
      {
        group: "Input area",
        path: "panel.inputBg",
        label: "Text box background",
        type: "color",
        optional: true,
      },

      {
        group: "Branding",
        path: "panel.showBranding",
        label: "Show “Powered by GN•APEX”",
        type: "toggle",
      },
    ],
  },
  {
    id: "persona",
    title: "Assistant Persona",
    icon: "👤",
    blurb: "Who visitors talk to",
    fields: [
      { path: "persona.name", label: "Name", type: "text" },
      { path: "persona.subtitle", label: "Tagline", type: "text" },
      {
        path: "persona.avatarUrl",
        label: "Avatar image URL",
        type: "text",
        hint: "https://… — square image works best",
      },
      { path: "persona.greeting", label: "Greeting message", type: "textarea" },
      {
        path: "persona.typingIndicator",
        label: "Typing indicator",
        type: "toggle",
      },
      {
        path: "persona.showStatus",
        label: "Online status dot",
        type: "toggle",
        hint: "A softly pulsing green dot on the avatar.",
      },
    ],
  },
  {
    id: "messages",
    title: "Messages",
    icon: "💬",
    blurb: "Bubble shape, widths, colours, typography and motion",
    fields: [
      {
        group: "Shape",
        path: "messages.bubbleStyle",
        label: "Bubble style",
        type: "segment",
        options: [
          { value: "soft", label: "Soft" },
          { value: "rounded", label: "Rounded" },
          { value: "bubble", label: "Bubble" },
          { value: "sharp", label: "Sharp" },
        ],
      },
      {
        group: "Shape",
        path: "messages.aiStyle",
        label: "Assistant replies",
        type: "segment",
        options: [
          { value: "bubble", label: "In a bubble" },
          { value: "plain", label: "Plain text" },
        ],
        hint: "Plain text drops the bubble and lets replies flow on the window — the Gemini / ChatGPT look.",
      },
      {
        group: "Shape",
        path: "messages.userAlign",
        label: "Visitor’s messages",
        type: "segment",
        options: [
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
        ],
      },
      {
        group: "Width",
        path: "messages.userMaxWidth",
        path2: "messages.aiMaxWidth",
        label: "Maximum bubble width",
        type: "widths",
        min: 40,
        max: 100,
        hint: "A bubble only wraps once it reaches this width. Reasoning, tool and action badges always match the bubble they belong to.",
      },
      {
        group: "Rhythm",
        path: "messages.gap",
        label: "Space between messages",
        type: "range",
        min: 2,
        max: 36,
        unit: "px",
      },
      {
        group: "Rhythm",
        path: "messages.padding",
        label: "Bubble padding",
        type: "range",
        min: 4,
        max: 24,
        unit: "px",
      },
      {
        group: "Type",
        path: "messages.fontSize",
        label: "Text size",
        type: "range",
        min: 11,
        max: 18,
        step: 0.5,
        unit: "px",
      },
      {
        group: "Type",
        path: "messages.lineHeight",
        label: "Line height",
        type: "range",
        min: 1.25,
        max: 2,
        step: 0.05,
      },
      {
        group: "Visitor bubble",
        path: "messages.userBg",
        label: "Background",
        type: "color",
        optional: true,
        hint: "Empty = brand colour.",
      },
      {
        group: "Visitor bubble",
        path: "messages.userText",
        label: "Text colour",
        type: "color",
        optional: true,
        hint: "Empty = automatic contrast.",
      },
      {
        group: "Assistant bubble",
        path: "messages.aiBg",
        label: "Background",
        type: "color",
        optional: true,
        hint: "Empty = a soft tint of the window colour.",
      },
      {
        group: "Assistant bubble",
        path: "messages.aiText",
        label: "Text colour",
        type: "color",
        optional: true,
      },
      {
        group: "Assistant bubble",
        path: "messages.aiBorder",
        label: "Outline",
        type: "toggle",
      },
      {
        group: "Rich content",
        path: "messages.codeTheme",
        label: "Code blocks",
        type: "segment",
        options: [
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
          { value: "auto", label: "Match theme" },
        ],
        hint: "Replies render full markdown: headings, lists, tables, task lists, callouts, syntax-highlighted code with copy, and LaTeX maths.",
      },
      {
        group: "Details",
        path: "messages.animate",
        label: "Entrance animation",
        type: "segment",
        options: [
          { value: "rise", label: "Rise" },
          { value: "fade", label: "Fade" },
          { value: "pop", label: "Pop" },
          { value: "none", label: "None" },
        ],
      },
      {
        group: "Details",
        path: "messages.showActions",
        label: "Copy & regenerate buttons",
        type: "segment",
        options: [
          { value: "hover", label: "On hover" },
          { value: "always", label: "Always" },
          { value: "off", label: "Off" },
        ],
      },
      {
        group: "Details",
        path: "messages.showAvatar",
        label: "Avatar beside replies",
        type: "toggle",
      },
      {
        group: "Details",
        path: "messages.showSender",
        label: "Assistant name above replies",
        type: "toggle",
      },
      {
        group: "Details",
        path: "messages.showTimestamps",
        label: "Show timestamps",
        type: "toggle",
      },
      {
        group: "Details",
        path: "messages.showReasoning",
        label: "Show “thinking” blocks",
        type: "toggle",
      },
      {
        group: "Details",
        path: "messages.showTools",
        label: "Show tool-use badges",
        type: "toggle",
      },
    ],
  },
  {
    id: "composer",
    title: "Input & Uploads",
    icon: "✍️",
    blurb: "The text box, send button and multimodal attachments",
    fields: [
      {
        group: "Look",
        path: "composer.style",
        label: "Input shape",
        type: "segment",
        options: [
          { value: "auto", label: "Auto" },
          { value: "pill", label: "Pill" },
          { value: "rounded", label: "Rounded" },
          { value: "square", label: "Square" },
          { value: "line", label: "Line" },
        ],
      },
      {
        group: "Look",
        path: "composer.sendIcon",
        label: "Send icon",
        type: "segment",
        options: [
          { value: "arrow", label: "Arrow" },
          { value: "plane", label: "Plane" },
          { value: "chevron", label: "Chevron" },
        ],
        hint: "The send button always sits inside the text box and becomes a stop button while the assistant is replying.",
      },
      {
        group: "Look",
        path: "composer.sendStyle",
        label: "Send button",
        type: "segment",
        options: [
          { value: "solid", label: "Solid" },
          { value: "soft", label: "Soft" },
          { value: "ghost", label: "Ghost" },
        ],
      },
      {
        group: "Typing",
        path: "composer.sendOnEnter",
        label: "Enter sends",
        type: "toggle",
        hint: "On: Enter sends, Shift+Enter adds a line. Off: Ctrl/⌘+Enter sends.",
      },
      {
        group: "Typing",
        path: "composer.maxRows",
        label: "Grow up to",
        type: "range",
        min: 2,
        max: 10,
        unit: " lines",
      },
      {
        group: "Typing",
        path: "composer.maxChars",
        label: "Character limit",
        type: "range",
        min: 0,
        max: 8000,
        step: 100,
        hint: "0 = unlimited. A counter appears at 80%.",
      },
      {
        group: "Typing",
        path: "composer.showHint",
        label: "Show keyboard hint",
        type: "toggle",
      },
      {
        group: "Typing",
        path: "composer.autofocus",
        label: "Focus when the chat opens",
        type: "toggle",
        hint: "Skipped on touch devices so the keyboard doesn’t jump up.",
      },
      {
        group: "Attachments",
        path: "composer.uploads",
        label: "Allow attachments",
        type: "toggle",
        hint: "Sent to your multimodal model (Gemini / Gemma) as inline parts. Images are resized and compressed in the browser first.",
      },
      {
        group: "Attachments",
        path: "composer.accept",
        label: "Accepted files",
        type: "segment",
        when: (s) => s.composer.uploads,
        options: [
          { value: "images", label: "Images" },
          { value: "images-docs", label: "Images + docs" },
          { value: "any", label: "Any" },
        ],
      },
      {
        group: "Attachments",
        path: "composer.attachIcon",
        label: "Attach icon",
        type: "segment",
        when: (s) => s.composer.uploads,
        options: [
          { value: "paperclip", label: "Clip" },
          { value: "plus", label: "Plus" },
          { value: "image", label: "Image" },
        ],
      },
      {
        group: "Attachments",
        path: "composer.attachPlacement",
        label: "Attach button",
        type: "segment",
        when: (s) => s.composer.uploads,
        options: [
          { value: "inside", label: "Inside the box" },
          { value: "outside", label: "Beside it" },
        ],
      },
      {
        group: "Attachments",
        path: "composer.maxFiles",
        label: "Files per message",
        type: "range",
        when: (s) => s.composer.uploads,
        min: 1,
        max: 10,
      },
      {
        group: "Attachments",
        path: "composer.maxSizeMB",
        label: "Max size per file",
        type: "range",
        when: (s) => s.composer.uploads,
        min: 1,
        max: 20,
        unit: " MB",
      },
      {
        group: "Attachments",
        path: "composer.dragDrop",
        label: "Drag & drop onto the window",
        type: "toggle",
        when: (s) => s.composer.uploads,
        hint: "Pasting a screenshot (Ctrl/⌘+V) always works too.",
      },
    ],
  },
  {
    id: "behavior",
    title: "Behaviour",
    icon: "⚙️",
    blurb: "Prompts, automation, sound and memory",
    fields: [
      {
        path: "behavior.placeholder",
        label: "Input placeholder",
        type: "text",
      },
      {
        path: "behavior.suggestedQuestions",
        label: "Suggested questions",
        type: "lines",
        hint: "Up to 8. Shown as quick-reply chips until the first message.",
      },
      {
        group: "Auto-open",
        path: "behavior.autoOpenAfterSeconds",
        label: "Open the chat after",
        type: "range",
        min: 0,
        max: 60,
        unit: "s",
        hint: "0 = never. Never fires inside the Studio preview, and never after the visitor has already opened the chat.",
      },
      {
        group: "Auto-open",
        path: "behavior.autoOpenOncePerSession",
        label: "Only once per visit",
        type: "toggle",
        when: (s) => s.behavior.autoOpenAfterSeconds > 0,
      },
      {
        group: "Auto-open",
        path: "behavior.autoOpenOnMobile",
        label: "Also on phones",
        type: "toggle",
        when: (s) => s.behavior.autoOpenAfterSeconds > 0,
        hint: "Off by default — a full-screen takeover on mobile is disruptive.",
      },
      {
        group: "Sound",
        path: "behavior.soundOnReply",
        label: "Play a sound on reply",
        type: "toggle",
      },
      {
        group: "Sound",
        path: "behavior.sound",
        label: "Reply sound",
        type: "sound",
        when: (s) => s.behavior.soundOnReply,
        hint: "Click a card to hear it. All sounds are synthesised in the browser — nothing to download.",
      },
      {
        group: "Sound",
        path: "behavior.soundVolume",
        label: "Volume",
        type: "range",
        min: 0,
        max: 100,
        unit: "%",
        when: (s) => s.behavior.soundOnReply || s.behavior.soundOnSend || s.toasts.sound,
      },
      {
        group: "Sound",
        path: "behavior.soundOnSend",
        label: "Tiny pop when sending",
        type: "toggle",
      },
      {
        group: "Memory",
        path: "behavior.persistChat",
        label: "Remember conversation",
        type: "toggle",
        hint: "Stores chat in the visitor’s browser (localStorage).",
      },
      {
        group: "Memory",
        path: "behavior.clearButton",
        label: "Clear-conversation button",
        type: "segment",
        options: [
          { value: "auto", label: "When remembering" },
          { value: "always", label: "Always" },
          { value: "never", label: "Never" },
        ],
        hint: "A trash icon next to the close button, with a confirm step.",
      },
    ],
  },
  {
    id: "toasts",
    title: "Auto Toasts",
    icon: "🔔",
    blurb: "Gentle nudges that float above the launcher",
    fields: [
      {
        path: "toasts.enabled",
        label: "Show toasts",
        type: "toggle",
        hint: "A small message from the assistant — “Need help?” — that appears after a delay. Click ▸ Preview toast in the stage bar (or press T) to see it.",
      },
      {
        group: "Content",
        path: "toasts.messages",
        label: "Messages",
        type: "lines",
        when: (s) => s.toasts.enabled,
        hint: "They rotate in order each time a toast appears.",
      },
      {
        group: "Content",
        path: "toasts.replies",
        label: "Quick replies",
        type: "lines",
        maxItems: 3,
        when: (s) => s.toasts.enabled,
        hint: "Up to 3 buttons. Tapping one opens the chat and sends it.",
      },
      {
        group: "Timing",
        path: "toasts.delay",
        label: "First toast after",
        type: "range",
        min: 1,
        max: 120,
        unit: "s",
        when: (s) => s.toasts.enabled,
      },
      {
        group: "Timing",
        path: "toasts.repeatEvery",
        label: "Repeat every",
        type: "range",
        min: 0,
        max: 600,
        step: 5,
        unit: "s",
        when: (s) => s.toasts.enabled,
        hint: "0 = show once.",
      },
      {
        group: "Timing",
        path: "toasts.maxShows",
        label: "Max per visit",
        type: "range",
        min: 1,
        max: 10,
        when: (s) => s.toasts.enabled,
      },
      {
        group: "Timing",
        path: "toasts.duration",
        label: "Stay on screen",
        type: "range",
        min: 0,
        max: 60,
        unit: "s",
        when: (s) => s.toasts.enabled,
        hint: "0 = until dismissed.",
      },
      {
        group: "Look",
        path: "toasts.style",
        label: "Style",
        type: "segment",
        when: (s) => s.toasts.enabled,
        options: [
          { value: "card", label: "Card" },
          { value: "bubble", label: "Speech bubble" },
          { value: "pill", label: "Pill" },
        ],
      },
      {
        group: "Look",
        path: "toasts.showAvatar",
        label: "Show avatar",
        type: "toggle",
        when: (s) => s.toasts.enabled,
      },
      {
        group: "Look",
        path: "toasts.showName",
        label: "Show assistant name",
        type: "toggle",
        when: (s) => s.toasts.enabled && s.toasts.style !== "pill",
      },
      {
        group: "Sound",
        path: "toasts.sound",
        label: "Play a sound",
        type: "toggle",
        when: (s) => s.toasts.enabled,
      },
      {
        group: "Sound",
        path: "toasts.soundName",
        label: "Toast sound",
        type: "sound",
        when: (s) => s.toasts.enabled && s.toasts.sound,
      },
      {
        group: "Manners",
        path: "toasts.dismissible",
        label: "Dismiss button",
        type: "toggle",
        when: (s) => s.toasts.enabled,
      },
      {
        group: "Manners",
        path: "toasts.pauseOnHover",
        label: "Pause timer on hover",
        type: "toggle",
        when: (s) => s.toasts.enabled && s.toasts.duration > 0,
      },
      {
        group: "Manners",
        path: "toasts.respectDismiss",
        label: "Stay quiet after a dismiss",
        type: "toggle",
        when: (s) => s.toasts.enabled,
        hint: "If a visitor closes one, no more appear this visit. Strongly recommended.",
      },
      {
        group: "Manners",
        path: "toasts.mobile",
        label: "Show on phones",
        type: "toggle",
        when: (s) => s.toasts.enabled,
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    icon: "🧩",
    blurb: "Custom CSS escape hatch for power users",
    fields: [
      {
        path: "customCss",
        label: "Custom CSS",
        type: "textarea",
        hint: "Scoped inside the shadow root. Targets: .launcher .lbl .panel header .msgs .row .m.user .m.assistant .ts .chip .composer textarea .send .backdrop",
      },
    ],
  },
];

/** Colour fields that get a dark-mode twin when theme.splitColors is on. */
export const SPLIT_PATHS = [
  "panel.bg", "panel.bg2", "panel.textColor", "panel.borderColor", "panel.headerBg", "panel.headerText",
  "panel.composerBg", "panel.inputBg", "messages.userBg", "messages.userText", "messages.aiBg", "messages.aiText",
];
for (const sec of SECTIONS) {
  const out: Field[] = [];
  for (const f of sec.fields) {
    out.push(f);
    if (SPLIT_PATHS.includes(f.path)) {
      const base = f.when;
      out.push({
        ...f,
        path: f.path + "Dark",
        label: f.label + " · dark mode",
        hint: undefined,
        when: (sc) => sc.theme.splitColors && (base ? base(sc) : true),
      });
    }
  }
  sec.fields = out;
}

export const PRESETS: {
  name: string;
  swatch: string;
  desc: string;
  patch: PartialSchema;
}[] = [
  {
    name: "Ocean Panel",
    swatch: "#06b6d4",
    desc: "Classic floating panel · dark cyan",
    patch: {
      theme: {
        primaryColor: "#06b6d4",
        accentColor: "#22d3ee",
        mode: "dark",
        radius: 18,
        glass: false,
        shadow: "medium",
      },
      presentation: { mode: "panel", mobileMode: "auto", animation: "spring" },
      launcher: { shape: "rounded", icon: "chat", pulse: false },
    },
  },
  {
    name: "Sunrise Sheet",
    swatch: "#f97316",
    desc: "Bottom sheet · warm light",
    patch: {
      theme: {
        primaryColor: "#f97316",
        accentColor: "#fb923c",
        mode: "light",
        radius: 24,
        glass: false,
        shadow: "soft",
      },
      presentation: {
        mode: "sheet",
        mobileMode: "sheet",
        animation: "slide",
        drawerSide: "bottom",
      },
      launcher: { shape: "circle", icon: "sparkles", pulse: true },
    },
  },
  {
    name: "Forest Drawer",
    swatch: "#16a34a",
    desc: "Side drawer · fresh green",
    patch: {
      theme: {
        primaryColor: "#16a34a",
        accentColor: "#4ade80",
        mode: "light",
        radius: 14,
        glass: false,
        shadow: "medium",
      },
      presentation: {
        mode: "drawer",
        mobileMode: "drawer",
        drawerSide: "right",
        animation: "slide",
      },
      launcher: { shape: "rounded", icon: "chat" },
    },
  },
  {
    name: "Royal Dialog",
    swatch: "#7c3aed",
    desc: "Centered dialog · glass violet",
    patch: {
      theme: {
        primaryColor: "#7c3aed",
        accentColor: "#a78bfa",
        mode: "dark",
        radius: 20,
        glass: true,
        shadow: "bold",
      },
      presentation: {
        mode: "dialog",
        mobileMode: "fullscreen",
        animation: "scale",
      },
      launcher: { shape: "circle", icon: "bot" },
      panel: { headerStyle: "glass" },
    },
  },
  {
    name: "Rose Fullscreen",
    swatch: "#e11d48",
    desc: "Immersive cover · rose",
    patch: {
      theme: {
        primaryColor: "#e11d48",
        accentColor: "#fb7185",
        mode: "light",
        radius: 16,
        glass: false,
        shadow: "soft",
      },
      presentation: {
        mode: "fullscreen",
        mobileMode: "fullscreen",
        animation: "fade",
      },
      launcher: { shape: "pill", icon: "message", label: "Help" },
    },
  },
  {
    name: "Minimal Popover",
    swatch: "#111827",
    desc: "Compact popover · mono",
    patch: {
      theme: {
        primaryColor: "#111827",
        accentColor: "#374151",
        mode: "light",
        radius: 8,
        density: "compact",
        glass: false,
        shadow: "soft",
      },
      presentation: {
        mode: "popover",
        mobileMode: "sheet",
        animation: "scale",
      },
      launcher: { shape: "square", icon: "help", size: 48 },
      panel: { width: 340, height: 480, headerStyle: "minimal" },
    },
  },
  {
    name: "Glass Neon",
    swatch: "#22d3ee",
    desc: "Frosted glass · neon cyan",
    patch: {
      theme: {
        primaryColor: "#22d3ee",
        accentColor: "#a5f3fc",
        mode: "dark",
        radius: 22,
        glass: true,
        shadow: "bold",
      },
      presentation: { mode: "panel", mobileMode: "sheet", animation: "spring" },
      launcher: { shape: "circle", icon: "sparkles", pulse: true },
      panel: { headerStyle: "glass" },
    },
  },
  {
    name: "Enterprise",
    swatch: "#0f766e",
    desc: "Drawer · professional teal",
    patch: {
      theme: {
        primaryColor: "#0f766e",
        accentColor: "#14b8a6",
        mode: "light",
        radius: 10,
        density: "comfortable",
        glass: false,
        shadow: "soft",
      },
      presentation: {
        mode: "drawer",
        mobileMode: "fullscreen",
        drawerSide: "right",
        animation: "slide",
      },
      launcher: { shape: "rounded", icon: "bot", label: "Support" },
      panel: { headerStyle: "solid", width: 420 },
    },
  },
];
