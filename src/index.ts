import { GxCopilot } from './widget';
export { GxCopilot } from './widget';
export { DEFAULTS, resolve, fromServer } from './schema';
export type { WidgetSchema, PartialSchema } from './schema';

const TAG = 'gnapex-copilot-root';
if (typeof window !== 'undefined' && !customElements.get(TAG)) customElements.define(TAG, GxCopilot);

// Auto-mount only when loaded via <script data-project-id="...">
// The script element is captured synchronously (document.currentScript is only valid
// during the script's own initial execution), then used later even if mounting itself
// is deferred until the DOM is ready — so this still works without a `defer` attribute.
const scriptEl =
  typeof document === 'undefined'
    ? null
    : ((document.currentScript as HTMLScriptElement | null) ??
      (document.getElementById('gnapex-copilot-script') as HTMLScriptElement | null));

function autoMount() {
  if (!scriptEl?.dataset?.projectId || document.querySelector(TAG)) return;
  const el = document.createElement(TAG);
  el.setAttribute('data-project-id', scriptEl.dataset.projectId);
  if (scriptEl.dataset.apiUrl) el.setAttribute('data-api-url', scriptEl.dataset.apiUrl);
  (document.body ?? document.documentElement).appendChild(el);
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') autoMount();
  else document.addEventListener('DOMContentLoaded', autoMount);
}
