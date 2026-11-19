"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, FileText, Hash, Search } from "lucide-react";
import { searchDocs, type SearchEntry } from "./docsIndex";

/** Command-palette style docs search. Mount it only while open so its state resets each time. */
export function SearchDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (entry: SearchEntry) => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => searchDocs(query), [query]);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[cursor];
      if (hit) onSelect(hit);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <button type="button" aria-label="Close search" className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the docs"
        className="ca-glass relative w-full max-w-xl overflow-hidden rounded-2xl border border-border shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Search the docs…"
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="docs-search-results"
            aria-autocomplete="list"
          />
          <kbd className="ca-mono hidden rounded border border-border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground sm:block">Esc</kbd>
        </div>

        <ul id="docs-search-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.map((r, i) => (
            <li key={`${r.page}-${r.anchor ?? ""}`} role="option" aria-selected={i === cursor} data-index={i}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                onMouseMove={() => setCursor(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === cursor ? "bg-primary/12" : ""
                }`}
              >
                {r.anchor ? (
                  <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{r.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.group}</span>
                </span>
                {i === cursor && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              </button>
            </li>
          ))}
          {query.trim() && results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">No results for &ldquo;{query.trim()}&rdquo;</li>
          )}
          {!query.trim() && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Try &ldquo;pkce&rdquo;, &ldquo;refresh token&rdquo; or &ldquo;api key&rdquo;
            </li>
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground">
          <span>↑↓ to navigate</span>
          <span>↵ to open</span>
        </div>
      </div>
    </div>
  );
}
