import React from "react";
import { Trash2 } from "lucide-react";
import type { OAuthApp } from "../types";

interface DeleteConfirmModalProps {
  app: OAuthApp;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ app, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
      <section className="ca-glass w-full max-w-md rounded-xl p-6 ca-fade-up">
        <h2 id="delete-title" className="font-display text-xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
          Delete {app.name}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Its client ID will stop working in this demo. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="ca-btn ca-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="ca-btn ca-btn-primary bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none" onClick={onConfirm}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete app
          </button>
        </div>
      </section>
    </div>
  );
}
