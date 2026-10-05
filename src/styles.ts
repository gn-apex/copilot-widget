// src/styles.ts — everything lives inside the widget's shadow root; nothing leaks to or from the host page.

export const CSS = `
:host{all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:var(--gx-font)}
*,*::before,*::after{box-sizing:border-box}
.gx{
  --bg:#0b1220;--surface:#131c31;--surface2:#1a2540;--text:#f1f5f9;--muted:#94a3b8;--border:rgba(255,255,255,.1);
  --bubble-ai:color-mix(in srgb,var(--gx-primary,#06b6d4) 7%,#1a2540);
  --pad:var(--gx-pad,14px);color:var(--text);
  --code-bg:#0a0e17;--code-fg:#dbe3f0;--code-bd:rgba(255,255,255,.09);--code-hd:rgba(255,255,255,.04);--code-mu:#7d8aa3;
  --tk-c:#6b7a96;--tk-s:#9ad59b;--tk-n:#f0a674;--tk-k:#c0a2f7;--tk-f:#7fb7ff;--tk-t:#f0d27a;--tk-p:#7dd3c8;--tk-d:#f08aa8;
}
.gx[data-mode=light]{
  --bg:#fff;--surface:#f8fafc;--surface2:#eef2f7;--text:#0f172a;--muted:#64748b;--border:rgba(15,23,42,.09);
  --bubble-ai:color-mix(in srgb,var(--gx-primary,#06b6d4) 6%,#eef2f7);
}
.gx[data-code=light],.gx[data-code=auto][data-mode=light]{
  --code-bg:#f6f8fb;--code-fg:#1e293b;--code-bd:rgba(15,23,42,.1);--code-hd:rgba(15,23,42,.04);--code-mu:#64748b;
  --tk-c:#8a96a8;--tk-s:#1f7a4d;--tk-n:#b45309;--tk-k:#7c3aed;--tk-f:#1d4ed8;--tk-t:#a16207;--tk-p:#0f766e;--tk-d:#be185d;
}
button,textarea,input{font:inherit;color:inherit}
button{-webkit-tap-highlight-color:transparent}
[hidden]{display:none!important}

.gx[data-density=compact]{--gx-pad:10px}
.gx[data-density=comfortable]{--gx-pad:14px}
.gx[data-density=spacious]{--gx-pad:18px}

.gx[data-glass] .panel{
  background:color-mix(in srgb,var(--bg) 76%,transparent)!important;
  backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);
}
.gx[data-shadow=none] .panel{box-shadow:none}
.gx[data-shadow=soft] .panel{box-shadow:0 8px 28px rgba(0,0,0,.12)}
.gx[data-shadow=medium] .panel{box-shadow:0 24px 64px rgba(0,0,0,.28)}
.gx[data-shadow=bold] .panel{box-shadow:0 32px 90px rgba(0,0,0,.45),0 0 0 1px var(--border)}

.launcher,.panel,.backdrop,.toasts>*{pointer-events:auto}

/* ───────────── launcher ───────────── */
.launcher{
  position:fixed;height:var(--gx-size);min-width:var(--gx-size);border:0;
  border-radius:var(--gx-launcher-radius);cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  background:var(--gx-l-bg);color:var(--gx-l-fg);
  box-shadow:0 10px 28px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.15);
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease,width .25s ease,padding .25s ease,gap .25s ease,opacity .2s;
  z-index:2;isolation:isolate;
}
.launcher:not([data-label]){width:var(--gx-size);padding:0}
.launcher[data-label]{width:auto;padding:0 var(--gx-lpad,16px)}
.launcher[data-lpos=before]{flex-direction:row-reverse}
.launcher:hover{transform:translateY(-2px) scale(1.045);box-shadow:0 16px 38px rgba(0,0,0,.26),0 2px 8px rgba(0,0,0,.18)}
.launcher:active{transform:translateY(0) scale(.95)}
.launcher:focus-visible{outline:2px solid var(--gx-accent,var(--gx-primary));outline-offset:3px}
.launcher[data-hide]{opacity:0;transform:scale(.6);pointer-events:none;box-shadow:none}
.launcher[data-glow]{box-shadow:0 10px 28px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.15),0 0 30px color-mix(in srgb,var(--gx-l-base) 45%,transparent)}
.launcher[data-glow]:hover{box-shadow:0 16px 38px rgba(0,0,0,.26),0 2px 8px rgba(0,0,0,.18),0 0 44px color-mix(in srgb,var(--gx-l-base) 55%,transparent)}
.launcher[data-pulse]::after{
  content:"";position:absolute;inset:-4px;border-radius:inherit;
  border:2px solid var(--gx-l-base);opacity:0;animation:gx-pulse 2s ease-out infinite;pointer-events:none;
}
@keyframes gx-pulse{0%{opacity:.6;transform:scale(.92)}100%{opacity:0;transform:scale(1.22)}}
.launcher .badge{
  position:absolute;top:-3px;right:-3px;min-width:14px;height:14px;border-radius:99px;background:#ef4444;
  border:2px solid var(--bg);transform:scale(0);transition:transform .25s cubic-bezier(.34,1.56,.64,1);
}
.launcher[data-unread] .badge{transform:scale(1)}

.ico{position:relative;width:var(--gx-icon);height:var(--gx-icon);flex:none;display:block}
.i-main,.i-close{position:absolute;inset:0;transition:opacity .2s ease,transform .3s cubic-bezier(.34,1.56,.64,1)}
.i-main{display:block;opacity:1;transform:rotate(0) scale(1)}
.i-close{opacity:0;transform:rotate(-45deg) scale(.4);pointer-events:none}
.launcher[data-open] .i-main{opacity:0;transform:rotate(45deg) scale(.4)}
.launcher[data-open] .i-close{opacity:1;transform:rotate(0) scale(1);pointer-events:auto}
.ico svg,.ico img{width:100%;height:100%;display:block;object-fit:contain}
.ico svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ico img{border-radius:4px}
.lbl{font-size:var(--gx-lsize,13px);font-weight:650;white-space:nowrap;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;max-width:240px}
.launcher[data-label][data-lmode=hover]{width:var(--gx-size);padding:0;gap:0}
.launcher[data-label][data-lmode=hover]:hover,.launcher[data-label][data-lmode=hover]:focus-visible{width:auto;padding:0 var(--gx-lpad,16px);gap:8px}
.launcher[data-lmode=hover] .lbl{max-width:0;opacity:0;transition:max-width .28s ease,opacity .18s ease}
.launcher[data-lmode=hover]:hover .lbl,.launcher[data-lmode=hover]:focus-visible .lbl{max-width:220px;opacity:1}
.launcher[data-label][data-lmode=hover][data-open]{width:var(--gx-size);padding:0;gap:0}
.launcher[data-lmode=hover][data-open] .lbl{max-width:0;opacity:0}

[data-pos$=right] :is(.launcher,.panel){right:var(--gx-ox,20px)}
[data-pos$=left] :is(.launcher,.panel){left:var(--gx-ox,20px)}
[data-pos^=bottom] .launcher{bottom:var(--gx-oy,20px)}
[data-pos^=top] .launcher{top:var(--gx-oy,20px)}

/* ───────────── backdrop & panel ───────────── */
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s;z-index:1}
.backdrop[data-open]{opacity:1;visibility:visible}
.gx[data-backdrop-blur] .backdrop{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gx[data-no-backdrop] .backdrop{display:none}

.panel{
  position:fixed;display:flex;flex-direction:column;overflow:hidden;
  background:var(--gx-panel-bg,var(--bg));
  border-style:solid;border-width:var(--gx-bw,1px);border-color:var(--border);
  border-radius:var(--gx-radius);z-index:2;opacity:0;visibility:hidden;
}
.panel[data-open]{opacity:1;visibility:visible}

.busybar{position:absolute;left:0;right:0;top:0;height:2px;overflow:hidden;opacity:0;transition:opacity .2s;pointer-events:none;z-index:5}
.gx[data-busy] .busybar{opacity:1}
.busybar::after{content:"";position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent,var(--gx-accent,var(--gx-primary)),transparent);animation:gx-sweep 1.15s ease-in-out infinite}
@keyframes gx-sweep{0%{transform:translateX(-120%)}100%{transform:translateX(350%)}}

.gx[data-anim=fade] .panel{transition:opacity .22s,visibility .22s}
.gx[data-anim=slide] .panel{transition:opacity .28s,transform .28s cubic-bezier(.22,1,.36,1),visibility .28s}
.gx[data-anim=scale] .panel{transition:opacity .22s,transform .22s cubic-bezier(.22,1,.36,1),visibility .22s}
.gx[data-anim=spring] .panel{transition:opacity .32s,transform .4s cubic-bezier(.34,1.4,.64,1),visibility .32s}

.gx[data-pres=panel] .panel{width:min(var(--gx-w),calc(100% - 28px));height:min(var(--gx-h),calc(100% - var(--gx-size) - 60px));transform:translateY(12px) scale(.97)}
.gx[data-pres=panel] .panel[data-open]{transform:none}
[data-pos^=bottom][data-pres=panel] .panel{bottom:calc(var(--gx-oy,20px) + var(--gx-size) + 14px)}
[data-pos^=top][data-pres=panel] .panel{top:calc(var(--gx-oy,20px) + var(--gx-size) + 14px)}

.gx[data-pres=drawer] .panel{top:0;bottom:0;height:100%;width:min(var(--gx-w),92vw);border-radius:0}
.gx[data-pres=drawer][data-side=right] .panel{right:0;left:auto;transform:translateX(100%);border-top:0;border-right:0;border-bottom:0}
.gx[data-pres=drawer][data-side=left] .panel{left:0;right:auto;transform:translateX(-100%);border-top:0;border-left:0;border-bottom:0}
.gx[data-pres=drawer][data-side=bottom] .panel{left:0;right:0;top:auto;bottom:0;width:100%;height:min(var(--gx-h),85vh);border-radius:var(--gx-radius) var(--gx-radius) 0 0;transform:translateY(100%);border-left:0;border-right:0;border-bottom:0}
.gx[data-pres=drawer] .panel[data-open]{transform:none}

.gx[data-pres=sheet] .panel{left:0;right:0;bottom:0;width:100%;height:min(var(--gx-h),88vh);border-radius:var(--gx-radius) var(--gx-radius) 0 0;transform:translateY(100%);border-left:0;border-right:0;border-bottom:0}
.gx[data-pres=sheet] .panel[data-open]{transform:none}

.gx[data-pres=dialog] .panel{left:50%;right:auto;top:50%;width:min(var(--gx-w),calc(100% - 32px));height:min(var(--gx-h),calc(100% - 48px));transform:translate(-50%,-46%) scale(.94);border-radius:var(--gx-radius)}
.gx[data-pres=dialog] .panel[data-open]{transform:translate(-50%,-50%) scale(1)}

.gx[data-pres=popover] .panel{width:min(var(--gx-w),calc(100% - 24px));height:min(var(--gx-h),calc(100% - var(--gx-size) - 48px));transform:translateY(8px) scale(.96)}
.gx[data-pres=popover] .panel[data-open]{transform:none}
[data-pos^=bottom][data-pres=popover] .panel{bottom:calc(var(--gx-oy,20px) + var(--gx-size) + 10px)}
[data-pos^=top][data-pres=popover] .panel{top:calc(var(--gx-oy,20px) + var(--gx-size) + 10px)}

.gx[data-pres=fullscreen] .panel{inset:0;right:auto;width:100%;height:100%;border-radius:0;transform:scale(.98);border:0}
.gx[data-pres=fullscreen] .panel[data-open]{transform:none}

/* ───────────── header ───────────── */
header{position:relative;display:flex;align-items:center;gap:12px;padding:var(--gx-pad) calc(var(--gx-pad) + 2px);border-bottom:1px solid var(--border);flex:none}
.gx[data-header=gradient] header{background:linear-gradient(135deg,color-mix(in srgb,var(--gx-primary) 18%,transparent),transparent)}
.gx[data-header=solid] header{background:color-mix(in srgb,var(--gx-primary) 12%,var(--bg))}
.gx[data-header=minimal] header{background:transparent;border-bottom-color:transparent;padding-bottom:6px}
.gx[data-header=glass] header{background:color-mix(in srgb,var(--bg) 55%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.gx[data-hdr-custom] header{background:var(--gx-hdr-bg);color:var(--gx-hdr-fg,var(--text))}
.avwrap{position:relative;flex:none;width:36px;height:36px}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--gx-primary);object-fit:cover;display:block}
.sdot{position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid var(--bg);animation:gx-live 2.4s ease-out infinite}
@keyframes gx-live{0%{box-shadow:0 0 0 0 rgba(34,197,94,.45)}70%,100%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}
.title{flex:1;min-width:0}
.name{font-weight:650;font-size:14.5px;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sub{font-size:11.5px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gx[data-hdr-custom] .sub{color:inherit;opacity:.72}
.hact{display:flex;align-items:center;gap:2px;flex:none}
.x{background:none;border:0;cursor:pointer;color:var(--muted);padding:6px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s,transform .15s}
.gx[data-hdr-custom] .x{color:inherit;opacity:.75}
.x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.x:hover{background:var(--surface);color:var(--text)}
.x:focus-visible{outline:2px solid var(--gx-primary);outline-offset:1px}
.x.danger:hover{background:color-mix(in srgb,#ef4444 14%,transparent);color:#ef4444}

.fbar{position:absolute;top:10px;z-index:4;display:flex;gap:4px;padding:2px;border-radius:10px;background:color-mix(in srgb,var(--bg) 55%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 2px 10px rgba(0,0,0,.18)}
[data-pos$=right] .fbar{right:10px}
[data-pos$=left] .fbar{left:10px}

/* ───────────── messages ───────────── */
.msgwrap{position:relative;flex:1;min-height:0;display:flex;flex-direction:column}
.msgs{flex:1;overflow:auto;padding:var(--gx-pad);display:flex;flex-direction:column;gap:var(--gx-gap,12px);scrollbar-width:thin;scrollbar-color:var(--border) transparent;overscroll-behavior:contain}
.msgs::-webkit-scrollbar{width:6px}
.msgs::-webkit-scrollbar-thumb{background:var(--border);border-radius:999px}
.msgs::-webkit-scrollbar-track{background:transparent}

.tobottom{
  position:absolute;left:50%;bottom:10px;width:34px;height:34px;border-radius:50%;border:1px solid var(--border);
  background:var(--bg);color:var(--text);cursor:pointer;display:grid;place-items:center;z-index:3;
  box-shadow:0 6px 18px rgba(0,0,0,.25);transform:translate(-50%,10px) scale(.8);opacity:0;pointer-events:none;
  transition:opacity .18s,transform .25s cubic-bezier(.34,1.56,.64,1);
}
.tobottom[data-show]{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
.tobottom svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.tobottom:hover{border-color:var(--gx-primary);color:var(--gx-primary)}

/* WIDTH MODEL
   .row is the full-width lane. .col is the "message blob": it shrinks to its content and is capped at
   the configured % of the lane. Bubble, badges, actions and attachments all fill .col, so they always share one width
   and a bubble never wraps before it actually reaches the cap. */
.row{display:flex;gap:8px;width:100%;min-width:0}
.row.user{justify-content:flex-end}
.gx[data-align=left] .row.user{justify-content:flex-start}
.col{display:flex;flex-direction:column;min-width:0;gap:6px;flex:0 1 auto}
.row.user .col{max-width:var(--gx-umw,80%);align-items:flex-end}
.gx[data-align=left] .row.user .col{align-items:flex-start}
.row.assistant .col{max-width:var(--gx-amw,100%)}
.gx[data-avatar] .row.assistant .col{max-width:calc(var(--gx-amw,100%) - 34px)}
.mav{width:26px;height:26px;border-radius:50%;flex:none;background:var(--gx-primary);object-fit:cover;align-self:flex-start;margin-top:2px}
.sender{font-size:11px;font-weight:650;color:var(--muted);padding:0 2px;letter-spacing:.01em}

/* badges that sit with a bubble match its width exactly (contribute 0 to sizing, then fill) */
.col[data-b]{min-width:min(100%,236px)}
.col[data-b]>:is(.reasoning-block,.tool-block,.confirm-card,.suggested-actions){width:0;min-width:100%}
.col:not([data-b])>:is(.reasoning-block,.tool-block,.confirm-card,.suggested-actions){align-self:flex-start;max-width:100%}
.col:not([data-b])>.reasoning-block{width:min(100%,300px)}

.m{
  width:100%;min-width:0;padding:var(--gx-py,10px) calc(var(--gx-py,10px) * 1.4);
  font-size:var(--gx-fs,13.5px);line-height:var(--gx-lh,1.55);
  overflow-wrap:anywhere;word-break:normal;white-space:pre-wrap;
}
.m.assistant{white-space:normal;background:var(--gx-ai-bg,var(--bubble-ai));color:var(--gx-ai-fg,inherit)}
.m.user{background:var(--gx-user-bg,var(--gx-primary));color:var(--gx-user-fg,var(--gx-on-primary,#fff));width:fit-content;max-width:100%}
.gx[data-ai-border] .m.assistant{border:1px solid var(--border)}
.gx[data-aistyle=plain] .m.assistant{background:transparent;border:0;border-radius:0;padding:2px 0}

.gx[data-bubble=soft] .m{border-radius:calc(var(--gx-radius) * .7)}
.gx[data-bubble=soft] .m.assistant{border-bottom-left-radius:4px}
.gx[data-bubble=soft] .m.user{border-bottom-right-radius:4px}
.gx[data-bubble=soft][data-align=left] .m.user{border-bottom-right-radius:calc(var(--gx-radius) * .7);border-bottom-left-radius:4px}
.gx[data-bubble=rounded] .m{border-radius:calc(var(--gx-radius) * .9)}
.gx[data-bubble=bubble] .m{border-radius:18px}
.gx[data-bubble=bubble] .m.assistant{border-bottom-left-radius:4px}
.gx[data-bubble=bubble] .m.user{border-bottom-right-radius:4px}
.gx[data-bubble=bubble][data-align=left] .m.user{border-bottom-right-radius:18px;border-bottom-left-radius:4px}
.gx[data-bubble=sharp] .m{border-radius:6px}
.gx[data-aistyle=plain] .m.assistant{border-radius:0}
.ts{font-size:10.5px;color:var(--muted);padding:0 2px;width:0;min-width:100%;white-space:nowrap}
.row.user .ts{text-align:right}
.gx[data-align=left] .row.user .ts{text-align:left}

.row.enter{animation:gx-rise .32s cubic-bezier(.2,.8,.2,1) both}
.gx[data-manim=fade] .row.enter{animation-name:gx-fade}
.gx[data-manim=pop] .row.enter{animation-name:gx-pop;transform-origin:bottom left}
.gx[data-manim=pop] .row.user.enter{transform-origin:bottom right}
.gx[data-manim=none] .row.enter{animation:none}
@keyframes gx-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes gx-fade{from{opacity:0}to{opacity:1}}
@keyframes gx-pop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:none}}

.macts{display:flex;gap:2px;margin-top:-2px;opacity:0;transition:opacity .15s;height:24px;width:0;min-width:100%;justify-content:flex-start}
.row.user .macts{justify-content:flex-end}
.gx[data-align=left] .row.user .macts{justify-content:flex-start}
.gx[data-actions=always] .macts{opacity:.7}
.gx[data-actions=off] .macts{display:none}
.row:hover .macts,.macts:focus-within{opacity:1}
@media (hover:none){.gx[data-actions=hover] .macts{opacity:.6}}
.mact{display:inline-flex;align-items:center;gap:5px;border:0;background:none;color:var(--muted);cursor:pointer;height:24px;padding:0 7px;border-radius:7px;font-size:11px;font-weight:550;transition:background .15s,color .15s}
.mact:hover{background:var(--surface);color:var(--text)}
.mact svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.mact[data-done]{color:#22c55e}

.m.user.has-att{white-space:normal}
.m.user .atts-v{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px}
.m.user .atts-v:last-child{margin-bottom:0}
.m.user.att-only{padding:4px;background:transparent}
.att-img{width:104px;height:104px;border-radius:calc(var(--gx-radius) * .45);overflow:hidden;border:0;padding:0;cursor:zoom-in;background:rgba(0,0,0,.18);flex:none}
.att-img.solo{width:176px;height:176px}
.att-img img{width:100%;height:100%;object-fit:cover;display:block}
.att-file{display:flex;align-items:center;gap:9px;max-width:100%;padding:7px 10px 7px 8px;border-radius:calc(var(--gx-radius) * .45);background:rgba(0,0,0,.16);font-size:12px}
.att-file svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
.att-file b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.att-file small{opacity:.7;font-size:10.5px;flex:none}

/* ───────────── rich text ───────────── */
.m p{margin:0 0 8px}.m p:last-child{margin-bottom:0}
.m strong{font-weight:700}
.m em{font-style:italic}
.m del{opacity:.7}
.m mark{background:color-mix(in srgb,#facc15 42%,transparent);color:inherit;border-radius:3px;padding:0 2px}
.m kbd{font:600 .8em ui-monospace,SFMono-Regular,Menlo,monospace;padding:1px 6px;border:1px solid var(--border);border-bottom-width:2px;border-radius:5px;background:var(--surface)}
.m sup,.m sub{font-size:.75em;line-height:0}
.m h1,.m h2,.m h3,.m h4,.m h5,.m h6{margin:14px 0 6px;font-weight:700;line-height:1.3;letter-spacing:-.01em}
.m h1:first-child,.m h2:first-child,.m h3:first-child,.m h4:first-child{margin-top:0}
.m h1{font-size:1.3em}.m h2{font-size:1.18em}.m h3{font-size:1.07em}.m h4,.m h5,.m h6{font-size:1em}
.m h5,.m h6{color:var(--muted)}
.m ul,.m ol{margin:6px 0;padding-left:1.4em}
.m li{margin:3px 0;padding-left:2px}
.m li::marker{color:color-mix(in srgb,var(--gx-primary) 65%,var(--muted));font-weight:600}
.m li>p{margin:0 0 4px}
.m li>ul,.m li>ol{margin:4px 0 2px}
.m li.task{list-style:none;margin-left:-1.2em}
.m .cb{display:inline-block;width:14px;height:14px;border:1.6px solid var(--muted);border-radius:4px;vertical-align:-2px;margin-right:8px;position:relative}
.m .cb.on{background:var(--gx-primary);border-color:var(--gx-primary)}
.m .cb.on::after{content:"";position:absolute;left:3.5px;top:.5px;width:4px;height:8px;border:solid var(--gx-on-primary,#fff);border-width:0 2px 2px 0;transform:rotate(45deg)}
.m a{color:var(--gx-primary);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--gx-primary) 45%,transparent);text-underline-offset:2px;transition:text-decoration-color .15s}
.m a:hover{text-decoration-color:currentColor}
.m hr{border:0;border-top:1px solid var(--border);margin:12px 0}
.m blockquote{margin:8px 0;padding:4px 12px;border-left:3px solid var(--gx-primary);background:color-mix(in srgb,var(--gx-primary) 7%,transparent);border-radius:0 8px 8px 0;color:inherit}
.m blockquote p{margin:0 0 4px}
.m .md-img{max-width:100%;height:auto;border-radius:10px;display:block;margin:8px 0;cursor:zoom-in;border:1px solid var(--border)}
.m .callout{--cc:#3b82f6;margin:10px 0;padding:9px 12px 10px;border-radius:10px;border-left:3px solid var(--cc);background:color-mix(in srgb,var(--cc) 10%,transparent)}
.m .callout.c-tip{--cc:#22c55e}.m .callout.c-important{--cc:#a855f7}.m .callout.c-warning{--cc:#f59e0b}.m .callout.c-danger{--cc:#ef4444}
.m .callout-t{font-size:.82em;font-weight:700;color:var(--cc);margin-bottom:3px;letter-spacing:.02em}
.m .callout p:last-child{margin-bottom:0}

.m code.inline-code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:.86em;padding:2px 5px;border-radius:5px;background:color-mix(in srgb,var(--text) 11%,transparent);color:inherit;overflow-wrap:anywhere}

.m .code-block{margin:10px 0;border-radius:10px;overflow:hidden;background:var(--code-bg);color:var(--code-fg);border:1px solid var(--code-bd);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.m .code-header{display:flex;align-items:center;justify-content:space-between;padding:5px 6px 5px 12px;background:var(--code-hd);border-bottom:1px solid var(--code-bd);font-size:11px}
.m .code-lang{color:var(--code-mu);font-weight:600;letter-spacing:.02em}
.m .code-actions{display:flex;gap:2px}
.m .code-copy,.m .code-wrap{background:none;border:0;color:var(--code-mu);cursor:pointer;font-size:11px;display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:6px;transition:color .15s,background .15s}
.m .code-copy:hover,.m .code-wrap:hover,.m .code-wrap[data-on]{color:var(--code-fg);background:var(--code-hd)}
.m .code-copy[data-done]{color:#22c55e}
.m .code-copy svg,.m .code-wrap svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.m pre{margin:0;padding:11px 13px;overflow-x:auto;font-size:12px;line-height:1.55;color:var(--code-fg);tab-size:2;scrollbar-width:thin}
.m pre code{font-family:inherit;white-space:pre}
.m .code-block[data-wrap] pre code{white-space:pre-wrap;overflow-wrap:anywhere}
.tk-c{color:var(--tk-c);font-style:italic}.tk-s{color:var(--tk-s)}.tk-n{color:var(--tk-n)}.tk-k{color:var(--tk-k)}
.tk-f{color:var(--tk-f)}.tk-t{color:var(--tk-t)}.tk-p{color:var(--tk-p)}.tk-d{color:var(--tk-d)}
.tk-add{color:#22c55e;background:rgba(34,197,94,.12);display:inline-block;width:100%}
.tk-del{color:#f87171;background:rgba(248,113,113,.12);display:inline-block;width:100%}

.m .tbl-wrap{overflow-x:auto;margin:10px 0;border-radius:10px;border:1px solid var(--border);max-width:100%;scrollbar-width:thin}
.m table{width:100%;border-collapse:collapse;font-size:.92em;text-align:left}
.m th,.m td{padding:7px 11px;border-bottom:1px solid var(--border);vertical-align:top;min-width:64px}
.m th{background:color-mix(in srgb,var(--text) 6%,transparent);font-weight:650;white-space:nowrap}
.m tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--text) 3%,transparent)}
.m tr:last-child td{border-bottom:0}

.math{font-family:"Cambria Math","STIX Two Math","Latin Modern Math","Times New Roman",serif;font-size:1.06em;white-space:nowrap}
.math-disp{display:block;text-align:center;margin:6px 0;overflow-x:auto}
.math-block{overflow-x:auto;margin:10px 0;padding:8px 4px;text-align:center;border-radius:8px;background:color-mix(in srgb,var(--text) 4%,transparent)}
.math .mi{font-style:italic}.math .mn{font-style:normal}.math .mo{padding:0 .13em;font-style:normal}.math .mt{font-style:normal}
.math .mfn2{padding-right:.14em}
.math .mf{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;margin:0 .16em;line-height:1.15}
.math .mfn{border-bottom:1px solid currentColor;padding:0 .22em .06em}.math .mfd{padding:.06em .22em 0}
.math .mf.nb .mfn{border-bottom:0}
.math .mr{position:relative;display:inline-block;padding-left:.8em;white-space:nowrap;line-height:1.2}
.math .mrs{position:absolute;left:0;top:0;width:.8em;height:100%;stroke:currentColor;fill:none;stroke-width:1.1;overflow:visible}
.math .mrb{display:inline-block;border-top:1px solid currentColor;padding:0 .1em;line-height:1.2}
.math .mri{font-size:.62em;margin-right:-.3em;vertical-align:super}
.math sup,.math sub{font-size:.72em;line-height:0}
.math .mss{display:inline-flex;flex-direction:column;vertical-align:middle;font-size:.72em;line-height:1.1;margin-left:1px}
.math .mss sup,.math .mss sub{font-size:1em}
.math .mbig{font-size:1.45em;line-height:1;vertical-align:-.1em;padding:0 .06em}
.math .mbr{font-size:1.15em;font-weight:300}
.math .mmat{display:inline-flex;align-items:center;vertical-align:middle;margin:0 .15em}
.math .mmat>.mbr{font-size:2.4em;font-weight:100;line-height:1;padding:0 .05em}
.math .mmat table{border-collapse:collapse;font-size:1em;width:auto}
.math .mmat td{padding:.1em .55em;border:0;background:none;text-align:center;min-width:0}
.math .mmat[data-a=l] td{text-align:left}.math .mmat[data-a=r] td:nth-child(odd){text-align:right}.math .mmat[data-a=r] td:nth-child(even){text-align:left}
.math .mov{border-top:1px solid currentColor;padding-top:.04em}.math .mun{border-bottom:1px solid currentColor}
.math .mac{position:relative;display:inline-block}
.math .mac::before{content:attr(data-a);position:absolute;top:-.62em;left:50%;transform:translateX(-50%);font-size:.7em;line-height:1}
.math .mbx{border:1px solid currentColor;padding:.1em .35em}.math .mcx{text-decoration:line-through}
.math .mcal{font-family:"Brush Script MT","Apple Chancery",cursive}

/* ───────────── reasoning · tools · confirm · actions ───────────── */
.reasoning-block{border-radius:12px;border:1px solid var(--border);background:color-mix(in srgb,var(--surface) 70%,transparent);overflow:hidden;transition:border-color .15s}
.reasoning-block.open{border-color:color-mix(in srgb,var(--gx-primary) 35%,var(--border))}
.reasoning-btn{width:100%;display:flex;align-items:center;gap:8px;padding:7px 11px;border:0;background:transparent;cursor:pointer;font-size:11.5px;color:var(--muted);text-align:left}
.reasoning-btn:hover{background:rgba(128,128,128,.07);color:var(--text)}
.reasoning-btn .spark{color:var(--gx-primary);flex:none;display:grid;place-items:center}
.reasoning-btn .spark svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2}
.reasoning-block.live .spark svg{animation:gx-twinkle 1.4s ease-in-out infinite}
.reasoning-btn .title{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reasoning-block.live .title{background:linear-gradient(90deg,var(--muted) 30%,var(--text) 50%,var(--muted) 70%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gx-shine 1.8s linear infinite}
.reasoning-btn .time{font-family:ui-monospace,monospace;font-size:10px;color:var(--muted);flex:none}
.reasoning-btn .chevron{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;transition:transform .2s;flex:none}
.reasoning-block.open .chevron{transform:rotate(180deg)}
.reasoning-body{padding:8px 12px 10px;border-top:1px solid var(--border);font-size:11.5px;line-height:1.55;color:var(--muted);white-space:pre-wrap;overflow-wrap:anywhere;max-height:180px;overflow-y:auto;display:none;background:rgba(0,0,0,.12)}
.reasoning-block.open .reasoning-body{display:block}
@keyframes gx-shine{to{background-position:-250% 0}}
@keyframes gx-twinkle{50%{transform:scale(1.25) rotate(12deg);opacity:.7}}

.tool-block{display:flex;align-items:center;gap:8px;padding:6px 11px;border-radius:99px;background:color-mix(in srgb,var(--gx-primary) 9%,var(--surface));border:1px solid color-mix(in srgb,var(--gx-primary) 30%,var(--border));font-size:11.5px;font-weight:550;color:var(--text);min-width:0}
.tool-icon{display:grid;place-items:center;color:var(--gx-primary);flex:none}
.tool-icon svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2}
.tool-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tool-timer{font-family:ui-monospace,monospace;font-size:10px;color:var(--muted);flex:none}
.tool-status-icon{display:grid;place-items:center;flex:none}
.tool-status-icon svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.tool-status-icon.running svg{animation:gx-spin .8s linear infinite}
.tool-status-icon.done{color:#22c55e}.tool-status-icon.error{color:#ef4444}

.suggested-actions{display:flex;flex-wrap:wrap;gap:6px}
.action-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;background:var(--surface);border:1px solid var(--border);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:500;cursor:pointer;color:var(--text);transition:border-color .15s,transform .15s,background .15s}
.action-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.action-chip:hover{border-color:var(--gx-primary);background:color-mix(in srgb,var(--gx-primary) 8%,var(--surface));transform:translateY(-1px)}
.action-chip svg{width:12px;height:12px;flex:none;stroke:var(--gx-primary);fill:none;stroke-width:2}

.confirm-card{border-radius:14px;border:1px solid rgba(239,68,68,.35);background:color-mix(in srgb,#ef4444 8%,var(--surface));padding:12px;display:flex;flex-direction:column;gap:8px}
.confirm-title{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:650;color:#ef4444}
.confirm-title svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
.confirm-desc{font-size:11.5px;line-height:1.45;color:var(--text)}
.confirm-btns{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap}
.btn-approve{padding:5px 12px;border-radius:8px;background:#ef4444;color:#fff;border:0;font-size:11.5px;font-weight:600;cursor:pointer}
.btn-approve:hover{opacity:.9}.btn-approve:disabled{opacity:.6;cursor:default}
.btn-decline{padding:5px 12px;border-radius:8px;background:transparent;color:var(--text);border:1px solid var(--border);font-size:11.5px;cursor:pointer}
.btn-decline:hover{background:var(--surface)}

/* ───────────── suggestions ───────────── */
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 var(--gx-pad) 10px}
.chips:empty{display:none}
.chip{background:var(--surface);border:1px solid var(--border);border-radius:99px;padding:6px 13px;font-size:12px;cursor:pointer;transition:border-color .15s,background .15s,transform .15s}
.chip:hover{border-color:var(--gx-primary);background:color-mix(in srgb,var(--gx-primary) 8%,var(--surface));transform:translateY(-1px)}
.chip:active{transform:translateY(0)}

.notice{margin:0 var(--gx-pad) 8px;padding:7px 11px;border-radius:10px;font-size:11.5px;background:color-mix(in srgb,#f59e0b 14%,var(--surface));border:1px solid color-mix(in srgb,#f59e0b 35%,var(--border));color:var(--text);animation:gx-rise .25s both}

/* ───────────── composer ───────────── */
.composer{flex:none;padding:var(--gx-pad);border-top:1px solid var(--border);background:var(--gx-composer-bg,transparent);--gx-cr:min(calc(var(--gx-radius) * .8),24px)}
.composer[data-cs=pill]{--gx-cr:24px}
.composer[data-cs=rounded]{--gx-cr:calc(var(--gx-radius) * .75)}
.composer[data-cs=square]{--gx-cr:6px}
.cwrap{display:flex;align-items:flex-end;gap:8px}
.cbox{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--gx-input-bg,var(--surface));color:var(--gx-input-fg,inherit);border:1px solid var(--border);border-radius:var(--gx-cr);transition:border-color .15s,box-shadow .2s;position:relative}
.cbox:focus-within{border-color:var(--gx-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--gx-primary) 17%,transparent)}
.composer[data-cs=line] .cbox{border-width:0 0 1.5px;border-radius:0;background:transparent;box-shadow:none}
.crow{display:flex;align-items:flex-end;gap:2px;padding:4px}
textarea{
  flex:1;min-width:0;resize:none;border:0;outline:0;background:transparent;color:inherit;
  height:36px;min-height:36px;max-height:calc(var(--gx-rows,5) * 20px + 16px);
  line-height:20px;padding:8px 6px;font-size:13.5px;overflow-y:hidden;scrollbar-width:none;
}
textarea::-webkit-scrollbar{display:none;width:0;height:0}
textarea::placeholder{color:var(--muted);opacity:1}
textarea:disabled{opacity:.55;cursor:not-allowed}

.attach,.send{width:34px;height:34px;flex:none;border:0;border-radius:calc(var(--gx-cr) - 4px);cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;transition:transform .15s,background .15s,color .15s,opacity .18s,box-shadow .2s}
.composer[data-cs=pill] :is(.attach,.send){border-radius:50%}
.composer:not([data-cs]) :is(.attach,.send),.composer[data-cs=auto] :is(.attach,.send){border-radius:min(calc(var(--gx-cr) - 4px),50%)}
.attach{background:transparent;color:var(--muted)}
.attach:hover:not(:disabled){background:color-mix(in srgb,var(--text) 9%,transparent);color:var(--text)}
.attach svg,.send svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cwrap>.attach{width:42px;height:42px;border:1px solid var(--border);background:var(--gx-input-bg,var(--surface));border-radius:var(--gx-cr)}
.composer[data-cs=pill] .cwrap>.attach{border-radius:50%}

.send{background:linear-gradient(135deg,var(--gx-primary),var(--gx-accent,var(--gx-primary)));color:var(--gx-on-primary,#fff);opacity:.38;transform:scale(.94);box-shadow:none}
.send[data-ready]{opacity:1;transform:none;box-shadow:0 4px 14px color-mix(in srgb,var(--gx-primary) 38%,transparent)}
.send[data-ready]:hover{transform:scale(1.07)}
.send[data-ready]:active{transform:scale(.93)}
.send[data-ss=soft]{background:color-mix(in srgb,var(--gx-primary) 16%,transparent);color:var(--gx-primary);box-shadow:none!important}
.send[data-ss=ghost]{background:transparent;color:var(--gx-primary);box-shadow:none!important}
.send[data-stop]{opacity:1;transform:none}
.send[data-stop] svg{fill:currentColor;stroke-width:0}
.send:disabled{cursor:default}
.attach:focus-visible,.send:focus-visible{outline:2px solid var(--gx-primary);outline-offset:1px}

.atts{display:flex;gap:8px;padding:8px 8px 2px;overflow-x:auto;scrollbar-width:thin}
.pa{position:relative;flex:none;animation:gx-pop .22s both}
.pa .th{width:58px;height:58px;border-radius:calc(var(--gx-radius) * .45);overflow:hidden;background:var(--surface2);border:1px solid var(--border);display:block;padding:0;cursor:zoom-in}
.pa .th img{width:100%;height:100%;object-fit:cover;display:block}
.pa.file{display:flex;align-items:center;gap:8px;height:58px;max-width:190px;padding:0 10px;border-radius:calc(var(--gx-radius) * .45);background:var(--surface2);border:1px solid var(--border);font-size:11.5px}
.pa.file svg{width:20px;height:20px;flex:none;fill:none;stroke:var(--gx-primary);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.pa.file .meta{min-width:0;display:flex;flex-direction:column}
.pa.file b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pa.file small{color:var(--muted);font-size:10px}
.pa .rm{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:2px solid var(--gx-input-bg,var(--surface));background:var(--text);color:var(--bg);cursor:pointer;display:grid;place-items:center;padding:0;opacity:0;transform:scale(.7);transition:opacity .15s,transform .15s}
.pa:hover .rm,.pa .rm:focus-visible{opacity:1;transform:none}
@media (hover:none){.pa .rm{opacity:1;transform:none}}
.pa .rm svg{width:10px;height:10px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round}
.pa.busy::after{content:"";position:absolute;inset:0;border-radius:calc(var(--gx-radius) * .45);background:linear-gradient(100deg,transparent 30%,color-mix(in srgb,var(--gx-primary) 30%,transparent) 50%,transparent 70%) 0 0/250% 100%;animation:gx-shine 1.1s linear infinite;pointer-events:none}

.cfoot{display:flex;justify-content:space-between;gap:10px;padding:5px 4px 0;font-size:10.5px;color:var(--muted)}
.cfoot:empty{display:none}
.cfoot .count{margin-left:auto;font-variant-numeric:tabular-nums}
.cfoot .count[data-warn]{color:#f59e0b}.cfoot .count[data-over]{color:#ef4444;font-weight:650}

.dropzone{position:absolute;inset:0;z-index:22;display:none;place-items:center;text-align:center;padding:24px;background:color-mix(in srgb,var(--bg) 84%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gx[data-drag] .dropzone{display:grid}
.dropzone>div{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 34px;border:2px dashed var(--gx-primary);border-radius:calc(var(--gx-radius) * .9);background:color-mix(in srgb,var(--gx-primary) 8%,transparent)}
.dropzone svg{width:30px;height:30px;fill:none;stroke:var(--gx-primary);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.dropzone b{font-size:14px}.dropzone span{font-size:12px;color:var(--muted)}

.brand{text-align:center;font-size:10px;letter-spacing:.08em;color:var(--muted);padding:0 0 10px;flex:none}

.veil{position:absolute;inset:0;z-index:25;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:gx-fade .18s both}
.dlg{width:min(300px,100%);background:var(--bg);border:1px solid var(--border);border-radius:calc(var(--gx-radius) * .9);padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.4);animation:gx-pop .22s cubic-bezier(.3,1.4,.5,1) both}
.dlg h4{margin:0 0 4px;font-size:14.5px;letter-spacing:-.01em}
.dlg p{margin:0 0 14px;font-size:12.5px;line-height:1.5;color:var(--muted)}
.dlg .btns{display:flex;gap:8px;justify-content:flex-end}
.dlg button{height:32px;padding:0 14px;border-radius:9px;border:1px solid var(--border);background:transparent;cursor:pointer;font-size:12.5px;font-weight:550}
.dlg button:hover{background:var(--surface)}
.dlg button.danger{background:#ef4444;border-color:#ef4444;color:#fff}.dlg button.danger:hover{opacity:.9}
.lightbox{position:absolute;inset:0;z-index:30;display:grid;place-items:center;padding:14px;background:rgba(0,0,0,.86);animation:gx-fade .18s both;cursor:zoom-out}
.lightbox img{max-width:100%;max-height:100%;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.lightbox button{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;display:grid;place-items:center}
.lightbox button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}

.dots{display:inline-flex;gap:4px;padding:3px 0;vertical-align:middle}
.dots i{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:gx-b 1s infinite}
.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
@keyframes gx-b{50%{transform:translateY(-4px);opacity:.5}}
@keyframes gx-spin{to{transform:rotate(360deg)}}
.m.typing{width:fit-content}

/* ───────────── toasts ───────────── */
.toasts{position:fixed;z-index:3;display:flex;flex-direction:column;gap:10px;pointer-events:none;width:min(340px,calc(100vw - 32px))}
[data-pos$=right] .toasts{right:var(--gx-ox,20px);align-items:flex-end}
[data-pos$=left] .toasts{left:var(--gx-ox,20px);align-items:flex-start}
[data-pos^=bottom] .toasts{bottom:calc(var(--gx-oy,20px) + var(--gx-size) + 14px);flex-direction:column-reverse}
[data-pos^=top] .toasts{top:calc(var(--gx-oy,20px) + var(--gx-size) + 14px)}
.toast{
  position:relative;width:100%;cursor:pointer;color:var(--text);background:var(--bg);border:1px solid var(--border);
  border-radius:var(--gx-radius);box-shadow:0 18px 46px rgba(0,0,0,.28),0 2px 8px rgba(0,0,0,.12);
  display:flex;gap:11px;align-items:flex-start;padding:13px 34px 13px 13px;overflow:hidden;
  animation:gx-toast-in .5s cubic-bezier(.3,1.35,.5,1) both;transform-origin:bottom right;
}
[data-pos$=left] .toast{transform-origin:bottom left}
.toast.out{animation:gx-toast-out .26s ease-in both}
@keyframes gx-toast-in{from{opacity:0;transform:translateY(16px) scale(.92)}to{opacity:1;transform:none}}
@keyframes gx-toast-out{to{opacity:0;transform:translateY(8px) scale(.95)}}
.toast .tav{width:34px;height:34px;border-radius:50%;flex:none;background:var(--gx-primary);object-fit:cover}
.toast .tb{min-width:0;flex:1}
.toast .tn{font-size:11.5px;font-weight:650;color:var(--muted);margin-bottom:2px;letter-spacing:.01em}
.toast .tt{font-size:13.5px;line-height:1.45;overflow-wrap:anywhere}
.toast .tr{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.toast .tr button{border:1px solid color-mix(in srgb,var(--gx-primary) 40%,var(--border));background:color-mix(in srgb,var(--gx-primary) 10%,transparent);color:var(--text);border-radius:99px;padding:5px 12px;font-size:12px;font-weight:550;cursor:pointer;transition:background .15s,transform .15s}
.toast .tr button:hover{background:var(--gx-primary);color:var(--gx-on-primary,#fff);transform:translateY(-1px)}
.toast .tx{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;border:0;background:transparent;color:var(--muted);cursor:pointer;display:grid;place-items:center;opacity:.55;transition:opacity .15s,background .15s}
.toast:hover .tx,.toast .tx:focus-visible{opacity:1}
.toast .tx:hover{background:var(--surface);color:var(--text)}
.toast .tx svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
.toast .tp{position:absolute;left:0;bottom:0;height:2.5px;width:100%;background:linear-gradient(90deg,var(--gx-primary),var(--gx-accent,var(--gx-primary)));transform-origin:left;animation:gx-tp linear forwards;animation-duration:var(--td,10s);opacity:.8}
.toast:hover .tp[data-pause]{animation-play-state:paused}
@keyframes gx-tp{to{transform:scaleX(0)}}
.toast[data-style=bubble]{border-radius:calc(var(--gx-radius) * 1.1);background:var(--gx-primary);color:var(--gx-on-primary,#fff);border-color:transparent;overflow:visible}
.toast[data-style=bubble] .tn{color:inherit;opacity:.8}.toast[data-style=bubble] .tx{color:inherit}.toast[data-style=bubble] .tx:hover{background:rgba(255,255,255,.18);color:inherit}
.toast[data-style=bubble] .tp{display:none}
.toast[data-style=bubble] .tr button{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.14);color:inherit}
.toast[data-style=bubble] .tr button:hover{background:#fff;color:var(--gx-primary)}
.toast[data-style=bubble]::after{content:"";position:absolute;bottom:-1px;right:22px;width:14px;height:14px;background:inherit;transform:translateY(50%) rotate(45deg);border-radius:3px}
[data-pos$=left] .toast[data-style=bubble]::after{right:auto;left:22px}
[data-pos^=top] .toast[data-style=bubble]::after{bottom:auto;top:-1px;transform:translateY(-50%) rotate(45deg)}
.toast[data-style=pill]{border-radius:99px;padding:8px 36px 8px 8px;align-items:center;width:auto;max-width:100%;gap:9px}
.toast[data-style=pill] .tav{width:28px;height:28px}
.toast[data-style=pill] .tn,.toast[data-style=pill] .tr{display:none}
.toast[data-style=pill] .tt{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
.toast[data-style=pill] .tx{top:50%;transform:translateY(-50%);right:8px}
.toast[data-style=pill] .tp{height:2px}

@media (max-width:480px){
  .gx[data-pres=panel] .panel,.gx[data-pres=popover] .panel{left:10px!important;right:10px!important;width:auto}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;
