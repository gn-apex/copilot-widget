import '../src/index';
import { GxCopilot, DEFAULTS, resolve, type WidgetSchema } from '../src/index';
import { FIELDS } from './fields';

let schema: WidgetSchema = structuredClone(DEFAULTS);
const el = document.createElement('gnapex-copilot-root') as GxCopilot;
el.transport = async (m) => { await new Promise((r) => setTimeout(r, 700)); return `(mock reply) You said: “${m[m.length - 1].content}”. Connect a real projectId to talk to your agent.`; };
document.body.appendChild(el);

const get = (p: string): any => p.split('.').reduce((o: any, k) => o?.[k], schema);
const set = (p: string, v: unknown) => { const ks = p.split('.'); const last = ks.pop()!; const o = ks.reduce((a: any, k) => a[k], schema); o[last] = v; };
const push = () => { el.setConfig(schema); (document.getElementById('json') as HTMLTextAreaElement).value = JSON.stringify(schema, null, 2); };

const form = document.getElementById('form')!;
const readers: Array<() => void> = [];
let group = '';
for (const f of FIELDS) {
  if (f.group !== group) { group = f.group; form.insertAdjacentHTML('beforeend', `<h3>${group}</h3>`); }
  const id = 'f_' + f.path.replace(/\./g, '_');
  const label = document.createElement('label'); label.htmlFor = id; label.textContent = f.label;
  let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  if (f.type === 'select') { input = document.createElement('select'); input.innerHTML = f.options!.map((o) => `<option>${o}</option>`).join(''); }
  else if (f.type === 'textarea' || f.type === 'lines') input = document.createElement('textarea');
  else { input = document.createElement('input'); input.type = f.type === 'text' ? 'text' : f.type; if (f.type === 'range') { input.min = String(f.min); input.max = String(f.max); } }
  input.id = id; form.append(label, input);
  const read = () => { const v = get(f.path); if (f.type === 'checkbox') (input as HTMLInputElement).checked = !!v; else input.value = f.type === 'lines' ? (v as string[]).join('\n') : String(v); };
  read(); readers.push(read);
  input.addEventListener('input', () => {
    const t = input as HTMLInputElement;
    set(f.path, f.type === 'checkbox' ? t.checked : f.type === 'range' ? +t.value : f.type === 'lines' ? t.value.split('\n').filter(Boolean) : t.value);
    push();
  });
}
document.getElementById('open')!.onclick = () => el.open();
document.getElementById('copy')!.onclick = () => navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
document.getElementById('reset')!.onclick = () => location.reload();

// ── Backend round-trip ────────────────────────────────────────
const $v = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim().replace(/\/$/, '');
const status = (t: string) => ((document.getElementById('status') as HTMLElement).textContent = t);
for (const id of ['api', 'pid', 'tok']) { const i = document.getElementById(id) as HTMLInputElement; i.value = sessionStorage.getItem(id) ?? i.value; i.oninput = () => sessionStorage.setItem(id, i.value); }

// LOAD = exactly what a customer's website receives
document.getElementById('load')!.onclick = async () => {
  try {
    const r = await fetch(`${$v('api')}/copilot/${$v('pid')}/config`); const raw = await r.json();
    schema = resolve({ ...raw, ...(raw.ui ?? {}) }); readers.forEach((f) => f()); push();
    status(raw.ui && Object.keys(raw.ui).length ? 'Loaded saved UI schema ✓' : 'No ui saved yet — showing legacy/default mapping');
  } catch (e) { status('Load failed: ' + e); }
};
// SAVE = what the dashboard will do
document.getElementById('save')!.onclick = async () => {
  try {
    const r = await fetch(`${$v('api')}/ai-agent/project/${$v('pid')}/config`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${$v('tok')}` }, body: JSON.stringify({ ui: schema }),
    });
    status(r.ok ? 'Saved ✓ — reload any site using this projectId' : `Save failed (${r.status}): ${await r.text()}`);
  } catch (e) { status('Save failed: ' + e); }
};
push(); el.open();
