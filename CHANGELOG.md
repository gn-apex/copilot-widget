# Changelog — Production-readiness pass

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
