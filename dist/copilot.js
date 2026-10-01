var GnCopilot=function(C){"use strict";const B={version:1,theme:{mode:"dark",primaryColor:"#06b6d4",accentColor:"#22d3ee",radius:18,font:'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',density:"comfortable",glass:!1,shadow:"medium"},launcher:{show:!0,position:"bottom-right",shape:"rounded",size:58,icon:"chat",customIconUrl:"",label:"",offsetX:20,offsetY:20,pulse:!1,bg:"",color:"",gradient:!0,glow:!0,iconSize:26,padding:18,labelPosition:"after",labelMode:"always",labelSize:13,closeIconWhenOpen:!0,hideWhenOpen:"auto"},presentation:{mode:"panel",mobileMode:"auto",drawerSide:"right",backdrop:!1,backdropBlur:!1,closeOnOutside:!1,closeOnEscape:!0,animation:"spring"},panel:{width:400,height:620,showBranding:!0,headerStyle:"gradient",showHeader:!0,bgType:"solid",bg:"",bg2:"",gradientAngle:160,bgImageUrl:"",bgImageDim:80,textColor:"",borderColor:"",borderWidth:1,headerBg:"",headerText:"",composerBg:"",inputBg:""},persona:{name:"AI Assistant",subtitle:"Typically replies instantly",avatarUrl:"",greeting:"Hi! How can I help you today?",typingIndicator:!0},behavior:{placeholder:"Ask anything…",suggestedQuestions:[],autoOpenAfterSeconds:0,soundOnReply:!1,persistChat:!1},messages:{bubbleStyle:"soft",showTimestamps:!1,userAlign:"right",userBg:"",userText:"",aiBg:"",aiText:"",aiBorder:!1,fontSize:13.5,maxWidth:85,showAvatar:!1},customCss:""},g=(s,e,t)=>e.includes(s)?s:t,u=(s,e,t,r)=>{const a=typeof s=="string"?parseFloat(s):s;return Number.isFinite(a)?Math.min(r,Math.max(t,a)):e},A=(s,e,t=500)=>typeof s=="string"&&s.trim()?s.slice(0,t):e,I=(s,e)=>typeof s=="string"&&/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)?s:e,b=s=>typeof s=="string"&&/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim())?s.trim():"",j=s=>typeof s=="string"&&/^https?:\/\//i.test(s.trim())?s.trim().slice(0,500):"",m=(s,e)=>typeof s=="boolean"?s:e;function z(s={}){const e=B,t=s.theme??{},r=s.launcher??{},a=s.panel??{},o=s.persona??{},n=s.behavior??{},i=s.presentation??{},l=s.messages??{};return{version:1,theme:{mode:g(t.mode,["light","dark","system"],e.theme.mode),primaryColor:I(t.primaryColor,e.theme.primaryColor),accentColor:I(t.accentColor??t.primaryColor,e.theme.accentColor),radius:u(t.radius??t.borderRadius,e.theme.radius,0,40),font:A(t.font,e.theme.font,200),density:g(t.density,["compact","comfortable","spacious"],e.theme.density),glass:m(t.glass,e.theme.glass),shadow:g(t.shadow,["none","soft","medium","bold"],e.theme.shadow)},launcher:{show:(r.show??n.showLauncher??e.launcher.show)!==!1,position:g(r.position??t.position,["bottom-right","bottom-left","top-right","top-left"],e.launcher.position),shape:g(r.shape,["rounded","circle","pill","square"],e.launcher.shape),size:u(r.size,e.launcher.size,40,96),icon:g(r.icon??n.launcherIcon,["chat","sparkles","bot","help","message","wave","custom"],e.launcher.icon),customIconUrl:typeof r.customIconUrl=="string"?r.customIconUrl.slice(0,500):"",label:A(r.label,e.launcher.label,24),offsetX:u(r.offsetX,e.launcher.offsetX,0,80),offsetY:u(r.offsetY,e.launcher.offsetY,0,80),pulse:m(r.pulse,e.launcher.pulse),bg:b(r.bg),color:b(r.color),gradient:m(r.gradient,e.launcher.gradient),glow:m(r.glow,e.launcher.glow),iconSize:u(r.iconSize,e.launcher.iconSize,12,56),padding:u(r.padding,e.launcher.padding,0,40),labelPosition:g(r.labelPosition,["after","before"],e.launcher.labelPosition),labelMode:g(r.labelMode,["always","hover"],e.launcher.labelMode),labelSize:u(r.labelSize,e.launcher.labelSize,10,20),closeIconWhenOpen:m(r.closeIconWhenOpen,e.launcher.closeIconWhenOpen),hideWhenOpen:g(r.hideWhenOpen,["auto","always","never"],e.launcher.hideWhenOpen)},presentation:{mode:g(i.mode,["panel","drawer","sheet","dialog","popover","fullscreen"],e.presentation.mode),mobileMode:g(i.mobileMode,["auto","sheet","fullscreen","drawer","panel"],e.presentation.mobileMode),drawerSide:g(i.drawerSide,["right","left","bottom"],e.presentation.drawerSide),backdrop:m(i.backdrop,e.presentation.backdrop),backdropBlur:m(i.backdropBlur,e.presentation.backdropBlur),closeOnOutside:m(i.closeOnOutside,e.presentation.closeOnOutside),closeOnEscape:m(i.closeOnEscape,e.presentation.closeOnEscape),animation:g(i.animation,["fade","slide","scale","spring"],e.presentation.animation)},panel:{width:u(a.width,e.panel.width,280,720),height:u(a.height,e.panel.height,320,900),showBranding:a.showBranding!==!1,headerStyle:g(a.headerStyle,["gradient","solid","minimal","glass"],e.panel.headerStyle),showHeader:a.showHeader!==!1,bgType:g(a.bgType,["solid","gradient","image"],e.panel.bgType),bg:b(a.bg),bg2:b(a.bg2),gradientAngle:u(a.gradientAngle,e.panel.gradientAngle,0,360),bgImageUrl:j(a.bgImageUrl),bgImageDim:u(a.bgImageDim,e.panel.bgImageDim,0,100),textColor:b(a.textColor),borderColor:b(a.borderColor),borderWidth:u(a.borderWidth,e.panel.borderWidth,0,4),headerBg:b(a.headerBg),headerText:b(a.headerText),composerBg:b(a.composerBg),inputBg:b(a.inputBg)},persona:{name:A(o.name,e.persona.name,80),subtitle:A(o.subtitle,e.persona.subtitle,120),avatarUrl:typeof o.avatarUrl=="string"?o.avatarUrl:"",greeting:A(o.greeting,e.persona.greeting,500),typingIndicator:o.typingIndicator!==!1},behavior:{placeholder:A(n.placeholder,e.behavior.placeholder,120),suggestedQuestions:Array.isArray(n.suggestedQuestions)?n.suggestedQuestions.filter(h=>typeof h=="string"&&h.trim()).slice(0,8):[],autoOpenAfterSeconds:u(n.autoOpenAfterSeconds,0,0,120),soundOnReply:m(n.soundOnReply,e.behavior.soundOnReply),persistChat:m(n.persistChat,e.behavior.persistChat)},messages:{bubbleStyle:g(l.bubbleStyle,["rounded","soft","sharp","bubble"],e.messages.bubbleStyle),showTimestamps:m(l.showTimestamps,e.messages.showTimestamps),userAlign:g(l.userAlign,["right","left"],e.messages.userAlign),userBg:b(l.userBg),userText:b(l.userText),aiBg:b(l.aiBg),aiText:b(l.aiText),aiBorder:m(l.aiBorder,e.messages.aiBorder),fontSize:u(l.fontSize,e.messages.fontSize,11,18),maxWidth:u(l.maxWidth,e.messages.maxWidth,55,100),showAvatar:m(l.showAvatar,e.messages.showAvatar)},customCss:typeof s.customCss=="string"?s.customCss.slice(0,12e3):""}}function L(s={}){const e=(s==null?void 0:s.ui)??{},t=r=>({...(s==null?void 0:s[r])??{},...(e==null?void 0:e[r])??{}});return z({...s,...e,theme:t("theme"),persona:t("persona"),behavior:t("behavior"),launcher:t("launcher"),panel:t("panel"),presentation:t("presentation"),messages:t("messages")})}const N=`
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
`,O={chat:'<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13a7 7 0 0 1 7 7.5Z"/>',sparkles:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',bot:'<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.7M12 17h.01"/>',message:'<path d="M4 6h16v10H8l-4 3V6z"/>',wave:'<path d="M4 14c2-4 4-6 6-6s3 3 5 3 4-3 5-5"/><path d="M4 18c2-3 4-5 6-5s3 2 5 2 4-2 5-4"/>'},M='<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',U='<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',H='<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',W='<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',q='<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',V='<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',Y='<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',G='<svg viewBox="0 0 24 24"><path d="M7 17L17 7M7 7h10v10"/></svg>',F='<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></svg>',E=s=>/^https?:\/\//i.test(s)?s.replace(/"/g,"%22"):"";function k(s,e="#ffffff",t="#0a0a0a"){const r=s.replace("#",""),a=parseInt(r.length===3?r.split("").map(i=>i+i).join(""):r,16);if(!Number.isFinite(a))return e;const o=i=>(i/=255)<=.03928?i/12.92:((i+.055)/1.055)**2.4,n=.2126*o(a>>16&255)+.7152*o(a>>8&255)+.0722*o(a&255);return 1.05/(n+.05)*1.35>=(n+.05)/.05?e:t}const x=(s,e,t)=>t?s.style.setProperty(e,t):s.style.removeProperty(e);function K(s,e){const t=s.presentation.mobileMode;if(!e||t==="auto"){if(e){const r=s.presentation.mode;return r==="panel"||r==="popover"?"sheet":r==="dialog"?"fullscreen":r}return s.presentation.mode}return t}function X(){var o,n,i,l,h,d,v;if(typeof window>"u"||!document)return;const s=Array.from(document.querySelectorAll("h1, h2, h3")).map(c=>(c.textContent||"").trim()).filter(c=>c.length>2&&c.length<120).slice(0,8),e=((o=document.querySelector('meta[name="description"]'))==null?void 0:o.getAttribute("content"))||((n=document.querySelector('meta[property="og:description"]'))==null?void 0:n.getAttribute("content"))||"";let t=null;const r=document.querySelector('script[type="application/ld+json"]');if(r&&r.textContent)try{const c=JSON.parse(r.textContent);(c["@type"]==="Product"||c["@type"]==="Article"||c["@type"]==="Organization")&&(t={type:c["@type"],name:c.name||c.headline,description:c.description,price:((i=c.offers)==null?void 0:i.price)||((l=c.offers)==null?void 0:l.lowPrice),currency:(h=c.offers)==null?void 0:h.priceCurrency,availability:(d=c.offers)==null?void 0:d.availability})}catch{}const a=((v=window.getSelection())==null?void 0:v.toString().trim().slice(0,500))||"";return{url:window.location.href,pathname:window.location.pathname,title:document.title,metaDescription:e.slice(0,300),headings:s,structuredData:t,selectedText:a||void 0}}function J(s){if(!s)return"";const e=[];let t=s.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g,(o,n,i)=>{const l=i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),h=n?n.toUpperCase():"CODE",d=e.length;return e.push(`<div class="code-block"><div class="code-header"><span class="code-lang">${h}</span><button type="button" class="code-copy" data-idx="${d}">${q}<span>Copy</span></button></div><pre><code>${l}</code></pre></div>`),`__CODE_BLOCK_${d}__`});t=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),t=t.replace(/`([^`\n]+)`/g,'<code class="inline-code">$1</code>'),t=t.replace(/^#### (.*?)$/gm,"<h4>$1</h4>"),t=t.replace(/^### (.*?)$/gm,"<h3>$1</h3>"),t=t.replace(/^## (.*?)$/gm,"<h2>$1</h2>"),t=t.replace(/^# (.*?)$/gm,"<h1>$1</h1>"),t=t.replace(/^&gt;\s?(.*?)$/gm,"<blockquote>$1</blockquote>"),t=t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*(.*?)\*/g,"<em>$1</em>"),t=t.replace(/~~(.*?)~~/g,"<del>$1</del>"),t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer nofollow">$1</a>'),t=t.replace(/((?:\|[^\n]+\|\r?\n)+)/g,o=>{const n=o.trim().split(`
`).filter(l=>!/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(l));if(n.length<1)return o;let i='<div class="gora-table-wrap"><table>';return n.forEach((l,h)=>{const d=l.split("|").filter((c,y,p)=>y>0&&y<p.length-1),v=h===0?"th":"td";i+=`<tr>${d.map(c=>`<${v}>${c.trim()}</${v}>`).join("")}</tr>`}),i+="</table></div>",i}),t=t.replace(/(?:^[ \t]*[-*]\s+[^\n]+(?:\n|$))+/gm,o=>`<ul>${o.trim().split(`
`).map(i=>i.replace(/^[ \t]*[-*]\s+/,"")).map(i=>`<li>${i}</li>`).join("")}</ul>`);let a=t.split(/\n\s*\n/).map(o=>{const n=o.trim();return n?n.startsWith("<h")||n.startsWith("<ul>")||n.startsWith("<ol>")||n.startsWith("<blockquote>")||n.startsWith("<div")||n.startsWith("__CODE_BLOCK_")?n:`<p>${n.replace(/\n/g,"<br>")}</p>`:""}).filter(Boolean).join("");return a=a.replace(/__CODE_BLOCK_(\d+)__/g,(o,n)=>e[+n]||""),a}const Q='button:not([hidden]):not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';class P extends HTMLElement{constructor(){super(...arguments),this.cfg=z({}),this.projectId="",this.apiUrl="",this.msgs=[],this.busy=!1,this.built=!1,this.compact=!1,this.openedOnce=!1,this.mode="panel",this.raf=0}async connectedCallback(){if(this.projectId=this.getAttribute("data-project-id")||"",this.apiUrl=(this.getAttribute("data-api-url")||location.origin).replace(/\/$/,""),!this.projectId||this.built)return;const e=await this.fetchConfigResilient();!e||e.enabled===!1||this.setConfig(L(e))}async fetchConfigResilient(){const e=`${this.apiUrl}/copilot/${this.projectId}/config`;for(let t=0;t<2;t++)try{const r=new AbortController,a=setTimeout(()=>r.abort(),8e3),o=await fetch(e,{signal:r.signal});if(clearTimeout(a),!o.ok)throw new Error(String(o.status));const n=await o.json();try{localStorage.setItem(this.cacheKey(),JSON.stringify(n))}catch{}return n}catch{if(t===0){await new Promise(a=>setTimeout(a,1500));continue}}try{const t=localStorage.getItem(this.cacheKey());if(t)return JSON.parse(t)}catch{}return null}cacheKey(){return`gx:cfg:${this.projectId}`}disconnectedCallback(){this.onKey&&removeEventListener("keydown",this.onKey),this.onResize&&removeEventListener("resize",this.onResize),this.onDoc&&document.removeEventListener("pointerdown",this.onDoc,!0),clearTimeout(this.autoTimer),cancelAnimationFrame(this.raf)}setConfig(e){this.cfg=z(e),this.built||this.build(),this.apply()}build(){const e=this.attachShadow({mode:"open"});e.innerHTML=`<style>${N}</style><style id="custom"></style>
      <div class="gx">
        <div class="backdrop" id="backdrop"></div>
        <section class="panel" role="dialog" aria-label="Chat" id="panel">
          <div class="busybar" id="busybar" aria-hidden="true"></div>
          <button class="x fx" id="fx" aria-label="Close" hidden>${M}</button>
          <header id="hdr">
            <div id="av"></div>
            <div class="title"><div class="name" id="name"></div><div class="sub" id="sub"></div></div>
            <button class="x" id="close" aria-label="Close">${M}</button>
          </header>
          <div class="msgs" id="msgs" aria-live="polite"></div>
          <div class="chips" id="chips"></div>
          <div class="composer">
            <textarea id="inp" rows="1" aria-label="Message"></textarea>
            <button class="send" id="send" aria-label="Send message">${U}</button>
          </div>
          <div class="brand" id="brand">POWERED BY GN•APEX</div>
        </section>
        <button class="launcher" id="launch" aria-label="Open chat" aria-expanded="false">
          <span class="ico"><span class="i-main" id="imain"></span><svg class="i-close" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></span>
          <span class="lbl" id="llbl" hidden></span>
        </button>
      </div>`,this.$=r=>e.getElementById(r),this.styleEl=this.$("custom"),this.$("launch").onclick=()=>this.toggle(),this.$("close").onclick=()=>this.close(),this.$("fx").onclick=()=>this.close(),this.$("send").onclick=()=>this.send(),this.$("backdrop").onclick=()=>{this.cfg.presentation.closeOnOutside&&this.close()};const t=this.$("inp");t.style.height="40px",t.style.overflowY="hidden",t.oninput=()=>{t.style.height="40px";const r=t.scrollHeight;r>40?(t.style.height=Math.min(r,110)+"px",t.style.overflowY=r>110?"auto":"hidden"):(t.style.height="40px",t.style.overflowY="hidden")},this.$("chips").onclick=r=>{const a=r.target.closest(".chip");a&&this.send(a.textContent||"")},this.onKey=r=>{if(r.key==="Escape"&&this.cfg.presentation.closeOnEscape&&this.isOpen()){this.close();return}this.trapFocus(r)},addEventListener("keydown",this.onKey),this.onDoc=r=>{const a=this.cfg.presentation;!this.isOpen()||!a.closeOnOutside||a.backdrop||r.composedPath().includes(this)||this.close()},document.addEventListener("pointerdown",this.onDoc,!0),this.onResize=()=>{this.raf||(this.raf=requestAnimationFrame(()=>{this.raf=0,this.apply()}))},addEventListener("resize",this.onResize),this.$("msgs").addEventListener("click",async r=>{var n;const o=r.target.closest(".code-copy");if(o){const i=(n=o.closest(".code-block"))==null?void 0:n.querySelector("pre code");if(i)try{await navigator.clipboard.writeText(i.textContent||"");const l=o.querySelector("span");l&&(l.textContent="Copied!"),setTimeout(()=>{l&&(l.textContent="Copy")},1600)}catch{}}}),this.loadChat(),this.built=!0}trapFocus(e){if(e.key!=="Tab"||!this.isOpen()||!this.cfg.presentation.backdrop)return;const t=this.$("panel"),r=Array.from(t.querySelectorAll(Q)).filter(i=>!i.hasAttribute("hidden"));if(!r.length)return;const a=r[0],o=r[r.length-1],n=this.shadowRoot.activeElement;e.shiftKey&&n===a?(e.preventDefault(),o.focus()):!e.shiftKey&&(n===o||!r.includes(n))&&(e.preventDefault(),a.focus())}apply(){const e=this.cfg,t=this.shadowRoot.querySelector(".gx"),r=e.theme.mode==="system"?matchMedia("(prefers-color-scheme: dark)").matches:e.theme.mode==="dark",a=this.style;a.setProperty("--gx-primary",e.theme.primaryColor),a.setProperty("--gx-accent",e.theme.accentColor),a.setProperty("--gx-radius",e.theme.radius+"px"),a.setProperty("--gx-font",e.theme.font),a.setProperty("--gx-size",e.launcher.size+"px"),a.setProperty("--gx-ox",e.launcher.offsetX+"px"),a.setProperty("--gx-oy",e.launcher.offsetY+"px"),a.setProperty("--gx-w",e.panel.width+"px"),a.setProperty("--gx-h",e.panel.height+"px"),a.setProperty("--gx-bw",e.panel.borderWidth+"px");const o=e.launcher,n=Math.min(o.iconSize,o.size-4);a.setProperty("--gx-icon",n+"px"),a.setProperty("--gx-lpad",o.padding+"px"),a.setProperty("--gx-lsize",o.labelSize+"px");const i=!!o.label,l=o.shape==="pill"||o.shape==="circle"?"999px":o.shape==="square"?Math.round(o.size*.22)+"px":Math.round(o.size*.32)+"px";a.setProperty("--gx-launcher-radius",l);const h=o.bg||e.theme.primaryColor;a.setProperty("--gx-l-base",h),a.setProperty("--gx-l-bg",o.gradient?`linear-gradient(145deg,${h},color-mix(in srgb,${h} 68%,#000))`:h),a.setProperty("--gx-l-fg",o.color||k(h)),this.mode=K(e,this.compact||window.innerWidth<=480),t.dataset.mode=r?"dark":"light",t.dataset.pos=o.position,t.dataset.pres=this.mode,t.dataset.side=e.presentation.drawerSide,t.dataset.anim=e.presentation.animation,t.dataset.density=e.theme.density,t.dataset.shadow=e.theme.shadow,t.dataset.header=e.panel.headerStyle,t.dataset.bubble=e.messages.bubbleStyle,t.dataset.align=e.messages.userAlign,t.toggleAttribute("data-glass",e.theme.glass&&e.panel.bgType==="solid"),t.toggleAttribute("data-backdrop-blur",e.presentation.backdropBlur),t.toggleAttribute("data-no-backdrop",!e.presentation.backdrop),t.toggleAttribute("data-ai-border",e.messages.aiBorder);const d=e.panel,v=d.bg||(r?"#0a0a0a":"#ffffff"),c=d.bgType==="image"?E(d.bgImageUrl):"",y=!!d.bg||d.bgType==="gradient"||!!c;let p="";if(d.bgType==="gradient"){const S=d.bg2||`color-mix(in srgb,${e.theme.primaryColor} 28%,${v})`;p=`linear-gradient(${d.gradientAngle}deg,${v},${S})`}else if(c){const S=`color-mix(in srgb,${v} ${d.bgImageDim}%,transparent)`;p=`linear-gradient(${S},${S}),url("${c}") center/cover no-repeat`}x(t,"--bg",y?v:""),x(t,"--gx-panel-bg",p),x(t,"--text",d.textColor||(y?k(v,"#fafafa","#0a0a0a"):"")),x(t,"--border",d.borderColor),x(t,"--gx-hdr-bg",d.headerBg),t.toggleAttribute("data-hdr-custom",!!d.headerBg),x(t,"--gx-hdr-fg",d.headerText||(d.headerBg?k(d.headerBg,"#fafafa","#0a0a0a"):"")),x(t,"--gx-composer-bg",d.composerBg),x(t,"--gx-input-bg",d.inputBg),x(t,"--gx-input-fg",d.inputBg?k(d.inputBg,"#fafafa","#0a0a0a"):""),x(t,"--gx-on-primary",k(e.theme.primaryColor));const f=e.messages;a.setProperty("--gx-fs",f.fontSize+"px"),a.setProperty("--gx-mw",f.maxWidth+"%"),x(t,"--gx-user-bg",f.userBg),x(t,"--gx-user-fg",f.userText||k(f.userBg||e.theme.primaryColor)),x(t,"--gx-ai-bg",f.aiBg),x(t,"--gx-ai-fg",f.aiText||(f.aiBg?k(f.aiBg,"#fafafa","#0a0a0a"):""));const w=this.$("launch");w.hidden=!o.show,w.dataset.shape=o.shape,w.dataset.lpos=o.labelPosition,w.dataset.lmode=o.labelMode,w.toggleAttribute("data-label",i),w.toggleAttribute("data-glow",o.glow),w.toggleAttribute("data-pulse",o.pulse&&!this.openedOnce);const D=o.icon==="custom"?E(o.customIconUrl):"";this.$("imain").innerHTML=D?`<img alt="" src="${D}">`:`<svg viewBox="0 0 24 24">${O[o.icon]||O.chat}</svg>`;const R=this.$("llbl");R.hidden=!i,R.textContent=o.label,this.$("name").textContent=e.persona.name,this.$("sub").textContent=e.persona.subtitle,this.$("av").innerHTML=e.persona.avatarUrl?`<img class="avatar" alt="" src="${E(e.persona.avatarUrl)}">`:'<div class="avatar"></div>',this.$("inp").placeholder=e.behavior.placeholder,this.$("brand").hidden=!e.panel.showBranding,this.$("hdr").hidden=!e.panel.showHeader,this.$("fx").hidden=e.panel.showHeader,this.$("panel").setAttribute("aria-label",e.persona.name?`Chat with ${e.persona.name}`:"Chat"),e.behavior.persistChat||this.clearChat(),this.msgs.some(S=>S.role==="user")||(this.msgs=[{role:"assistant",content:e.persona.greeting,t:Date.now()}]),this.renderMsgs(this.busy),this.renderChips(),this.styleEl.textContent=e.customCss.replace(/@import[^;]*;?/gi,"").replace(/url\s*\(/gi,"(").replace(/expression\s*\(/gi,"("),this.syncOpen()}setCompact(e){var t,r;this.compact=e,(r=(t=this.shadowRoot)==null?void 0:t.querySelector(".gx"))==null||r.toggleAttribute("data-compact",e),this.apply()}get opened(){return this.isOpen()}isOpen(){var e;return((e=this.shadowRoot.querySelector(".panel"))==null?void 0:e.hasAttribute("data-open"))??!1}syncOpen(){const e=this.isOpen(),t=this.cfg,r=this.$("launch");r.toggleAttribute("data-open",e&&t.launcher.closeIconWhenOpen);const a=["sheet","fullscreen","drawer"].includes(this.mode),o=e&&(t.launcher.hideWhenOpen==="always"||t.launcher.hideWhenOpen==="auto"&&a);r.toggleAttribute("data-hide",o),r.setAttribute("aria-expanded",String(e)),this.dispatchEvent(new CustomEvent("gx-toggle",{detail:e})),r.setAttribute("aria-label",e?"Close chat":"Open chat"),this.$("panel").setAttribute("aria-modal",String(t.presentation.backdrop))}open(){this.$("panel").toggleAttribute("data-open",!0),this.$("backdrop").toggleAttribute("data-open",!0),this.openedOnce=!0,this.$("launch").removeAttribute("data-pulse"),this.syncOpen(),this.$("inp").focus({preventScroll:!0})}close(){this.$("panel").toggleAttribute("data-open",!1),this.$("backdrop").toggleAttribute("data-open",!1),this.syncOpen()}toggle(){this.isOpen()?this.close():this.open()}key(){return`gx:chat:${this.projectId}`}canPersist(){return!!this.projectId&&!this.transport}loadChat(){if(!(!this.cfg.behavior.persistChat||!this.canPersist()))try{const e=JSON.parse(localStorage.getItem(this.key())||"[]");Array.isArray(e)&&e.length&&(this.msgs=e.slice(-40))}catch{}}saveChat(){if(!(!this.cfg.behavior.persistChat||!this.canPersist()))try{localStorage.setItem(this.key(),JSON.stringify(this.msgs.slice(-40)))}catch{}}clearChat(){if(this.projectId)try{localStorage.removeItem(this.key())}catch{}}beep(){try{const e=window.AudioContext||window.webkitAudioContext;this.audio=this.audio||new e,this.audio.state==="suspended"&&this.audio.resume().catch(()=>{});const t=this.audio.currentTime;[660,880].forEach((r,a)=>{const o=this.audio.createOscillator(),n=this.audio.createGain();o.type="sine",o.frequency.value=r,n.gain.setValueAtTime(1e-4,t+a*.09),n.gain.exponentialRampToValueAtTime(.05,t+a*.09+.02),n.gain.exponentialRampToValueAtTime(1e-4,t+a*.09+.16),o.connect(n).connect(this.audio.destination),o.start(t+a*.09),o.stop(t+a*.09+.18)})}catch{}}executeClientAction(e){try{if(e.type==="SCROLL_TO"){const t=document.querySelector(e.payload);t&&(t.scrollIntoView({behavior:"smooth",block:"center"}),t.style.outline="3px solid var(--gx-primary, #06b6d4)",t.style.outlineOffset="4px",t.style.transition="outline 0.3s ease",setTimeout(()=>{t.style.outline="none"},2400))}else e.type==="NAVIGATE"&&(window.location.href=e.payload)}catch(t){console.debug("[Copilot Action Error]",t)}}createReasoningEl(e){const t=document.createElement("div");t.className="reasoning-block"+(e.isActive?" open":"");const r=document.createElement("button");r.type="button",r.className="reasoning-btn";const a=e.endedAt?((e.endedAt-e.startedAt)/1e3).toFixed(1)+"s":"";r.innerHTML=`<span class="spark">${H}</span><span class="title">${e.label}${e.reason?` — ${e.reason}`:""}</span><span class="time">${a}</span><span class="chevron">${W}</span>`,r.onclick=()=>t.classList.toggle("open");const o=document.createElement("div");return o.className="reasoning-body",o.textContent=e.text||(e.isActive?"Thinking through inquiry...":""),t.append(r,o),t}createToolEl(e){const t=document.createElement("div");t.className="tool-block";const r=e.endedAt?((e.endedAt-e.startedAt)/1e3).toFixed(1)+"s":"",o=e.status==="running"?Y:e.status==="done"?V:M;return t.innerHTML=`<span class="tool-icon">${O.bot}</span><span class="tool-label">${e.label}</span><span class="tool-timer">${r}</span><span class="tool-status-icon ${e.status}">${o}</span>`,t}createConfirmCard(e){const t=document.createElement("div");t.className="confirm-card",t.innerHTML=`<div class="confirm-title">${F}<span>Authorization Required</span></div><div class="confirm-desc">This action has financial or system impact and requires your explicit approval.</div><div class="confirm-btns"><button type="button" class="btn-approve">Approve & Execute</button><button type="button" class="btn-decline">Cancel</button></div>`;const r=t.querySelector(".btn-approve"),a=t.querySelector(".btn-decline");return e.status!=="pending"?(r.disabled=!0,a.disabled=!0,r.textContent=e.status==="confirmed"?"Approved":"Cancelled",e.status==="declined"&&(r.style.display="none")):(r.onclick=()=>{e.status="confirmed",this.send("Yes, please proceed with that action.")},a.onclick=()=>{e.status="declined",this.send("No, cancel that action.")}),t}createActionsEl(e){const t=document.createElement("div");t.className="suggested-actions";for(const r of e){const a=document.createElement("button");a.type="button",a.className="action-chip";const o=r.action_type==="NAVIGATE"?G:O.chat;a.innerHTML=`${o}<span>${r.label}</span>`,a.onclick=()=>{r.action_type==="NAVIGATE"?window.location.href=r.payload:this.send(r.payload)},t.appendChild(a)}return t}row(e){const t=this.cfg,r=document.createElement("div");if(r.className="row "+e.role,e.role==="assistant"&&t.messages.showAvatar){const o=t.persona.avatarUrl?document.createElement("img"):document.createElement("div");o.className="mav",o instanceof HTMLImageElement&&(o.alt="",o.src=E(t.persona.avatarUrl)),r.appendChild(o)}const a=document.createElement("div");if(a.className="col",e.reasoning&&(e.reasoning.text||e.reasoning.isActive)&&a.appendChild(this.createReasoningEl(e.reasoning)),e.tools&&e.tools.length>0)for(const o of e.tools)a.appendChild(this.createToolEl(o));if(e.confirmation&&a.appendChild(this.createConfirmCard(e.confirmation)),e.content){const o=document.createElement("div");if(o.className="m "+e.role,e.role==="assistant"?o.innerHTML=J(e.content):o.textContent=e.content,e.error){const n=document.createElement("button");n.type="button",n.className="retry",n.textContent="Try again",n.onclick=()=>this.retryLast(),o.appendChild(document.createElement("br")),o.appendChild(n)}a.appendChild(o)}if(e.actions&&e.actions.length>0&&a.appendChild(this.createActionsEl(e.actions)),t.messages.showTimestamps&&e.t){const o=document.createElement("div");o.className="ts",o.textContent=new Date(e.t).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),a.appendChild(o)}return r.appendChild(a),r}renderMsgs(e=!1){const t=this.$("msgs");t.textContent="";for(const r of this.msgs)t.appendChild(this.row(r));if(e&&this.cfg.persona.typingIndicator){const r=document.createElement("div");r.className="m assistant",r.innerHTML='<span class="dots"><i></i><i></i><i></i></span>';const a=document.createElement("div");a.className="row assistant";const o=document.createElement("div");o.className="col",o.appendChild(r),a.appendChild(o),t.appendChild(a)}t.scrollTop=t.scrollHeight}renderChips(){const e=this.msgs.length<=1;this.$("chips").innerHTML=e?this.cfg.behavior.suggestedQuestions.map(t=>`<button type="button" class="chip">${t.replace(/[&<>"]/g,r=>`&#${r.charCodeAt(0)};`)}</button>`).join(""):""}setBusyUI(e){const t=this.$("send"),r=this.$("inp");t.toggleAttribute("disabled",e),r.toggleAttribute("disabled",e),this.shadowRoot.querySelector(".gx").toggleAttribute("data-busy",e),e||r.focus({preventScroll:!0})}retryLast(){if(this.busy)return;const e=[...this.msgs].reverse().find(t=>t.role==="user");e&&this.send(e.content,!0)}async send(e,t=!1){var n;const r=this.$("inp"),a=(e??r.value).trim();if(this.busy||!a&&!t)return;t?(n=this.msgs[this.msgs.length-1])!=null&&n.error&&this.msgs.pop():(r.value="",r.style.height="40px",r.style.overflowY="hidden",this.msgs.push({role:"user",content:a,t:Date.now()})),this.busy=!0,this.setBusyUI(!0),this.renderChips(),this.renderMsgs(!0);const o=this.msgs.filter((i,l)=>!(l===0&&i.role==="assistant")).map(({role:i,content:l})=>({role:i,content:l}));try{if(this.transport){const i=await this.transport(o);this.msgs.push({role:"assistant",content:i,t:Date.now()})}else await this.streamReply(o);this.cfg.behavior.soundOnReply&&this.beep()}catch{this.msgs.push({role:"assistant",content:"Sorry, something went wrong. Please try again.",t:Date.now(),error:!0})}this.busy=!1,this.setBusyUI(!1),this.renderMsgs(),this.saveChat()}async streamReply(e){const t=X(),r=await fetch(`${this.apiUrl}/copilot/${this.projectId}/stream`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:e,pageContext:t})});if(!r.ok||!r.body)throw new Error(`Stream failed (${r.status})`);const a={role:"assistant",content:"",t:Date.now(),tools:[],actions:[]};this.msgs.push(a);const o=r.body.getReader(),n=new TextDecoder;let i="";for(;;){const{done:l,value:h}=await o.read();if(l)break;i+=n.decode(h,{stream:!0});const d=i.split(`
`);i=d.pop()||"";for(const v of d){const c=v.trim();if(!c.startsWith("data:"))continue;const y=c.replace(/^data:\s*/,"");if(y==="[DONE]")break;try{const p=JSON.parse(y);switch(p.type){case"mode":this.pendingReason=p.reason;break;case"phase":p.phase==="reasoning_start"?a.reasoning={label:p.label||"Reasoning through inquiry...",reason:this.pendingReason,text:"",isActive:!0,startedAt:Date.now()}:p.phase==="reasoning_end"&&a.reasoning&&(a.reasoning.isActive=!1,a.reasoning.endedAt=Date.now());break;case"thought":a.reasoning||(a.reasoning={label:"Reasoning through inquiry...",text:"",isActive:!0,startedAt:Date.now()}),a.reasoning.text+=p.delta;break;case"token":a.reasoning&&a.reasoning.isActive&&(a.reasoning.isActive=!1,a.reasoning.endedAt=Date.now()),a.content+=p.delta;break;case"tool_start":a.tools=a.tools||[],a.tools.push({tool:p.tool,label:p.label||"Operating platform...",args:p.args||{},status:"running",startedAt:Date.now()});break;case"tool_end":if(a.tools){const f=[...a.tools].reverse().find(w=>w.tool===p.tool);f&&(f.status="done",f.result=p.result,f.endedAt=Date.now())}break;case"suggested_actions":a.actions=Array.isArray(p.payload)?p.payload:[];break;case"action_confirmation_required":a.confirmation={payload:p.payload||{},status:"pending"};break;case"error":a.content+=`

⚠️ ${p.message}`;break}this.renderMsgs(!1)}catch{y&&(a.content+=y,this.renderMsgs(!1))}}}}}const T="gnapex-copilot-root";typeof window<"u"&&!customElements.get(T)&&customElements.define(T,P);const $=typeof document>"u"?null:document.currentScript??document.getElementById("gnapex-copilot-script");function _(){var e;if(!((e=$==null?void 0:$.dataset)!=null&&e.projectId)||document.querySelector(T))return;const s=document.createElement(T);s.setAttribute("data-project-id",$.dataset.projectId),$.dataset.apiUrl&&s.setAttribute("data-api-url",$.dataset.apiUrl),(document.body??document.documentElement).appendChild(s)}return typeof document<"u"&&(document.readyState!=="loading"?_():document.addEventListener("DOMContentLoaded",_)),C.DEFAULTS=B,C.GxCopilot=P,C.fromServer=L,C.resolve=z,Object.defineProperty(C,Symbol.toStringTag,{value:"Module"}),C}({});
