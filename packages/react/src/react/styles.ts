import { useInsertionEffect } from "react";

const STYLE_ID = "chaiauth-react-styles";

const CSS = `
.chaiauth-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:2.5rem;padding:0 1.1rem;border:0;border-radius:.65rem;
  font:600 .9rem/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;cursor:pointer;
  background:linear-gradient(105deg,#fb923c,#f97316 45%,#ea580c);box-shadow:inset 0 1px 0 rgb(255 255 255/.28),0 8px 22px -10px rgb(234 88 12/.75);
  transition:transform .12s ease,box-shadow .2s ease,opacity .2s}
.chaiauth-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:inset 0 1px 0 rgb(255 255 255/.32),0 12px 28px -10px rgb(234 88 12/.85)}
.chaiauth-btn:active:not(:disabled){transform:translateY(1px) scale(.985)}
.chaiauth-btn:disabled{opacity:.6;cursor:not-allowed}
.chaiauth-btn:focus-visible,.chaiauth-avatar:focus-visible,.chaiauth-item:focus-visible{outline:2px solid #f97316;outline-offset:2px}

.chaiauth-user{position:relative;display:inline-block;font:400 .875rem/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:#18181b}
.chaiauth-avatar{display:grid;place-items:center;width:2.25rem;height:2.25rem;padding:0;border:2px solid rgb(249 115 22/.55);border-radius:9999px;cursor:pointer;
  background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;font:700 .8rem/1 system-ui,sans-serif;transition:box-shadow .2s,transform .12s}
.chaiauth-avatar:hover{box-shadow:0 0 0 4px rgb(249 115 22/.18)}
.chaiauth-menu{position:absolute;right:0;top:calc(100% + .5rem);z-index:50;min-width:14.5rem;padding:.4rem;border:1px solid #e4e4e7;border-radius:.9rem;
  background:#fff;color:#18181b;box-shadow:0 18px 50px -12px rgb(0 0 0/.35);animation:chaiauth-pop .14s ease-out}
.chaiauth-head{padding:.6rem .7rem .7rem;border-bottom:1px solid #e4e4e7;margin-bottom:.35rem}
.chaiauth-name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chaiauth-email{color:#71717a;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chaiauth-item{display:block;width:100%;box-sizing:border-box;padding:.55rem .7rem;border:0;border-radius:.55rem;background:none;color:inherit;text-align:left;
  font:inherit;text-decoration:none;cursor:pointer}
.chaiauth-item:hover{background:#f4f4f5}
@keyframes chaiauth-pop{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}

.chaiauth-form{--_primary:var(--chaiauth-primary,#f97316);--_muted:var(--chaiauth-muted,color-mix(in srgb,currentColor 60%,transparent));
  --_border:var(--chaiauth-border,color-mix(in srgb,currentColor 22%,transparent));--_radius:var(--chaiauth-radius,.6rem);--_danger:var(--chaiauth-danger,#dc2626);
  display:flex;flex-direction:column;gap:1rem;width:100%;box-sizing:border-box;color:var(--chaiauth-fg,inherit);font:400 .9rem/1.45 var(--chaiauth-font,inherit)}
.chaiauth-form *{box-sizing:border-box}
.chaiauth-form-title{margin:0;font-size:1.4rem;font-weight:650;letter-spacing:-.01em}
.chaiauth-form-subtitle{margin:.25rem 0 0;color:var(--_muted)}
.chaiauth-form form{display:flex;flex-direction:column;gap:.9rem}
.chaiauth-field{display:flex;flex-direction:column;gap:.35rem}
.chaiauth-label-row{display:flex;justify-content:space-between;align-items:baseline}
.chaiauth-label{font-weight:550;font-size:.84rem}
.chaiauth-input{width:100%;height:2.6rem;padding:0 .8rem;border:1px solid var(--_border);border-radius:var(--_radius);background:var(--chaiauth-input-bg,transparent);
  color:inherit;font:inherit;transition:border-color .15s,box-shadow .15s}
.chaiauth-input:focus{outline:none;border-color:var(--_primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--_primary) 25%,transparent)}
.chaiauth-password{position:relative}
.chaiauth-password .chaiauth-input{padding-right:3.6rem}
.chaiauth-reveal{position:absolute;right:.35rem;top:50%;transform:translateY(-50%);padding:.25rem .5rem;border:0;border-radius:.4rem;background:none;color:var(--_muted);font:inherit;font-size:.78rem;cursor:pointer}
.chaiauth-reveal:hover{color:inherit}
.chaiauth-link{padding:0;border:0;background:none;color:var(--_primary);font:inherit;font-size:.82rem;text-decoration:none;cursor:pointer}
.chaiauth-link:hover{text-decoration:underline}
.chaiauth-submit,.chaiauth-provider{display:inline-flex;align-items:center;justify-content:center;width:100%;height:2.6rem;border-radius:var(--_radius);font:inherit;font-weight:600;cursor:pointer;
  transition:opacity .15s,transform .12s,background-color .15s}
.chaiauth-submit{border:0;background:var(--_primary);color:var(--chaiauth-primary-fg,#fff)}
.chaiauth-provider{border:1px solid var(--_border);background:var(--chaiauth-input-bg,transparent);color:inherit}
.chaiauth-provider:hover:not(:disabled){background:color-mix(in srgb,currentColor 6%,transparent)}
.chaiauth-submit:hover:not(:disabled){opacity:.92}
.chaiauth-submit:active:not(:disabled),.chaiauth-provider:active:not(:disabled){transform:scale(.985)}
.chaiauth-submit:disabled,.chaiauth-provider:disabled{opacity:.55;cursor:not-allowed}
.chaiauth-submit:focus-visible,.chaiauth-provider:focus-visible,.chaiauth-link:focus-visible,.chaiauth-reveal:focus-visible{outline:2px solid var(--_primary);outline-offset:2px}
.chaiauth-providers{display:flex;flex-direction:column;gap:.5rem}
.chaiauth-divider{display:flex;align-items:center;gap:.75rem;color:var(--_muted);font-size:.8rem}
.chaiauth-divider::before,.chaiauth-divider::after{content:"";flex:1;height:1px;background:var(--_border)}
.chaiauth-error{margin:0;padding:.6rem .75rem;border-radius:var(--_radius);border:1px solid color-mix(in srgb,var(--_danger) 40%,transparent);
  background:color-mix(in srgb,var(--_danger) 10%,transparent);color:var(--_danger);font-size:.84rem}
.chaiauth-notice{margin:0;padding:.6rem .75rem;border-radius:var(--_radius);border:1px solid var(--_border);
  background:color-mix(in srgb,var(--_primary) 8%,transparent);font-size:.84rem}
.chaiauth-row{display:flex;justify-content:space-between;gap:1rem}
.chaiauth-link:disabled{opacity:.5;cursor:not-allowed}
.chaiauth-captcha{min-height:65px}
.chaiauth-form-footer{text-align:center;color:var(--_muted);font-size:.85rem}
@media (prefers-reduced-motion:reduce){.chaiauth-submit,.chaiauth-input{transition:none}}

@media (prefers-color-scheme:dark){
  .chaiauth-user{color:#fafafa}
  .chaiauth-menu{background:#18181b;color:#fafafa;border-color:#3f3f46}
  .chaiauth-head{border-color:#3f3f46}
  .chaiauth-email{color:#a1a1aa}
  .chaiauth-item:hover{background:#27272a}
}
@media (prefers-reduced-motion:reduce){.chaiauth-menu{animation:none}.chaiauth-btn{transition:none}}
`;

/** Adds the SDK's small stylesheet to the page once (no CSS import needed by the app). */
export function useChaiAuthStyles() {
  useInsertionEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}
