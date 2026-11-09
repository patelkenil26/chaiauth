import React from "react";
import { Loader2 } from "lucide-react";
import { useCreateApp } from "../hooks/useCreateApp";

interface CreateAppModalProps {
  onClose: () => void;
  onCreate: (name: string, applicationUrl: string | undefined, uri: string, allowedIdps: string[]) => Promise<void>;
}

export function CreateAppModal({ onClose, onCreate }: CreateAppModalProps) {
  const { register, errors, isSubmitting, onSubmit, allowedIdps, setAllowedIdps } = useCreateApp(onCreate);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <form onSubmit={onSubmit} noValidate className="ca-glass w-full max-w-lg rounded-xl p-6 ca-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <p className="ca-mono text-[0.68rem] uppercase text-primary" style={{ letterSpacing: ".16em" }}>OAuth client</p>
            <h2 id="create-title" className="mt-2 font-display text-xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Create application</h2>
          </div>
        </div>
        
        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block mb-2 text-[0.8rem] font-medium text-text-soft">Application name</label>
            <input 
              type="text" 
              placeholder="My application" 
              className={`ca-input ${errors.name ? "border-destructive" : ""}`}
              {...register("name")}
            />
            {errors.name && <p className="text-[0.78rem] text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block mb-2 text-[0.8rem] font-medium text-text-soft">Homepage URL <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <input 
              type="url" 
              placeholder="https://yourapp.com" 
              className={`ca-input ${errors.applicationUrl ? "border-destructive" : ""}`}
              {...register("applicationUrl")}
            />
            {errors.applicationUrl && <p className="text-[0.78rem] text-destructive">{errors.applicationUrl.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block mb-2 text-[0.8rem] font-medium text-text-soft">Redirect URI</label>
            <input 
              type="url" 
              placeholder="https://yourapp.com/auth/callback" 
              className={`ca-input ${errors.uri ? "border-destructive" : ""}`}
              {...register("uri")}
            />
            {errors.uri ? (
              <p className="text-[0.78rem] text-destructive">{errors.uri.message}</p>
            ) : (
              <p className="text-[0.75rem] text-muted-foreground">Must match the callback URL used by your app exactly.</p>
            )}
          </div>

          <div className="space-y-3 pt-5 border-t border-border/50">
            <label className="text-[0.8rem] font-medium text-text-soft block">Allowed Sign-in Methods</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "email", label: "Email & Password" },
                { id: "google", label: "Google" },
                { id: "github", label: "GitHub" },
                { id: "phone", label: "Phone (OTP)", disabled: true },
                { id: "username", label: "Username" },
              ].map((idp) => {
                const isChecked = allowedIdps?.includes(idp.id) || false;
                return (
                  <label key={idp.id} title={idp.disabled ? "Coming soon" : ""} className={`relative inline-flex items-center ${idp.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"}`}>
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isChecked}
                      disabled={idp.disabled}
                      onChange={(e) => {
                        const newIdps = e.target.checked 
                          ? [...(allowedIdps || []), idp.id] 
                          : (allowedIdps || []).filter(i => i !== idp.id);
                        setAllowedIdps(newIdps);
                      }}
                    />
                    <div className="w-10 h-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/40 peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-[1.5px] after:left-[2px] after:bg-gradient-to-b after:from-white/90 after:to-white/60 after:border after:border-white/20 after:shadow-sm after:peer-checked:bg-none after:peer-checked:bg-white after:peer-checked:border-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-primary/60 peer-checked:border-primary/40 peer-checked:shadow-[0_0_15px_hsl(var(--primary)/0.5)]"></div>
                    <span className={`ml-3 text-sm font-medium text-text-soft select-none transition-colors ${idp.disabled ? "" : "group-hover:text-foreground"}`}>
                      {idp.label}
                      {idp.disabled && <span className="ml-1.5 text-[0.65rem] bg-secondary/50 text-secondary-foreground px-1.5 py-0.5 rounded-sm">Soon</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.allowedIdps && <p className="text-[0.78rem] text-destructive">{errors.allowedIdps.message}</p>}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className="ca-btn ca-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="ca-btn ca-btn-primary">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create application
          </button>
        </div>
      </form>
    </div>
  );
}
