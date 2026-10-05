# Backend: keep it dumb

## 1. Delete the 1,600-line STANDALONE_COPILOT_RUNTIME string
`copilot-public.controller.ts` becomes:

```ts
import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class CopilotPublicController {
  constructor(private readonly ai: AiAgentService) {}

  @Get('copilot/:projectId/config')
  config(@Param('projectId') id: string) { return this.ai.getPublicCopilotConfig(id); }

  // Serves the pre-built file. Bump the filename (copilot.v2.js) on breaking changes.
  @Get('cdn/copilot.js')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  script(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'public/cdn/copilot.js'));
  }
}
```
Deploy: `npm run build` in the widget repo, copy `dist/copilot.js` to `backend/public/cdn/copilot.js`
(or upload to S3/R2/Cloudflare and point a CDN domain at it, then this endpoint can just 302 there).

## 2. Store the customer's design as ONE json blob: `aiConfig.ui`
In `UpdateProjectAiConfigDto` add:
```ts
@ApiPropertyOptional() @IsOptional() @IsObject() ui?: Record<string, unknown>;
```
Validate size (<16 KB) in the service. You do NOT need to re-implement defaults/validation:
the widget's `resolve()` clamps every value and falls back to defaults, so a bad/old blob can never break a site.
(Optional: import `resolve` from the widget package in the backend and store `resolve(ui)` to normalise on save.)

## 3. Public config: add `ui`
In `getPublicCopilotConfig`, return also `ui: rawAi['ui'] ?? {}`. Keep the legacy theme/persona/behavior
fields — the widget maps them — so existing projects keep working untouched.

## 4. Customer dashboard (later)
Render `playground/fields.ts` as the form (same list), preview with `<gnapex-copilot-root>` + `setConfig(schema)`
(load `copilot.js` in the dashboard), and `PATCH` the JSON to `aiConfig.ui` on save.

## 5. Website embed (unchanged)
<script id="gnapex-copilot-script" src="https://API/cdn/copilot.js" data-project-id="..." data-api-url="https://API" defer></script>

## Partial overrides (optional, recommended later)
The Studio currently publishes the FULL schema, so a client's design is frozen at publish time.
If you want untouched settings to follow future default changes, publish only the diff
(`diff(schema, DEFAULTS)`) instead of `schema`; `resolve()` already merges it over `DEFAULTS`.


## 6. Attachments (multimodal) — v3

When `composer.uploads` is on, the widget posts attachments with each message:

```jsonc
// POST /copilot/:projectId/stream
{
  "messages": [
    { "role": "user",
      "content": "What is in this picture?",
      "attachments": [ { "name": "photo.jpg", "mime": "image/jpeg", "data": "<base64, no data: prefix>" } ] }
  ],
  "pageContext": { ... }
}
```

Only the **current** session's messages carry `data`; messages restored from `localStorage` keep just a thumbnail locally and are sent as text. Images are already downscaled (≤1600px, JPEG) in the browser; text/PDF files are sent as-is up to `composer.maxSizeMB`.

Map them to model parts (Gemini shown; Gemma 3 accepts images the same way):

```ts
const parts = [
  { text: m.content },
  ...(m.attachments ?? []).map((a) =>
    a.mime.startsWith("text/") || a.mime === "application/json"
      ? { text: `File “${a.name}”:\n` + Buffer.from(a.data, "base64").toString("utf8") }   // works on any model
      : { inlineData: { mimeType: a.mime, data: a.data } }),                                  // images; PDFs on Gemini only
];
```

**Do not trust the client.** Re-check `mime` against an allow-list, cap total decoded bytes per request, cap files per message, and raise your JSON body limit (e.g. `express.json({ limit: "25mb" })` — base64 is ~33% larger than the file). Everything else (`mode`, `phase`, `thought`, `token`, `tool_*`, `suggested_actions`, `action_confirmation_required`, `[DONE]`) is unchanged.

The new `ui` keys (`composer`, `toasts`, `messages.userMaxWidth/aiMaxWidth`, `*Dark` colours, `behavior.sound*`, …) are all optional — `resolve()` fills defaults, so existing saved configs keep working.
