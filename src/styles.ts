// src/styles.ts

export const CSS = `
:host{all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:var(--gx-font)}
*,*::before,*::after{box-sizing:border-box}
.gx{
  --bg:#0b1220;--surface:#131c31;--text:#f1f5f9;--muted:#94a3b8;--border:rgba(255,255,255,.1);
  --bubble-ai:color-mix(in srgb,var(--gx-primary,#06b6d4) 7%,#1a2540);
  --pad:var(--gx-pad,14px);color:var(--text);
}
.gx[data-mode=light]{
  --bg:#fff;--surface:#f8fafc;--text:#0f172a;--muted:#64748b;--border:rgba(15,23,42,.09);
  --bubble-ai:color-mix(in srgb,var(--gx-primary,#06b6d4) 6%,#eef2f7);
}
button,textarea,input{font:inherit;color:inherit}
button{-webkit-tap-highlight-color:transparent}

/* density */
.gx[data-density=compact]{--gx-pad:10px}
.gx[data-density=comfortable]{--gx-pad:14px}
.gx[data-density=spacious]{--gx-pad:18px}

/* glass */
.gx[data-glass] .panel{
  background:color-mix(in srgb,var(--bg) 76%,transparent)!important;
  backdrop-filter:blur(20px) saturate(1.4);
  -webkit-backdrop-filter:blur(20px) saturate(1.4);
}

/* shadows */
.gx[data-shadow=none] .panel{box-shadow:none}
.gx[data-shadow=soft] .panel{box-shadow:0 8px 28px rgba(0,0,0,.12)}
.gx[data-shadow=medium] .panel{box-shadow:0 24px 64px rgba(0,0,0,.28)}
.gx[data-shadow=bold] .panel{box-shadow:0 32px 90px rgba(0,0,0,.45),0 0 0 1px var(--border)}

.launcher,.panel,.backdrop{pointer-events:auto}

/* ───────────────────────────────── launcher ───────────────────────────────── */
.launcher{
  position:fixed;height:var(--gx-size);min-width:var(--gx-size);border:0;
  border-radius:var(--gx-launcher-radius);cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  background:var(--gx-l-bg);color:var(--gx-l-fg);
  box-shadow:0 10px 28px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.15);
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease,
             width .25s ease,padding .25s ease,gap .25s ease;
  z-index:2;isolation:isolate;
}
.launcher:not([data-label]){width:var(--gx-size);padding:0}
.launcher[data-label]{width:auto;padding:0 var(--gx-lpad,16px)}
.launcher[data-lpos=before]{flex-direction:row-reverse}
.launcher:hover{transform:translateY(-2px) scale(1.045);box-shadow:0 16px 38px rgba(0,0,0,.26),0 2px 8px rgba(0,0,0,.18)}
.launcher:active{transform:translateY(0) scale(.95)}
.launcher:focus-visible{outline:2px solid var(--gx-accent,var(--gx-primary));outline-offset:3px}
.launcher[hidden]{display:none}
.launcher[data-hide]{opacity:0;transform:scale(.6);pointer-events:none;box-shadow:none}

.launcher[data-glow]{box-shadow:0 10px 28px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.15),0 0 30px color-mix(in srgb,var(--gx-l-base) 45%,transparent)}
.launcher[data-glow]:hover{box-shadow:0 16px 38px rgba(0,0,0,.26),0 2px 8px rgba(0,0,0,.18),0 0 44px color-mix(in srgb,var(--gx-l-base) 55%,transparent)}

.launcher[data-pulse]::after{
  content:"";position:absolute;inset:-4px;border-radius:inherit;
  border:2px solid var(--gx-l-base);opacity:0;animation:gx-pulse 2s ease-out infinite;pointer-events:none;
}
@keyframes gx-pulse{0%{opacity:.6;transform:scale(.92)}100%{opacity:0;transform:scale(1.22)}}

.ico{position:relative;width:var(--gx-icon);height:var(--gx-icon);flex:none;display:block}
.i-main,.i-close{
  position:absolute;inset:0;transition:opacity .2s ease,transform .3s cubic-bezier(.34,1.56,.64,1);
}
.i-main{display:block;opacity:1;transform:rotate(0) scale(1)}
.i-close{opacity:0;transform:rotate(-45deg) scale(.4);pointer-events:none}
.launcher[data-open] .i-main{opacity:0;transform:rotate(45deg) scale(.4)}
.launcher[data-open] .i-close{opacity:1;transform:rotate(0) scale(1);pointer-events:auto}
.ico svg,.ico img{width:100%;height:100%;display:block;object-fit:contain}
.ico svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ico img{border-radius:4px}

.lbl{
  font-size:var(--gx-lsize,13px);font-weight:650;white-space:nowrap;letter-spacing:-.01em;
  overflow:hidden;text-overflow:ellipsis;max-width:240px;
}
.lbl[hidden]{display:none}

.launcher[data-label][data-lmode=hover]{width:var(--gx-size);padding:0;gap:0}
.launcher[data-label][data-lmode=hover]:hover,
.launcher[data-label][data-lmode=hover]:focus-visible{width:auto;padding:0 var(--gx-lpad,16px);gap:8px}
.launcher[data-lmode=hover] .lbl{max-width:0;opacity:0;transition:max-width .28s ease,opacity .18s ease}
.launcher[data-lmode=hover]:hover .lbl,
.launcher[data-lmode=hover]:focus-visible .lbl{max-width:220px;opacity:1}
.launcher[data-label][data-lmode=hover][data-open]{width:var(--gx-size);padding:0;gap:0}
.launcher[data-lmode=hover][data-open] .lbl{max-width:0;opacity:0}

/* position offsets */
[data-pos$=right] :is(.launcher,.panel){right:var(--gx-ox,20px)}
[data-pos$=left] :is(.launcher,.panel){left:var(--gx-ox,20px)}
[data-pos^=bottom] .launcher{bottom:var(--gx-oy,20px)}
[data-pos^=top] .launcher{top:var(--gx-oy,20px)}

/* ── backdrop ── */
.backdrop{
  position:fixed;inset:0;background:rgba(0,0,0,.45);opacity:0;visibility:hidden;
  transition:opacity .25s,visibility .25s;z-index:1;
}
.backdrop[data-open]{opacity:1;visibility:visible}
.gx[data-backdrop-blur] .backdrop{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gx[data-no-backdrop] .backdrop{display:none}

/* ── panel base ── */
.panel{
  position:fixed;display:flex;flex-direction:column;overflow:hidden;
  background:var(--gx-panel-bg,var(--bg));
  border-style:solid;border-width:var(--gx-bw,1px);border-color:var(--border);
  border-radius:var(--gx-radius);
  z-index:2;opacity:0;visibility:hidden;
}
.panel[data-open]{opacity:1;visibility:visible}

.busybar{position:absolute;left:0;right:0;top:0;height:2px;overflow:hidden;opacity:0;transition:opacity .2s;pointer-events:none;z-index:5}
.gx[data-busy] .busybar{opacity:1}
.busybar::after{
  content:"";position:absolute;inset:0;width:40%;
  background:linear-gradient(90deg,transparent,var(--gx-accent,var(--gx-primary)),transparent);
  animation:gx-sweep 1.15s ease-in-out infinite;
}
@keyframes gx-sweep{0%{transform:translateX(-120%)}100%{transform:translateX(350%)}}

.fx{position:absolute;top:10px;z-index:4;
  background:color-mix(in srgb,var(--bg) 55%,transparent);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  box-shadow:0 2px 10px rgba(0,0,0,.18);
}
[data-pos$=right] .fx{right:10px}
[data-pos$=left] .fx{left:10px}
.fx[hidden]{display:none}

/* animations */
.gx[data-anim=fade] .panel{transition:opacity .22s,visibility .22s}
.gx[data-anim=slide] .panel{transition:opacity .28s,transform .28s cubic-bezier(.22,1,.36,1),visibility .28s}
.gx[data-anim=scale] .panel{transition:opacity .22s,transform .22s cubic-bezier(.22,1,.36,1),visibility .22s}
.gx[data-anim=spring] .panel{transition:opacity .32s,transform .4s cubic-bezier(.34,1.4,.64,1),visibility .32s}

/* presentation modes */
.gx[data-pres=panel] .panel{
  width:min(var(--gx-w),calc(100% - 28px));height:min(var(--gx-h),calc(100% - var(--gx-size) - 60px));
  transform:translateY(12px) scale(.97);
}
.gx[data-pres=panel] .panel[data-open]{transform:none}
[data-pos^=bottom][data-pres=panel] .panel{bottom:calc(var(--gx-oy,20px) + var(--gx-size) + 14px)}
[data-pos^=top][data-pres=panel] .panel{top:calc(var(--gx-oy,20px) + var(--gx-size) + 14px)}

.gx[data-pres=drawer] .panel{top:0;bottom:0;height:100%;width:min(var(--gx-w),92vw);border-radius:0}
.gx[data-pres=drawer][data-side=right] .panel{right:0;left:auto;transform:translateX(100%);border-top:0;border-right:0;border-bottom:0}
.gx[data-pres=drawer][data-side=left] .panel{left:0;right:auto;transform:translateX(-100%);border-top:0;border-left:0;border-bottom:0}
.gx[data-pres=drawer][data-side=bottom] .panel{
  left:0;right:0;top:auto;bottom:0;width:100%;height:min(var(--gx-h),85vh);
  border-radius:var(--gx-radius) var(--gx-radius) 0 0;transform:translateY(100%);
  border-left:0;border-right:0;border-bottom:0;
}
.gx[data-pres=drawer] .panel[data-open]{transform:none}

.gx[data-pres=sheet] .panel{
  left:0;right:0;bottom:0;width:100%;height:min(var(--gx-h),88vh);
  border-radius:var(--gx-radius) var(--gx-radius) 0 0;transform:translateY(100%);
  border-left:0;border-right:0;border-bottom:0;
}
.gx[data-pres=sheet] .panel[data-open]{transform:none}

.gx[data-pres=dialog] .panel{
  left:50%;right:auto;top:50%;width:min(var(--gx-w),calc(100% - 32px));height:min(var(--gx-h),calc(100% - 48px));
  transform:translate(-50%,-46%) scale(.94);border-radius:var(--gx-radius);
}
.gx[data-pres=dialog] .panel[data-open]{transform:translate(-50%,-50%) scale(1)}

.gx[data-pres=popover] .panel{
  width:min(var(--gx-w),calc(100% - 24px));height:min(var(--gx-h),calc(100% - var(--gx-size) - 48px));
  transform:translateY(8px) scale(.96);
}
.gx[data-pres=popover] .panel[data-open]{transform:none}
[data-pos^=bottom][data-pres=popover] .panel{bottom:calc(var(--gx-oy,20px) + var(--gx-size) + 10px)}
[data-pos^=top][data-pres=popover] .panel{top:calc(var(--gx-oy,20px) + var(--gx-size) + 10px)}

.gx[data-pres=fullscreen] .panel{
  inset:0;right:auto;width:100%;height:100%;border-radius:0;transform:scale(.98);border:0;
}
.gx[data-pres=fullscreen] .panel[data-open]{transform:none}

/* header */
header{
  position:relative;display:flex;align-items:center;gap:12px;
  padding:var(--gx-pad) calc(var(--gx-pad) + 2px);
  border-bottom:1px solid var(--border);flex:none;
}
.gx[data-header=gradient] header{
  background:linear-gradient(135deg,color-mix(in srgb,var(--gx-primary) 18%,transparent),transparent);
}
.gx[data-header=solid] header{background:color-mix(in srgb,var(--gx-primary) 12%,var(--bg))}
.gx[data-header=minimal] header{background:transparent;border-bottom-color:transparent;padding-bottom:6px}
.gx[data-header=glass] header{
  background:color-mix(in srgb,var(--bg) 55%,transparent);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
}
header[hidden]{display:none}
.gx[data-hdr-custom] header{background:var(--gx-hdr-bg);color:var(--gx-hdr-fg,var(--text))}

.avatar{width:36px;height:36px;border-radius:50%;background:var(--gx-primary);object-fit:cover;flex:none}
.title{flex:1;min-width:0}
.name{font-weight:650;font-size:14.5px;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sub{font-size:11.5px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.x{
  background:none;border:0;cursor:pointer;color:var(--muted);
  padding:6px;border-radius:8px;flex:none;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s,color .15s;
}
.x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.x:hover{background:var(--surface);color:var(--text)}
.x[hidden]{display:none}

/* messages container */
.msgs{flex:1;overflow:auto;padding:var(--gx-pad);display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.msgs::-webkit-scrollbar{width:6px}
.msgs::-webkit-scrollbar-thumb{background:var(--border);border-radius:999px}
.msgs::-webkit-scrollbar-track{background:transparent}

.row{display:flex;gap:8px;max-width:100%}
.row.user{justify-content:flex-end}
.col{display:flex;flex-direction:column;min-width:0;max-width:100%;gap:6px}
.row.user .col{align-items:flex-end}
.mav{width:26px;height:26px;border-radius:50%;flex:none;background:var(--gx-primary);object-fit:cover;align-self:flex-end}

/* bubble */
.m{
  width:fit-content;
  max-width:var(--gx-mw,85%);
  padding:10px 14px;
  font-size:var(--gx-fs,13.5px);
  line-height:1.55;
  overflow-wrap:break-word;
  word-break:normal;
  white-space:pre-wrap;
}
.m.assistant{
  white-space:normal;
}
.m.assistant{background:var(--gx-ai-bg,var(--bubble-ai));color:var(--gx-ai-fg,inherit)}
.m.user{background:var(--gx-user-bg,var(--gx-primary));color:var(--gx-user-fg,var(--gx-on-primary,#fff))}
.gx[data-ai-border] .m.assistant{border:1px solid var(--border)}
.gx[data-align=left] .row.user{justify-content:flex-start}
.gx[data-align=left] .row.user .col{align-items:flex-start}

.gx[data-bubble=soft] .m{border-radius:calc(var(--gx-radius) * .7)}
.gx[data-bubble=soft] .m.assistant{border-bottom-left-radius:4px}
.gx[data-bubble=soft] .m.user{border-bottom-right-radius:4px}
.gx[data-bubble=rounded] .m{border-radius:calc(var(--gx-radius) * .9)}
.gx[data-bubble=bubble] .m{border-radius:18px}
.gx[data-bubble=bubble] .m.assistant{border-bottom-left-radius:4px}
.gx[data-bubble=bubble] .m.user{border-bottom-right-radius:4px}
.gx[data-bubble=sharp] .m{border-radius:6px}
.ts{font-size:10.5px;color:var(--muted);padding:0 2px}

/* ───────────────────────────────── rich markdown ───────────────────────────────── */
.m p{margin:0 0 8px 0}.m p:last-child{margin-bottom:0}
.m strong{font-weight:700;color:inherit}
.m em{font-style:italic}
.m h1,.m h2,.m h3,.m h4{margin:12px 0 6px 0;font-weight:700;line-height:1.3}
.m h1:first-child,.m h2:first-child,.m h3:first-child{margin-top:0}
.m h1{font-size:1.25em}.m h2{font-size:1.15em}.m h3{font-size:1.05em}
.m ul,.m ol{margin:6px 0;padding-left:20px}
.m li{margin:2px 0}
.m a{color:var(--gx-primary);text-decoration:underline;text-underline-offset:2px}
.m blockquote{margin:8px 0;padding:4px 10px;border-left:3px solid var(--gx-primary);background:color-mix(in srgb,var(--gx-primary) 8%,transparent);border-radius:0 6px 6px 0;font-style:italic}

/* code block */
.m code.inline-code{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:0.86em;
  padding:2px 5px;border-radius:5px;background:rgba(128,128,128,.18);color:inherit;
}
.m .code-block{
  margin:10px 0;border-radius:10px;overflow:hidden;background:#090d16;color:#e2e8f0;
  border:1px solid rgba(255,255,255,.1);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.m .code-header{
  display:flex;align-items:center;justify-content:space-between;padding:6px 12px;
  background:rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.08);font-size:11px;
}
.m .code-lang{text-transform:uppercase;color:var(--muted);font-weight:600}
.m .code-copy{
  background:none;border:0;color:var(--muted);cursor:pointer;font-size:11px;
  display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;transition:.15s;
}
.m .code-copy:hover{color:#fff;background:rgba(255,255,255,.1)}
.m .code-copy svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}
.m pre{margin:0;padding:10px 12px;overflow-x:auto;font-size:12px;line-height:1.5;color:#e2e8f0}

/* tables */
.m .gora-table-wrap{overflow-x:auto;margin:10px 0;border-radius:8px;border:1px solid var(--border)}
.m table{width:100%;border-collapse:collapse;font-size:12px;text-align:left}
.m th,.m td{padding:6px 10px;border-bottom:1px solid var(--border)}
.m th{background:color-mix(in srgb,var(--text) 5%,transparent);font-weight:600}
.m tr:last-child td{border-bottom:none}

/* ───────────────────────────────── timeline reasoning block ───────────────────────────────── */
.reasoning-block{
  max-width:var(--gx-mw,85%);border-radius:12px;border:1px solid var(--border);
  background:color-mix(in srgb,var(--bg) 80%,transparent);overflow:hidden;transition:border-color .15s;
}
.reasoning-btn{
  width:100%;display:flex;align-items:center;gap:8px;padding:7px 11px;border:0;
  background:transparent;cursor:pointer;font-size:11.5px;color:var(--muted);text-align:left;
}
.reasoning-btn:hover{background:rgba(128,128,128,.06);color:var(--text)}
.reasoning-btn .spark{color:var(--gx-primary);flex:none;display:grid;place-items:center}
.reasoning-btn .spark svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2}
.reasoning-btn .title{flex:1;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reasoning-btn .time{font-family:ui-monospace,monospace;font-size:10px;color:var(--muted);flex:none}
.reasoning-btn .chevron{
  width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;
  transition:transform .2s;flex:none;
}
.reasoning-block.open .chevron{transform:rotate(180deg)}
.reasoning-body{
  padding:8px 12px 10px;border-top:1px solid var(--border);font-size:11.5px;line-height:1.5;
  font-family:ui-monospace,monospace;color:var(--muted);white-space:pre-wrap;word-break:break-word;
  max-height:180px;overflow-y:auto;display:none;background:rgba(0,0,0,.15);
}
.reasoning-block.open .reasoning-body{display:block}

/* ───────────────────────────────── live tool block ───────────────────────────────── */
.tool-block{
  display:inline-flex;align-items:center;gap:8px;padding:5px 11px;border-radius:99px;
  background:color-mix(in srgb,var(--gx-primary) 9%,var(--surface));
  border:1px solid color-mix(in srgb,var(--gx-primary) 30%,var(--border));
  font-size:11.5px;font-weight:550;color:var(--text);margin-bottom:2px;
}
.tool-icon{display:grid;place-items:center;color:var(--gx-primary);flex:none}
.tool-icon svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2}
.tool-timer{font-family:ui-monospace,monospace;font-size:10px;color:var(--muted);margin-left:auto;padding-left:4px}
.tool-status-icon svg{width:12px;height:12px;stroke-width:2.5}
.tool-status-icon.running svg{animation:gx-spin .8s linear infinite}
.tool-status-icon.done svg{color:#22c55e}
.tool-status-icon.error svg{color:#ef4444}

/* ───────────────────────────────── suggested actions ───────────────────────────────── */
.suggested-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;max-width:var(--gx-mw,85%)}
.action-chip{
  display:inline-flex;align-items:center;gap:6px;background:var(--surface);
  border:1px solid var(--border);border-radius:99px;padding:6px 12px;font-size:12px;
  font-weight:500;cursor:pointer;color:var(--text);transition:border-color .15s,transform .15s,background .15s;
}
.action-chip:hover{
  border-color:var(--gx-primary);background:color-mix(in srgb,var(--gx-primary) 8%,var(--surface));
  transform:translateY(-1px);
}
.action-chip svg{width:12px;height:12px;stroke:var(--gx-primary);fill:none;stroke-width:2}

/* ───────────────────────────────── confirmation card (Tier 3) ───────────────────────────────── */
.confirm-card{
  max-width:var(--gx-mw,85%);border-radius:14px;border:1px solid rgba(239,68,68,.35);
  background:color-mix(in srgb,#ef4444 8%,var(--surface));padding:12px;display:flex;flex-direction:column;gap:8px;
}
.confirm-title{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:650;color:#ef4444}
.confirm-title svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
.confirm-desc{font-size:11.5px;line-height:1.45;color:var(--text)}
.confirm-btns{display:flex;gap:6px;margin-top:4px}
.btn-approve{
  padding:5px 12px;border-radius:8px;background:#ef4444;color:#fff;border:0;
  font-size:11.5px;font-weight:600;cursor:pointer;
}
.btn-approve:hover{opacity:.9}
.btn-decline{
  padding:5px 12px;border-radius:8px;background:transparent;color:var(--text);
  border:1px solid var(--border);font-size:11.5px;cursor:pointer;
}
.btn-decline:hover{background:var(--surface)}

/* chips container */
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 var(--gx-pad) 10px}
.chips:empty{display:none}
.chip{
  background:var(--surface);border:1px solid var(--border);border-radius:99px;
  padding:6px 13px;font-size:12px;cursor:pointer;transition:border-color .15s,background .15s,transform .15s;
}
.chip:hover{border-color:var(--gx-primary);background:color-mix(in srgb,var(--gx-primary) 8%,var(--surface));transform:translateY(-1px)}
.chip:active{transform:translateY(0)}

/* composer */
.composer{
  display:flex;
  gap:8px;
  padding:var(--gx-pad);
  border-top:1px solid var(--border);
  align-items:flex-end;
  flex:none;
  background:var(--gx-composer-bg,transparent);
}

textarea{
  flex:1;
  resize:none;
  height:40px;
  min-height:40px;
  max-height:110px;
  line-height:20px;
  padding:9px 13px;
  font-size:13.5px;
  background:var(--gx-input-bg,var(--surface));
  color:var(--gx-input-fg,inherit);
  border:1px solid var(--border);
  border-radius:12px;
  outline:0;
  box-sizing:border-box;
  overflow-y:hidden;
  scrollbar-width:none;
  -ms-overflow-style:none;
  transition:border-color .15s;
}
textarea::-webkit-scrollbar{
  display:none;
  width:0;
  height:0;
}
textarea::placeholder{color:var(--muted);opacity:1}
textarea:focus{border-color:var(--gx-primary)}
textarea:disabled{opacity:.55;cursor:not-allowed}

.send{
  width:40px;
  height:40px;
  border:0;
  border-radius:12px;
  flex:none;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  background:linear-gradient(135deg,var(--gx-primary),var(--gx-accent,var(--gx-primary)));
  color:var(--gx-on-primary,#fff);
  box-shadow:0 4px 14px color-mix(in srgb,var(--gx-primary) 35%,transparent);
  transition:opacity .15s,transform .15s,box-shadow .2s;
}
  
.send svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.send:hover:not(:disabled){transform:scale(1.06)}
.send:active:not(:disabled){transform:scale(.94)}
.send:disabled{opacity:.42;cursor:default;box-shadow:none}

.brand{text-align:center;font-size:10px;letter-spacing:.08em;color:var(--muted);padding:0 0 10px;flex:none}
.brand[hidden]{display:none}

.dots{display:inline-flex;gap:4px;padding:2px 0}
.dots i{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:b 1s infinite}
.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
@keyframes b{50%{transform:translateY(-4px);opacity:.5}}
@keyframes gx-spin{to{transform:rotate(360deg)}}

@media (max-width:480px){
  .gx[data-pres=panel] .panel,.gx[data-pres=popover] .panel{left:10px!important;right:10px!important;width:auto}
}
`;
