"use client";

import { AlertOctagon, Loader2, X } from "lucide-react";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { IconTile } from "@/shared/components/IconTile";

export function DeleteAccountCard() {
  const {
    isModalOpen,
    setIsModalOpen,
    confirmText,
    setConfirmText,
    isDeleting,
    handleDelete
  } = useDeleteAccount();

  return (
    <>
      <div className="ca-glass overflow-hidden rounded-xl mt-12">
        <div className="border-b border-border/50 px-5 py-4 flex items-center gap-4">
          <IconTile tone="danger">
            <AlertOctagon className="h-5 w-5" />
          </IconTile>
          <div>
            <h2 className="text-base font-semibold text-foreground">Danger Zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your ChaiAuth account and all associated data.
            </p>
          </div>
        </div>
        
        <div className="bg-destructive/5 px-5 py-5 sm:flex sm:items-center sm:justify-between border-t border-destructive/20">
          <div>
            <p className="text-sm font-medium text-destructive">Delete Account</p>
            <p className="text-[0.8rem] text-destructive/80 mt-1 max-w-lg">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
          <div className="mt-4 sm:ml-6 sm:mt-0 sm:shrink-0">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="ca-btn shadow-sm shadow-destructive/20 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-destructive/20 bg-card p-6 shadow-2xl ca-fade-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Confirm Deletion</h3>
            </div>
            
            <p className="mb-4 text-sm text-text-soft leading-relaxed">
              This action <span className="font-semibold text-foreground">cannot be undone</span>. This will permanently delete your account, active sessions, and any developer applications you have created.
            </p>
            
            <div className="mb-6 space-y-1.5">
              <label className="block mb-2 text-[0.8rem] font-medium text-text-soft">
                Type <span className="select-all font-bold text-foreground">DELETE</span> to confirm
              </label>
              <input 
                type="text" 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="ca-input focus:border-destructive focus:ring-destructive/20"
                placeholder="DELETE"
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
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="ca-btn bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm shadow-destructive/20 disabled:opacity-50 min-w-[120px]"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
