// Standalone entry. Open:  /?api=http://localhost:4000&project=PROJECT_ID&token=JWT&site=https://client.com
import { mountStudio } from './studio';
const q = new URLSearchParams(location.search), ss = sessionStorage;
for (const k of ['api', 'project', 'token', 'site', 'name']) { const v = q.get(k); if (v) ss.setItem('gxs_' + k, v); }
const g = (k: string) => ss.getItem('gxs_' + k) || undefined;
if (q.has('token')) history.replaceState(null, '', location.pathname); // don't leave the token in the URL
mountStudio(document.getElementById('app')!, { apiUrl: g('api'), projectId: g('project'), projectName: g('name'), siteUrl: g('site'), getToken: () => g('token') ?? null });
