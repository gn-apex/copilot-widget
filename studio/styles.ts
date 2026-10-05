// Studio stylesheet — theme-aware (light / pure-black dark). Dark mode follows the host app's `.dark` class
// (Tailwind `darkMode: "class"`), can be forced from the Studio toolbar, and falls back to the OS preference.
export default `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

.gxs{
  --bg:#fafafa;--s1:#ffffff;--s2:#f4f4f5;--s3:#ebebed;--bd:#e4e4e7;--bd2:#d1d1d6;
  --tx:#09090b;--tx2:#3f3f46;--mu:#71717a;--inv:#ffffff;
  --ac:#a3e635;--ac-ink:#1a2e05;--ac-tx:#4d7c0f;--ac-soft:rgba(163,230,53,.16);
  --warn:#b45309;--bad:#dc2626;--ok:#4d7c0f;
  --shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.06);
  --dots:rgba(0,0,0,.09);--stage:#eceef0;
  --mono:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  height:100%;display:flex;flex-direction:column;position:relative;
  font:13px/1.45 'Geist',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  color:var(--tx);background:var(--bg);-webkit-font-smoothing:antialiased;
}
.gxs[data-theme=dark],.dark .gxs:not([data-theme]){
  --bg:#000;--s1:#0a0a0a;--s2:#111;--s3:#1a1a1a;--bd:#1f1f1f;--bd2:#2e2e2e;
  --tx:#fafafa;--tx2:#c4c4c4;--mu:#8c8c8c;--inv:#000;
  --ac:#bef264;--ac-ink:#0d1a02;--ac-tx:#bef264;--ac-soft:rgba(190,242,100,.12);
  --warn:#fbbf24;--bad:#f87171;--ok:#bef264;
  --shadow:0 0 0 1px #1f1f1f,0 12px 40px rgba(0,0,0,.8);
  --dots:rgba(255,255,255,.07);--stage:#000;
}
.gxs *{box-sizing:border-box}
.gxs button,.gxs input,.gxs select,.gxs textarea{font:inherit;color:inherit}
.gxs button{cursor:pointer}
.gxs svg.i{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
.gxs ::selection{background:var(--ac);color:var(--ac-ink)}
.gxs ::-webkit-scrollbar{width:10px;height:10px}
.gxs ::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:99px;border:3px solid transparent;background-clip:content-box}
.gxs :focus-visible{outline:2px solid var(--ac);outline-offset:1px}

/* ── top bar ── */
.gxs-top{display:flex;align-items:center;gap:6px;padding:0 12px;height:50px;background:var(--s1);border-bottom:1px solid var(--bd);flex:none;z-index:5}
.gxs-brand{display:flex;align-items:center;gap:10px;min-width:0;margin-right:6px}
.gxs-brand .logo{width:26px;height:26px;border-radius:7px;background:var(--tx);color:var(--inv);display:grid;place-items:center;flex:none;position:relative}
.gxs-brand .logo::after{content:"";position:absolute;right:-3px;top:-3px;width:9px;height:9px;border-radius:50%;background:var(--ac);border:2px solid var(--s1)}
.gxs-brand b{font-size:13.5px;font-weight:600;letter-spacing:-.015em;white-space:nowrap}
.gxs-brand .crumb{color:var(--mu);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;gap:8px;align-items:center}
.gxs-brand .crumb::before{content:"/";color:var(--bd2)}
.sp{flex:1}
.btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:1px solid var(--bd);border-radius:8px;background:var(--s1);color:var(--tx);font-size:12.5px;font-weight:500;transition:background .12s,border-color .12s,opacity .12s,transform .08s}
.btn:hover:not(:disabled){background:var(--s2);border-color:var(--bd2)}
.btn:active:not(:disabled){transform:translateY(.5px)}
.btn:disabled{opacity:.35;cursor:default}
.btn.ghost{border-color:transparent;background:transparent;color:var(--tx2)}
.btn.ghost:hover:not(:disabled){background:var(--s2);color:var(--tx)}
.btn.icon{width:30px;padding:0;justify-content:center}
.btn.primary{background:var(--tx);color:var(--inv);border-color:var(--tx);font-weight:600;padding:0 14px}
.btn.primary:hover:not(:disabled){background:var(--tx);opacity:.88}
.btn.primary.busy{opacity:.6;pointer-events:none}
.btn kbd,.kbd{font:500 10.5px var(--mono);color:var(--mu);border:1px solid var(--bd);border-bottom-width:2px;border-radius:5px;padding:0 5px;line-height:16px;background:var(--s2)}
.pill{display:inline-flex;align-items:center;gap:7px;height:26px;padding:0 10px 0 9px;border-radius:99px;border:1px solid var(--bd);font-size:11.5px;color:var(--mu);font-weight:500;white-space:nowrap}
.pill i{width:7px;height:7px;border-radius:50%;background:var(--mu)}
.pill.dirty{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 35%,var(--bd))}.pill.dirty i{background:var(--warn);box-shadow:0 0 0 3px color-mix(in srgb,var(--warn) 22%,transparent)}
.pill.ok{color:var(--tx2)}.pill.ok i{background:var(--ac)}
.vsep{width:1px;height:20px;background:var(--bd);margin:0 4px}
.seg{display:inline-flex;padding:2px;gap:2px;border:1px solid var(--bd);border-radius:9px;background:var(--s2)}
.seg button{display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;border-radius:6px;height:24px;padding:0 9px;color:var(--mu);font-size:12px;font-weight:500;transition:color .12s,background .12s}
.seg button:hover:not(.on){color:var(--tx)}
.seg button.on{background:var(--s1);color:var(--tx);box-shadow:0 0 0 1px var(--bd),0 1px 2px rgba(0,0,0,.08)}
.dark .gxs:not([data-theme=light]) .seg button.on,.gxs[data-theme=dark] .seg button.on{background:var(--s3);box-shadow:0 0 0 1px var(--bd2)}

/* ── layout ── */
.gxs-body{flex:1;display:grid;grid-template-columns:212px 384px 1fr;min-height:0}
nav{background:var(--s1);border-right:1px solid var(--bd);padding:10px 8px;display:flex;flex-direction:column;gap:1px;overflow:auto}
nav .nav-label{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mu);padding:12px 10px 7px}
nav button{position:relative;display:flex;gap:10px;align-items:center;border:0;background:none;padding:0 10px;height:34px;border-radius:8px;text-align:left;color:var(--tx2);font-size:13px;font-weight:450;transition:background .12s,color .12s}
nav button:hover{background:var(--s2);color:var(--tx)}
nav button.on{background:var(--s2);color:var(--tx);font-weight:600}
nav button.on::before{content:"";position:absolute;left:-8px;top:8px;bottom:8px;width:3px;border-radius:0 3px 3px 0;background:var(--ac)}
nav button .n{margin-left:auto;font:500 10.5px var(--mono);color:var(--ac-tx);background:var(--ac-soft);border-radius:99px;padding:1px 7px}
nav .nav-foot{margin-top:auto;padding:12px 10px 4px;font-size:11px;color:var(--mu);line-height:1.5}
nav .nav-foot b{color:var(--tx2);font-weight:600}

.gxs-panel{background:var(--s1);border-right:1px solid var(--bd);overflow:auto;display:flex;flex-direction:column;min-width:0}
.panel-head{padding:18px 20px 12px;position:sticky;top:0;background:var(--s1);z-index:2;border-bottom:1px solid transparent}
.panel-head.stuck{border-bottom-color:var(--bd)}
.panel-head h2{margin:0;font-size:17px;font-weight:600;letter-spacing:-.025em;display:flex;align-items:center;gap:9px}
.panel-head h2 .hi{width:26px;height:26px;border-radius:7px;background:var(--s2);border:1px solid var(--bd);display:grid;place-items:center;color:var(--tx2)}
.blurb{color:var(--mu);margin:6px 0 0;font-size:12.5px;line-height:1.5}
.search{position:relative;margin-top:12px}
.search svg{position:absolute;left:11px;top:9px;color:var(--mu)}
.search input{width:100%;height:32px;padding:0 34px 0 34px;border:1px solid var(--bd);border-radius:8px;background:var(--s2);font-size:12.5px;outline:none;transition:border-color .12s,background .12s}
.search input:focus{border-color:var(--tx);background:var(--s1)}
.search .kbd{position:absolute;right:7px;top:7px}
.panel-body{padding:8px 20px 36px}
.group-title{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mu);margin:20px 0 12px;display:flex;align-items:center;gap:10px}
.group-title::after{content:"";height:1px;flex:1;background:var(--bd)}
.empty{padding:40px 12px;text-align:center;color:var(--mu)}
.empty b{display:block;color:var(--tx);font-size:14px;margin-bottom:4px}

/* ── fields ── */
.field{margin-bottom:20px}
.field .lbl{display:flex;align-items:center;gap:8px;margin-bottom:8px;min-height:18px}
.field .lbl label{font-weight:550;font-size:12.5px;color:var(--tx);letter-spacing:-.01em}
.field .lbl .sec{font:500 9.5px var(--mono);color:var(--mu);border:1px solid var(--bd);border-radius:5px;padding:0 5px;text-transform:uppercase;letter-spacing:.05em}
.field .reset{margin-left:auto;display:none;align-items:center;gap:4px;border:0;background:none;color:var(--mu);font-size:11px;padding:2px 6px;border-radius:6px}
.field .reset:hover{color:var(--tx);background:var(--s2)}
.field .reset svg{width:12px;height:12px}
.field.changed .reset{display:inline-flex}
.field.changed .lbl label::after{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--ac);margin-left:7px;vertical-align:middle;box-shadow:0 0 0 3px var(--ac-soft)}
.field small{display:block;color:var(--mu);margin-top:7px;font-size:11.5px;line-height:1.5}
.field.inline{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 12px;padding:12px 14px;border:1px solid var(--bd);border-radius:10px;background:var(--s1);margin-bottom:10px}
.field.inline .lbl{margin:0}
.field.inline small{grid-column:1/-1;margin-top:2px}
.field.hide{display:none}

.gxs-panel input[type=text],.gxs-panel select,.gxs-panel textarea{width:100%;padding:0 11px;height:34px;border:1px solid var(--bd);border-radius:8px;background:var(--s2);font-size:13px;outline:none;transition:border-color .12s,background .12s}
.gxs-panel textarea{height:auto;padding:9px 11px;resize:vertical;min-height:72px;line-height:1.5}
.gxs-panel textarea.code{font:12px/1.6 var(--mono);min-height:180px;tab-size:2;white-space:pre}
.gxs-panel input[type=text]:focus,.gxs-panel select:focus,.gxs-panel textarea:focus{border-color:var(--tx);background:var(--s1);outline:none}
.gxs-panel select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238c8c8c' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:30px}

.colorrow{display:flex;gap:8px;align-items:center}
.colorrow .sw{position:relative;width:34px;height:34px;border-radius:8px;border:1px solid var(--bd2);overflow:hidden;flex:none;box-shadow:inset 0 0 0 2px var(--s1)}
.colorrow .sw input{position:absolute;inset:-6px;width:calc(100% + 12px);height:calc(100% + 12px);opacity:0;cursor:pointer}
.colorrow .sw i{position:absolute;inset:0}
.colorrow input[type=text]{flex:1;font-family:var(--mono)!important;font-size:12px!important;text-transform:uppercase}
.contrast{font:500 10.5px var(--mono);height:24px;display:inline-flex;align-items:center;gap:5px;border-radius:6px;padding:0 7px;border:1px solid var(--bd);color:var(--mu);white-space:nowrap}
.contrast b{font-weight:600}.contrast.pass{color:var(--ac-tx);border-color:color-mix(in srgb,var(--ac-tx) 30%,var(--bd))}.contrast.fail{color:var(--warn)}
.palette{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.palette button{width:20px;height:20px;border-radius:50%;border:0;box-shadow:inset 0 0 0 1px rgba(128,128,128,.35);transition:transform .12s}
.palette button:hover{transform:scale(1.18)}
.palette button.auto{width:auto;height:20px;border-radius:99px;padding:0 9px;background:var(--s2);color:var(--tx2);font:500 10.5px var(--mono);box-shadow:inset 0 0 0 1px var(--bd2)}
.palette button.auto:hover{transform:none;color:var(--tx);background:var(--s3)}
.palette button.on{box-shadow:0 0 0 2px var(--s1),0 0 0 3.5px var(--tx)}

.rangerow{display:flex;gap:12px;align-items:center}
.rangerow input[type=range]{flex:1;appearance:none;-webkit-appearance:none;height:4px;border-radius:99px;outline:none;background:linear-gradient(to right,var(--tx) var(--p,50%),var(--bd2) var(--p,50%));cursor:pointer}
.rangerow input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--s1);border:2px solid var(--tx);box-shadow:0 1px 4px rgba(0,0,0,.3);transition:transform .12s}
.rangerow input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15)}
.rangerow input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--s1);border:2px solid var(--tx)}
.rangerow output{min-width:56px;text-align:center;font:500 11.5px var(--mono);color:var(--tx);background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:3px 6px}

.seg.wide{display:flex}.seg.wide button{flex:1;justify-content:center;height:28px}

.mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mode-card{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:8px 8px 10px;border:1px solid var(--bd);border-radius:11px;background:var(--s1);text-align:left;transition:border-color .12s,background .12s}
.mode-card:hover{border-color:var(--bd2);background:var(--s2)}
.mode-card.on{border-color:var(--tx);box-shadow:0 0 0 1px var(--tx)}
.mode-card .mode-preview{width:100%;height:54px;border-radius:7px;background:var(--s3);position:relative;overflow:hidden;margin-bottom:6px;background-image:radial-gradient(var(--dots) 1px,transparent 1px);background-size:8px 8px}
.mode-card .mode-preview i{position:absolute;background:var(--tx);border-radius:4px;opacity:.28;transition:opacity .15s}
.mode-card.on .mode-preview i{background:var(--ac);opacity:1}
.mode-card strong{font-size:12.5px;font-weight:600;padding:0 3px}
.mode-card span{font-size:11px;color:var(--mu);line-height:1.3;padding:0 3px}

.icon-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.icon-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 4px 8px;border:1px solid var(--bd);border-radius:10px;background:var(--s1);font-size:10.5px;color:var(--mu);font-weight:500;transition:all .12s}
.icon-btn:hover{border-color:var(--bd2);color:var(--tx);background:var(--s2)}
.icon-btn.on{border-color:var(--tx);color:var(--tx);box-shadow:0 0 0 1px var(--tx)}
.icon-btn svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}

.switch{position:relative;width:38px;height:22px;flex:none}
.switch input{opacity:0;width:0;height:0;position:absolute}
.switch i{position:absolute;inset:0;background:var(--bd2);border-radius:99px;cursor:pointer;transition:background .18s}
.switch i::after{content:"";position:absolute;width:16px;height:16px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s cubic-bezier(.3,1.4,.5,1);box-shadow:0 1px 3px rgba(0,0,0,.3)}
.switch input:checked+i{background:var(--ac)}
.switch input:checked+i::after{transform:translateX(16px);background:var(--ac-ink)}
.switch input:focus-visible+i{outline:2px solid var(--ac);outline-offset:2px}

.chips{display:flex;flex-wrap:wrap;gap:6px;padding:7px;border:1px solid var(--bd);border-radius:9px;background:var(--s2);min-height:38px;transition:border-color .12s}
.chips:focus-within{border-color:var(--tx);background:var(--s1)}
.chip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 4px 0 9px;border-radius:99px;background:var(--s1);border:1px solid var(--bd2);font-size:12px;max-width:100%}
.chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chip button{border:0;background:none;width:16px;height:16px;border-radius:50%;display:grid;place-items:center;color:var(--mu);padding:0}
.chip button:hover{background:var(--s3);color:var(--tx)}
.chip button svg{width:10px;height:10px}
.chips input{flex:1;min-width:110px;border:0!important;background:transparent!important;height:24px!important;padding:0 4px!important;outline:none}
.counter{font:500 10.5px var(--mono);color:var(--mu);margin-left:auto}

/* ── templates ── */
.preset-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.preset{display:flex;flex-direction:column;align-items:stretch;gap:9px;padding:8px 8px 11px;border:1px solid var(--bd);border-radius:13px;background:var(--s1);text-align:left;transition:border-color .15s,transform .15s,box-shadow .15s}
.preset:hover{border-color:var(--tx);transform:translateY(-2px);box-shadow:var(--shadow)}
.preset.cur{border-color:var(--ac-tx);box-shadow:0 0 0 1px var(--ac-tx)}
.preset .thumb{height:78px;border-radius:8px;position:relative;overflow:hidden;border:1px solid var(--bd)}
.preset .thumb .tp{position:absolute;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.25)}
.preset .thumb .tp b{display:block;height:15px}
.preset .thumb .tl{position:absolute;display:grid;place-items:center;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,.3)}
.preset .thumb .tl svg{width:55%;height:55%;stroke:currentColor;fill:none;stroke-width:2}
.preset strong{font-size:12.5px;font-weight:600;padding:0 4px;display:flex;align-items:center;gap:7px}
.preset strong i{width:9px;height:9px;border-radius:50%;flex:none}
.preset .desc{font-size:11px;color:var(--mu);line-height:1.35;padding:0 4px}

.tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tool{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:12px;border:1px solid var(--bd);border-radius:11px;background:var(--s1);text-align:left;transition:border-color .12s,background .12s}
.tool:hover{border-color:var(--bd2);background:var(--s2)}
.tool svg{color:var(--tx2)}
.tool strong{font-size:12.5px;font-weight:600}
.tool span{font-size:11px;color:var(--mu);line-height:1.35;margin-top:-4px}
.tool.danger:hover{border-color:var(--bad)}.tool.danger:hover svg{color:var(--bad)}
.snippet{margin-top:12px;border:1px solid var(--bd);border-radius:10px;background:var(--s2);padding:10px 12px;font:11.5px/1.6 var(--mono);color:var(--tx2);white-space:pre-wrap;word-break:break-all;position:relative}
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:6px}
.stat{padding:11px 12px;border:1px solid var(--bd);border-radius:10px;background:var(--s1)}
.stat b{display:block;font:600 18px var(--mono);letter-spacing:-.03em}
.stat span{font-size:10.5px;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;font-weight:500}

/* ── stage ── */
.gxs-main{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--stage)}
.stage-bar{display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;flex:none;border-bottom:1px solid var(--bd);background:var(--s1)}
.addr{flex:1;max-width:460px;display:flex;align-items:center;gap:8px;height:30px;padding:0 10px;border:1px solid var(--bd);border-radius:8px;background:var(--s2);color:var(--mu)}
.addr:focus-within{border-color:var(--tx);background:var(--s1)}
.addr input{flex:1;border:0;background:transparent;outline:none;font-size:12.5px;min-width:0;color:var(--tx)}
.addr input::placeholder{color:var(--mu)}
.gxs-wrap{flex:1;padding:24px;display:flex;justify-content:center;align-items:flex-start;min-width:0;min-height:0;overflow:auto;background-image:radial-gradient(var(--dots) 1px,transparent 1px);background-size:18px 18px}
.stage{position:relative;transform:translateZ(0);overflow:hidden;background:#fff;border-radius:12px;box-shadow:var(--shadow);width:100%;height:100%;transition:width .35s cubic-bezier(.22,1,.36,1),height .35s,border-radius .35s,border-width .2s}
.stage[data-device=mobile]{width:380px;height:min(780px,100%);border-radius:40px;border:9px solid #1c1c1c;box-shadow:0 0 0 1px #3a3a3a,0 24px 70px rgba(0,0,0,.45)}
.stage[data-device=mobile]::before{content:"";position:absolute;top:8px;left:50%;transform:translateX(-50%);width:84px;height:22px;border-radius:99px;background:#1c1c1c;z-index:9}
.stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;display:none}
.fake{position:absolute;inset:0;padding:28px;overflow:hidden;background:#fff;color:#0a0a0a}
.stage[data-bg=dark] .fake{background:#050505;color:#ededed}
.fake .nav{display:flex;gap:22px;align-items:center;margin-bottom:56px;font-size:13px;opacity:.8}
.fake .nav b{margin-right:auto;font-size:16px;font-weight:700;letter-spacing:-.03em}
.fake h1{font-size:34px;margin:0 0 12px;font-weight:700;letter-spacing:-.04em;line-height:1.1;max-width:440px}
.fake p{opacity:.6;max-width:400px;font-size:14.5px;line-height:1.55;margin:0}
.fake .hero button{margin-top:18px;padding:11px 20px;border:0;border-radius:9px;background:#0a0a0a;color:#fff;font-weight:600;font-size:13.5px}
.stage[data-bg=dark] .hero button{background:#ededed;color:#0a0a0a}
.fake .cards{margin-top:52px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.fake .cards i{height:104px;border-radius:12px;background:rgba(120,120,120,.12);display:block}
.stage[data-device=mobile] .fake{padding:44px 20px 20px}.stage[data-device=mobile] .fake .nav span{display:none}.stage[data-device=mobile] .fake h1{font-size:26px}.stage[data-device=mobile] .fake .cards{grid-template-columns:1fr 1fr}

/* ── overlays ── */
.ov{position:absolute;inset:0;z-index:50;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);animation:gxs-fade .15s}
.ov.center{align-items:center;padding-top:0}
.dlg{width:min(520px,92vw);background:var(--s1);border:1px solid var(--bd2);border-radius:14px;box-shadow:0 30px 90px rgba(0,0,0,.5);overflow:hidden;animation:gxs-pop .2s cubic-bezier(.22,1,.36,1)}
.dlg header{padding:16px 18px 4px}.dlg header h3{margin:0;font-size:15px;font-weight:600;letter-spacing:-.02em}.dlg header p{margin:4px 0 0;color:var(--mu);font-size:12.5px}
.dlg .dbody{padding:12px 18px}
.dlg textarea{width:100%;min-height:200px;border:1px solid var(--bd);border-radius:9px;background:var(--s2);padding:10px 12px;font:12px/1.6 var(--mono);outline:none;resize:vertical}
.dlg textarea:focus{border-color:var(--tx)}
.dlg .err{color:var(--bad);font-size:12px;margin-top:8px;min-height:16px}
.dlg footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--bd);background:var(--s2)}
.btn.danger{background:var(--bad);border-color:var(--bad);color:#fff}
.pal{width:min(560px,92vw);background:var(--s1);border:1px solid var(--bd2);border-radius:14px;box-shadow:0 30px 90px rgba(0,0,0,.5);overflow:hidden;animation:gxs-pop .2s cubic-bezier(.22,1,.36,1)}
.pal .pin{display:flex;align-items:center;gap:10px;padding:0 16px;height:50px;border-bottom:1px solid var(--bd);color:var(--mu)}
.pal .pin input{flex:1;border:0;background:transparent;outline:none;font-size:14px;color:var(--tx)}
.pal .plist{max-height:340px;overflow:auto;padding:6px}
.pal .pgrp{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mu);padding:10px 10px 5px}
.pal .pit{display:flex;align-items:center;gap:11px;width:100%;border:0;background:none;text-align:left;height:36px;padding:0 10px;border-radius:8px;color:var(--tx2);font-size:13px}
.pal .pit.sel{background:var(--s3);color:var(--tx)}
.pal .pit small{margin-left:auto;color:var(--mu);font-size:11px}
#toast{position:fixed;bottom:22px;left:50%;transform:translate(-50%,14px);display:flex;align-items:center;gap:10px;background:var(--tx);color:var(--inv);padding:10px 16px 10px 12px;border-radius:11px;opacity:0;pointer-events:none;transition:.28s cubic-bezier(.22,1,.36,1);z-index:99;font-size:13px;font-weight:500;box-shadow:0 12px 40px rgba(0,0,0,.35)}
#toast.show{opacity:1;transform:translate(-50%,0)}
#toast i{width:18px;height:18px;border-radius:50%;background:var(--ac);color:var(--ac-ink);display:grid;place-items:center;flex:none}
#toast.bad i{background:var(--bad);color:#fff}
#toast svg{width:11px;height:11px;stroke-width:3}
@keyframes gxs-fade{from{opacity:0}}
@keyframes gxs-pop{from{opacity:0;transform:translateY(8px) scale(.98)}}
.gxs .anim{animation:gxs-fade .25s}

/* ── responsive ── */
@media (max-width:1280px){.gxs-body{grid-template-columns:60px 340px 1fr}nav button span.t,nav .nav-label,nav .nav-foot,nav button .n{display:none}nav button{justify-content:center;padding:0}nav button.on::before{left:-8px}.gxs-brand .crumb,.hide-md{display:none}}
@media (max-width:900px){
  .gxs-body{grid-template-columns:1fr;grid-template-rows:auto minmax(0,45%) 1fr}
  nav{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--bd);padding:6px}
  nav button{flex:none;width:40px}nav button.on::before{display:none}
  .gxs-panel{border-right:0;border-bottom:1px solid var(--bd)}
  .stage-bar .addr,.hide-sm{display:none}.gxs-wrap{padding:12px}
}

/* ══════════ v2: identity, tools, status bar ══════════ */
.gxs{--serif:'Instrument Serif','Iowan Old Style','Palatino Linotype',Georgia,serif}
.gxs-brand b{font-family:var(--serif);font-size:20px;font-weight:400;letter-spacing:-.01em;line-height:1}
.gxs-brand .logo{background:linear-gradient(145deg,var(--ac),color-mix(in srgb,var(--ac) 35%,#000));color:var(--ac-ink)}
.gxs-brand .logo::after{background:var(--tx)}
.panel-head h2{font-family:var(--serif);font-weight:400;font-size:27px;letter-spacing:-.025em;line-height:1.05}
.panel-head h2 .hi{width:28px;height:28px;border-radius:9px;background:var(--ac-soft);color:var(--ac-tx);border-color:color-mix(in srgb,var(--ac-tx) 28%,var(--bd))}
.blurb{font-size:12.5px}
.btn.sm{height:28px;padding:0 10px;font-size:12px}
.btn.on{background:var(--ac-soft);border-color:color-mix(in srgb,var(--ac-tx) 40%,var(--bd));color:var(--ac-tx)}
.stage-bar .btn.sm{gap:6px}
.stage-bar .btn.sm svg{color:var(--mu)}.stage-bar .btn.sm:hover svg{color:var(--tx)}

/* nav keycaps */
nav button .t{flex:1;min-width:0}
nav button::after{content:attr(data-k);margin-left:6px;font:500 10px var(--mono);color:var(--mu);opacity:0;border:1px solid var(--bd2);border-radius:5px;padding:0 5px;line-height:15px;transition:opacity .12s;flex:none}
nav button[data-k=""]::after{display:none}
nav button:hover::after,nav button.on::after{opacity:.9}
nav button.on{background:linear-gradient(90deg,var(--ac-soft),transparent 85%)}
nav button.on svg{color:var(--ac-tx)}

/* status bar */
.gxs-status{display:flex;align-items:center;gap:10px;height:26px;padding:0 14px;border-top:1px solid var(--bd);background:var(--s1);font:500 11px var(--mono);color:var(--mu);flex:none;white-space:nowrap;overflow:hidden}
.gxs-status .st-sec{color:var(--tx2);font-weight:600}
.gxs-status .st-dot{width:3px;height:3px;border-radius:50%;background:var(--bd2);flex:none}
.gxs-status .st-hint b{color:var(--tx2);font-weight:600}
.gxs-status kbd{font:600 10px var(--mono);border:1px solid var(--bd2);border-bottom-width:2px;border-radius:4px;padding:0 4px;background:var(--s2);color:var(--tx2)}

/* focus mode */
.gxs-body{transition:grid-template-columns .38s cubic-bezier(.22,1,.36,1)}
.gxs[data-focus] .gxs-body{grid-template-columns:0 0 1fr}
.gxs[data-focus] nav,.gxs[data-focus] .gxs-panel{overflow:hidden;padding:0;border-width:0;opacity:0;pointer-events:none}

/* jump-to highlight */
.field{border-radius:10px;transition:background .3s}
.field.flash{animation:gxs-flash 1.8s ease-out}
@keyframes gxs-flash{0%,55%{background:var(--ac-soft);box-shadow:0 0 0 7px var(--ac-soft)}100%{background:transparent;box-shadow:0 0 0 7px transparent}}

/* light/dark twin tags */
.field .lbl .sec.split{display:none;color:#b45309;border-color:color-mix(in srgb,#b45309 35%,var(--bd))}
.field .lbl .sec.split.dk{color:#818cf8;border-color:color-mix(in srgb,#818cf8 40%,var(--bd))}
.gxs[data-split] .field .lbl .sec.split{display:inline-block}

/* sound picker */
.sound-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sound-card{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 11px 11px;border:1px solid var(--bd);border-radius:11px;background:var(--s1);text-align:left;overflow:hidden;transition:border-color .12s,background .12s,transform .12s}
.sound-card:hover{border-color:var(--bd2);background:var(--s2)}
.sound-card:active{transform:scale(.98)}
.sound-card.on{border-color:var(--tx);box-shadow:0 0 0 1px var(--tx)}
.sound-card b{font-size:12.5px;font-weight:600}
.sound-card small{font-size:10.5px;color:var(--mu);line-height:1.3}
.sound-card .bars{display:flex;gap:3px;align-items:flex-end;height:16px;margin-bottom:7px}
.sound-card .bars i{width:3px;border-radius:2px;background:var(--bd2);height:6px;transform-origin:bottom;transition:background .15s}
.sound-card .bars i:nth-child(2){height:14px}.sound-card .bars i:nth-child(3){height:9px}.sound-card .bars i:nth-child(4){height:12px}
.sound-card.on .bars i{background:var(--ac)}
.sound-card.ping .bars i{animation:gxs-bar .65s ease-out}
.sound-card.ping .bars i:nth-child(2){animation-delay:.05s}.sound-card.ping .bars i:nth-child(3){animation-delay:.1s}.sound-card.ping .bars i:nth-child(4){animation-delay:.15s}
@keyframes gxs-bar{0%{transform:scaleY(.25)}35%{transform:scaleY(1.45)}100%{transform:scaleY(1)}}

/* message-width visualiser */
.widths{display:flex;flex-direction:column;gap:10px}
.wlane{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid var(--bd);border-radius:11px;background-color:var(--s2);background-image:radial-gradient(var(--dots) 1px,transparent 1px);background-size:8px 8px}
.wr{width:100%}.wrow{display:flex}.wrow.r{justify-content:flex-end}
.wb{display:flex;align-items:center;height:26px;border-radius:9px 9px 3px 9px;padding:0 10px;white-space:nowrap;overflow:hidden;transition:width .2s cubic-bezier(.22,1,.36,1)}
.wb em{font:500 10px var(--mono);font-style:normal;letter-spacing:.02em}
.wb.user{background:var(--ac);color:var(--ac-ink)}
.wb.ai{background:var(--s3);color:var(--tx2);border:1px solid var(--bd2);border-radius:9px 9px 9px 3px}
.wctrl{display:flex;flex-direction:column;gap:8px}
.rangerow.w .wl{width:68px;font-size:11.5px;color:var(--mu);flex:none}
.rangerow.w output{min-width:46px}
.wquick{display:flex;gap:6px;flex-wrap:wrap}
.wquick button{height:24px;padding:0 10px;border:1px solid var(--bd);border-radius:99px;background:var(--s1);font:500 11px var(--mono);color:var(--tx2);transition:all .12s}
.wquick button:hover{border-color:var(--bd2);color:var(--tx)}
.wquick button.on{border-color:var(--tx);color:var(--tx);box-shadow:0 0 0 1px var(--tx)}

/* context menu */
.cmenu{position:fixed;z-index:200;min-width:236px;max-width:310px;padding:5px;border-radius:13px;background:color-mix(in srgb,var(--s1) 90%,transparent);backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);border:1px solid var(--bd2);box-shadow:0 22px 60px rgba(0,0,0,.38),0 2px 8px rgba(0,0,0,.18);animation:gxs-menu .15s cubic-bezier(.2,.9,.3,1.15);outline:none;font-size:12.5px;color:var(--tx)}
.cmenu.sub{min-width:190px}
.cm-title{display:flex;align-items:center;gap:9px;padding:8px 9px 9px;margin-bottom:4px;border-bottom:1px solid var(--bd);font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
.cm-title i{width:7px;height:7px;border-radius:50%;background:var(--ac);flex:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 20%,transparent)}
.cm-head{padding:7px 9px 3px;font:600 9.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
.cm-i{display:flex;align-items:center;gap:9px;width:100%;height:30px;padding:0 8px;border:0;border-radius:8px;background:none;text-align:left;color:var(--tx2);position:relative;transition:background .08s,color .08s}
.cm-i:hover:not(:disabled),.cm-i:focus-visible,.cm-i.open{background:var(--ac);color:var(--ac-ink);outline:none}
.cm-i:disabled{opacity:.35;cursor:default}
.cm-i.danger{color:var(--bad)}
.cm-i.danger:hover:not(:disabled),.cm-i.danger:focus-visible{background:var(--bad);color:#fff}
.cm-ic{width:15px;display:grid;place-items:center;flex:none}
.cm-ic svg{width:14px;height:14px}
.cm-i.checked .cm-ic{color:var(--ac-tx)}
.cm-i.checked:hover .cm-ic,.cm-i.checked:focus-visible .cm-ic{color:inherit}
.cm-l{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-i kbd{font:500 10.5px var(--mono);opacity:.55;background:none;border:0;padding:0;color:inherit}
.cm-ch svg{width:12px;height:12px;opacity:.55}
.cm-sep{height:1px;background:var(--bd);margin:5px 4px}
@keyframes gxs-menu{from{opacity:0;transform:scale(.92) translateY(-4px)}}

/* shortcuts sheet */
.dlg.wide{width:min(780px,94vw)}
.kgrid{display:grid;grid-template-columns:1fr 1fr;gap:20px 34px;max-height:58vh;overflow:auto;padding:2px}
.kgrp h4{margin:0 0 6px;font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
.krow{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:7px 0;border-bottom:1px dashed var(--bd);font-size:12.5px;color:var(--tx2)}
.kcap{display:flex;gap:4px;flex:none}
.kcap kbd{font:500 11px var(--mono);min-width:22px;text-align:center;padding:2px 6px;border:1px solid var(--bd2);border-bottom-width:2px;border-radius:6px;background:var(--s2);color:var(--tx)}
.dlg footer .fnote{margin-right:auto;color:var(--mu);font-size:12px;display:flex;align-items:center;gap:6px}
.dlg footer .fnote kbd{font:500 10.5px var(--mono);border:1px solid var(--bd2);border-radius:5px;padding:0 5px;background:var(--s1)}
@media (max-width:1280px){nav button::after{display:none}.gxs-status .hide-md{display:none}}
@media (max-width:700px){.kgrid{grid-template-columns:1fr}}

/* v2 fixes */
.gxs-panel .search input[type=text]{padding:0 34px}
nav button .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stage-bar{overflow:hidden;gap:8px}
.stage-bar .btn,.stage-bar .seg button,.stage-bar .seg{white-space:nowrap;flex:none}
.stage-bar .addr{flex:0 1 210px;min-width:84px}
@media (max-width:1560px){.stage-bar .btn.sm .hide-md{display:none}.stage-bar .btn.sm{padding:0 8px}}

.gxs .cmenu:focus,.gxs .cmenu:focus-visible{outline:none}
`;
