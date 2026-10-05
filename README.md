# GN-Apex Copilot — Widget + Studio

| Part | Path | What it is |
|---|---|---|
| Widget runtime | `src/` | Builds to ONE file `dist/copilot.js` (the CDN script customers embed) |
| Schema + defaults | `src/schema.ts` | `WidgetSchema`, `DEFAULTS`, `resolve()` (validates/clamps everything) |
| **Studio** | `studio/` | Client-facing designer: templates, live preview, publish |
| Studio field list | `studio/fields.ts` | Declares every control. Add a field here and it appears in the Studio |

## Run
    npm i
    npm run dev      # Studio at http://localhost:5173 (offline demo)
    npm run build    # dist/copilot.js -> copy to backend public/cdn/copilot.js

Connect the Studio to a real project:

    http://localhost:5173/?api=http://localhost:4000&project=<PROJECT_ID>&token=<JWT>&site=https://client-site.com&name=Acme

(Params are kept in sessionStorage and removed from the URL.)

## Embed the Studio in your Next.js dashboard (the real product flow)
Copy or link this package into the dashboard, then:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { mountStudio } from 'gnapex-copilot-widget/studio/studio';

export default function CopilotStudioPage({ project, accessToken }: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => mountStudio(ref.current!, {
    apiUrl: process.env.NEXT_PUBLIC_API_URL, projectId: project.id, projectName: project.name,
    siteUrl: project.websiteUrl, getToken: () => accessToken,
  }), [project.id]);
  return <div ref={ref} style={{ height: 'calc(100vh - 64px)' }} />;
}
```
Omit `getToken` if your API uses cookie auth (the Studio then sends `credentials: 'include'`).

## Flow
Client edits in Studio → **Publish** → `PATCH /ai-agent/project/:id/config { ui }` →
stored in `aiConfig.ui` → public `GET /copilot/:id/config` returns it → `copilot.js` on the client's site applies it.

## Changing the default design for ALL new projects
`DEFAULTS` in `src/schema.ts` (values) and `src/styles.ts` (look of components). Rebuild, copy `dist/copilot.js`.
Clients who saved their own `ui` keep it; anything they never touched follows your new defaults only if you stop
saving the full schema — see "Partial overrides" in BACKEND.md.

## Release the CDN file to the backend
    BACKEND_CDN_DIR=../backend/public/cdn npm run release     # build + copy copilot.js
Make sure `public/cdn/copilot.js` is included in the backend's Docker image / deploy artifact.

## Dashboard
See `dashboard/INTEGRATION.md` (3 files + a small edit in Aitab.tsx).


## What’s new in v3

See **CHANGELOG.md** for the full list. Headlines: a rewritten width model (no more random wrapping, badges match their bubble), a composer with the send button inside the box, image/file uploads for Gemini/Gemma, an Auto theme that follows the host website (plus separate light/dark colours), 9 soft sounds, working auto-open, configurable auto-toasts, a clear-conversation button, a full markdown + LaTeX renderer, and a Studio with area-aware right-click menus and 21 shortcuts (press `?`).

## What’s new in this Studio (v2)

### Presentation modes (schema-driven)
Clients pick how the assistant opens — no code required:

| Mode | Behaviour |
|------|-----------|
| **Panel** | Classic floating chat near the launcher |
| **Drawer** | Slides from left / right / bottom |
| **Sheet** | Mobile-style bottom sheet |
| **Dialog** | Centered modal with backdrop |
| **Popover** | Compact popover anchored to the button |
| **Fullscreen** | Covers the entire viewport |

**Mobile behaviour** can be set independently (`auto` smart-picks sheet/fullscreen from the desktop mode).

### Richer design controls
- Brand + accent colours, density, glass/frosted surfaces, elevation
- Launcher: shape (rounded / circle / pill / square), 6 icons + custom URL, optional label, pulse attention ring, X/Y insets
- Header styles: gradient · solid · minimal · glass
- Message bubbles: soft / rounded / bubble / sharp; alignment; typing indicator
- Backdrop dim + blur, close-on-outside, Escape, open animations (fade / slide / scale / spring)
- 8 starter templates covering every presentation mode

### Still 100% schema-driven
Add a field in `studio/fields.ts` + a key in `src/schema.ts` and it appears in the Studio automatically. The widget runtime only reads the resolved schema — no one-off UI branches.

### Run
```bash
npm i
npm run dev   # Studio at http://localhost:5173
```

## Studio v2 (theme-aware)
- **Dark/light:** follows the host app's `dark` class on `<html>` (Tailwind `darkMode: "class"`), so it switches with your app theme. The toolbar button cycles Auto / Light / Dark; pass `theme` to `mountStudio` to force one. Dark is pure black (`#000`) with neutral greys.
- **Schema-driven:** every control, group, search hit, ⌘K entry and "customised" badge is generated from `studio/fields.ts`. Use `when: (s) => …` on a field to show it only when relevant.
- **Tools:** ⌘K palette, `/` setting search, per-field reset, WCAG contrast checker, template thumbnails, export/import JSON, embed-code copy, undo/redo, ⌘S publish.
# copilot-widget
