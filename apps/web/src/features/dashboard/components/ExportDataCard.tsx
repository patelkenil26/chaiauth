"use client";

import { Download, Loader2, X, Lock } from "lucide-react";
import { useExportData } from "../hooks/useExportData";
import { IconTile } from "@/shared/components/IconTile";

export function ExportDataCard() {
  const { 
    isExporting, 
    isModalOpen, 
    setIsModalOpen, 
    password, 
    setPassword, 
    initiateExport, 
    handleExportRequest 
  } = useExportData();

  return (
    <>
      <div className="ca-glass overflow-hidden rounded-xl">
        <div className="border-b border-border/50 px-5 py-4 flex items-center gap-4">
          <IconTile>
            <Download className="h-5 w-5" />
          </IconTile>
          <div>
            <h2 className="text-base font-semibold text-foreground">Export Data</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Request a secure copy of your personal data, sessions, and linked apps.
            </p>
          </div>
        </div>
        
        <div className="bg-card/50 px-5 py-5 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Request Data Archive</p>
            <p className="text-[0.8rem] text-muted-foreground mt-1 max-w-lg">
              For your security, a download link will be generated and sent to your verified email address.
            </p>
          </div>
          <div className="mt-4 sm:ml-6 sm:mt-0 sm:shrink-0">
            <button 
              onClick={initiateExport}
              disabled={isExporting}
              className="ca-btn bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Data"}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl ca-fade-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Verify it's you</h3>
            </div>
            
            <p className="mb-4 text-sm text-text-soft leading-relaxed">
              Exporting your data is a sensitive action. Please enter your password to confirm.
            </p>
            
            <div className="mb-6 space-y-1.5">
              <label className="block mb-2 text-[0.8rem] font-medium text-text-soft">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ca-input focus:border-primary focus:ring-primary/20"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="ca-btn ca-btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={handleExportRequest}
                disabled={!password || isExporting}
                className="ca-btn bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 disabled:opacity-50 min-w-[120px]"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
