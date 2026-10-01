# Dashboard integration (gn-apex)

1. Copy this package's `src/` and `studio/` folders (as siblings) to `gn-apex/src/lib/copilot-widget/`.
2. Copy `dashboard/CopilotStudio.tsx` to `gn-apex/src/components/copilot-studio/CopilotStudio.tsx`.
3. Copy `dashboard/CopilotStudioCard.tsx` next to `Aitab.tsx` (settings/tabs/).
4. In `Aitab.tsx`:
   - add `import CopilotStudioCard from "./CopilotStudioCard";`
   - DELETE the whole `{/* ── Website Widget Appearance ── */} <Section title="Website widget" …> … </Section>` block inside the `<fieldset>`
   - ADD `<CopilotStudioCard project={project} />` right AFTER the status/usage `</section>` and BEFORE `<fieldset …>`
     (outside the fieldset so it stays usable while the copilot is off).
   - (optional) remove now-unused `POSITION_OPTIONS`; `Choice`/`Input` are still used elsewhere.
