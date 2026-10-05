# Changelog

## v3 — Studio overhaul, multimodal input, auto theme, toasts

### Widget
- **Message width model rewritten.** A bubble now only wraps once it reaches its configured maximum width; short replies no longer break at random. Reasoning, tool, confirmation and action badges are exactly as wide as the bubble they belong to (previously they could be wider than the reply). Hover actions and timestamps never influence a bubble's width.
- **Separate widths** for visitor and assistant bubbles (`messages.userMaxWidth`, `messages.aiMaxWidth`). A legacy `messages.maxWidth` in a saved config still loads and applies to both.
- **Composer rebuilt.** Send button lives *inside* the text box, becomes a Stop button while the assistant replies, auto-grows to `composer.maxRows`, optional character counter, Enter / Shift+Enter / Ctrl+Enter behaviour, 5 input shapes, 3 send icons, 3 send styles.
- **Space-bar bug fixed.** Host sites with global hotkeys (or modals/carousels) could cancel Space and other keys typed into the widget. Keystrokes from the input are now handled in the capture phase and kept away from the page, and any character that something earlier already cancelled is re-inserted. Verified against a page that cancels Space in both capture and bubble phase.
- **Uploads for multimodal models** (Gemini / Gemma): attach button, drag & drop, paste screenshots, previews with remove, lightbox, count / size / type limits. Images are resized (max 1600px) and re-encoded to JPEG in the browser — a 2400×1600 photo became ~73 KB.
- **Auto theme** (`theme.mode = "auto"`, now the default): follows the website the widget is on — `class="dark"` (next-themes, Tailwind), `data-theme` / `data-bs-theme` and friends, `color-scheme`, real page background luminance, then the OS — and flips live when the site's theme toggles.
- **Separate light & dark colours** (`theme.splitColors`): every colour in Window, Messages and Input gets a dark twin (`bgDark`, `userBgDark`, …).
- **Sounds:** 9 synthesised sounds (chime, pop, bubble, glass, marimba, droplet, harp, ping, bell) + volume + optional send pop. No audio files.
- **Auto-open actually works now** (the timer was never started before): once per session, optional on phones, never after the visitor has engaged.
- **Auto toasts:** configurable messages that rotate, delay / repeat / max-per-visit / duration, card · speech-bubble · pill styles, avatar, quick-reply buttons, progress bar with pause-on-hover, optional sound, "stay quiet after dismiss".
- **Clear conversation:** trash button beside the close icon with a confirm step (`behavior.clearButton`).
- **Markdown renderer rewritten:** nested lists, GFM tables with alignment, task lists, callouts (`> [!TIP]`), blockquotes, strikethrough, ==highlight==, `<kbd>`, autolinks, images, syntax-highlighted code (JS/TS, Python, shell, SQL, JSON, YAML, CSS, HTML, C-family, diff) with copy + wrap buttons, **LaTeX math** (fractions, roots, sums, matrices, cases, Greek, accents) — all without dependencies, and safe by construction.
- **Rendering is incremental**: only the message that changed is rebuilt while streaming, so there is no flicker and open reasoning blocks stay open.
- Copy and Regenerate on replies, scroll-to-latest button, entrance animations, "plain" (bubble-less) assistant style, sender name, online dot.
- Security: server-supplied labels (reasoning, tools, actions) are no longer inserted as HTML; `NAVIGATE` actions only accept http(s)/relative/mailto/tel URLs.

### Studio
- **Context menu on right-click that changes with the area**: launcher, header, visitor bubble, assistant bubble, code block, reasoning/tools, suggestion chips, input, attachments, toast, window, nav items, individual settings (reset / copy / paste / use brand colour / min / max), the controls panel, the top bar and the stage. Quick-set radios and toggles apply live; "Customise…" jumps to the exact setting and pulses it. Shift + right-click gives the browser's own menu.
- **21 keyboard shortcuts** from a single definition that also feeds the cheat-sheet (`?`) and the command palette: `⌘S` publish, `⌘K` palette, `⌘Z` / `⇧⌘Z` undo/redo, `1–9 / 0` jump to a section, `[ ]` step through sections, `D` device, `B` host background, `O` window, `T` toast, `E` sample conversation, `R` clear, `F` focus mode, `Alt+C/E/I/R` copy/export/import/reset section.
- New sections: **Input & Uploads**, **Auto Toasts**; expanded Messages and Behaviour; new controls — sound picker with live audition, message-width visualiser with presets.
- "Host site is Light / Dark" now drives Auto theme in the preview, so you can see exactly what happens when a customer's site switches theme.
- Status bar, focus mode, sample conversation, toast preview, section copy/paste/reset.
- Fixed: typing `/` or pressing ⌘Z inside the preview's text box used to be hijacked by the Studio (events from the widget's shadow DOM were retargeted to the host element).

---

## v2 — Production-readiness pass

This pass focused on one thing: **making every control the Studio exposes actually do
something on the live, embedded widget.** An audit turned up ~21 CSS custom properties
and 7 data-attributes that `widget.ts` computed correctly but `styles.ts` never read —
so a large slice of the "v2 richer design controls" in the Studio had **zero visual
effect** on the widget customers actually see on their sites. That's the root cause
behind launcher/button settings that looked like they should work but didn't.

Only `src/widget.ts`, `src/styles.ts` and `src/index.ts` changed. `schema.ts`, the
Studio (`studio/`), the dashboard integration (`dashboard/`) and the playground were
left untouched — the Studio already had a correct control for every schema field, and
because its live preview mounts the real `<gnapex-copilot-root>` element, these fixes
flow straight through to the Studio's preview with no further changes needed there.

## Fixed (previously silently broken)

**Launcher button**
- Custom background/text colour overrides (`launcher.bg` / `launcher.color`) — were computed but never applied; launcher background was hardcoded to a primary-colour gradient regardless.
- Gradient on/off toggle (`launcher.gradient`) — had no effect.
- Icon size slider (`launcher.iconSize`) — icons were hardcoded to 46%/52% of the button box.
- Icon padding/box sizing — now a real, independent px box instead of a percentage of button size.
- Label font size (`launcher.labelSize`) — hardcoded to 13px regardless of the slider.
- Label horizontal padding (`launcher.padding`) — hardcoded to 14–18px regardless of the field.
- Label position before/after (`launcher.labelPosition`) — attribute was set, no CSS consumed it.
- Label hover-reveal mode (`launcher.labelMode = "hover"`) — label was always visible; now the button starts icon-only and smoothly expands on hover/focus, and correctly re-collapses while the chat window is open.
- **Labeled launcher on any shape except "pill" had a fixed icon-only width**, so the label text would overflow/clip instead of the button growing to fit it. Any shape now grows to fit a label.
- Glow toggle (`launcher.glow`) — glow was always on regardless of the toggle.
- "Hide launcher while window is open" (`launcher.hideWhenOpen`) — attribute was set, never styled; launcher stayed visible and could overlap a fullscreen/sheet/drawer window.
- "Swap to ✕ icon when open" (`launcher.closeIconWhenOpen`) — both icons rendered inline simultaneously with no crossfade or toggle; now a proper rotate/scale/opacity crossfade keyed off the open state.
- Launcher corner radius for the "square" shape was fought over by two conflicting rules (a hardcoded CSS override vs. the JS-computed value); now there's a single source of truth.

**Messages**
- Custom user/AI bubble colours (`messages.userBg/userText/aiBg/aiText`) — computed, never applied; bubbles were always the default navy/primary regardless of what was set.
- AI-bubble border toggle (`messages.aiBorder`) — no effect.
- Message font size (`messages.fontSize`) and max bubble width (`messages.maxWidth`) — both hardcoded, sliders did nothing.
- User-bubble text was hardcoded white — unreadable if a light/bright primary colour was chosen. Now uses the same WCAG-contrast logic already computed elsewhere in the file.

**Panel / header / composer**
- Panel border width (`panel.borderWidth`) — hardcoded to 1px.
- Panel background type = gradient or image (`panel.bgType`) — computed, **never rendered**; panel background was always flat solid regardless of this setting.
- Custom header background/text colour (`panel.headerBg/headerText`) — no effect; header always used the preset style colours.
- Custom composer/input background colours (`panel.composerBg/inputBg`) — no effect.
- The floating "✕" close button shown when the header is hidden had **no positioning CSS at all** — it rendered inline in the document flow instead of floating in the corner. Now properly anchored, blurred, and shape-matched to launcher position.
- `theme.accentColor` was computed but used nowhere; it's now used for the send button's gradient, the focus ring colour, and the loading-sweep bar.

## Added (new, not previously present)

- **Resilient config loading**: the widget used to silently disappear forever on a client's site if the config endpoint had one bad response (no retry, no fallback, no visible error). It now retries once with a timeout, and falls back to the visitor's last-known-good cached config in localStorage if the API is briefly unreachable.
- **Busy/sending state**: the send button now disables and shows a spinner while waiting on a reply (previously it stayed fully clickable with no feedback besides the typing dots), and a subtle progress sweep appears at the top of the window.
- **Retry on failure**: a failed reply now renders an inline "Try again" action instead of only a generic apology with no recovery path.
- **Keyboard accessibility**: visible focus rings on the launcher, close buttons, send button, and suggested-question chips (previously none existed outside the text input); a focus trap keeps Tab/Shift+Tab inside the window while it's presented as a true modal (`aria-modal`).
- **Crisp SVG icons** replace the emoji/unicode send (➤) and close (×) glyphs, which rendered inconsistently across operating systems and browsers.
- **Thin, theme-matched scrollbar** for the message list instead of the browser default.
- **rAF-throttled resize handling** to avoid redundant style recomputation during a resize/orientation-change burst.
- **More reliable auto-mount**: the embed script now mounts correctly even when the `<script>` tag doesn't use `defer` and runs before `<body>` exists.
- Audio: explicitly resumes a suspended `AudioContext` before the reply "ding" (some browsers start it suspended under autoplay policies).

## Unchanged by design

- `schema.ts` — validation/clamping logic was already correct and needed no changes.
- `studio/*` — every schema field already had a matching, well-conditioned Studio control; the bug was entirely on the rendering side.
- `dashboard/*`, `playground/*` — integration glue, unaffected by this pass.
