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
