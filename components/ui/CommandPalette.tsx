"use client";

import { useState, useEffect, useRef } from "react";
import { C, F } from "../../lib/tokens";
import type { SearchHit, SectionId } from "../../lib/types";

const KIND_ICON: Record<string, string> = {
  category: "📁", article: "📝", bug: "🐛",
  experiment: "🧪", snippet: "{ }", customEntry: "📂",
};

interface CommandPaletteProps {
  hits:      SearchHit[];
  query:     string;
  setQuery:  (q: string) => void;
  onSelect:  (section: SectionId) => void;
  onClose:   () => void;
}

export function CommandPalette({ hits, query, setQuery, onSelect, onClose }: CommandPaletteProps) {
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setCursor(0); }, [hits]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, hits.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && hits[cursor]) { onSelect(hits[cursor].section); onClose(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hits, cursor, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <div
      onClick={onClose}
      style={{
        position:       "fixed", inset: 0, zIndex: 3000,
        background:     "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display:        "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop:     "14vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        "100%", maxWidth: 620,
          background:   C.surface,
          border:       `1px solid ${C.borderStrong}`,
          borderRadius: 16,
          boxShadow:    "0 32px 80px rgba(0,0,0,0.7)",
          overflow:     "hidden",
          animation:    "aew-modal-in 0.15s ease-out",
        }}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
          <span style={{ color: C.textMuted, fontSize: 16 }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en toda AEW..."
            style={{
              flex: 1, background: "transparent", border: "none",
              color: C.textWhite, fontFamily: F.mono, fontSize: 15,
              outline: "none", boxShadow: "none",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12, fontFamily: F.mono }}>
              ✕
            </button>
          )}
          <kbd style={{ background: C.surfaceLow, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px", fontSize: 10, color: C.textMuted, fontFamily: F.mono }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 400, overflowY: "auto" }}>
          {!query && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.textFaint, fontFamily: F.mono, fontSize: 12 }}>
              Empieza a escribir para buscar en artículos, bugs, experimentos y snippets.
            </div>
          )}
          {query && hits.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.textFaint, fontFamily: F.mono, fontSize: 12 }}>
              Sin resultados para "{query}"
            </div>
          )}
          {hits.map((hit, i) => (
            <button
              key={`${hit.section}-${hit.id}`}
              onClick={() => { onSelect(hit.section); onClose(); }}
              style={{
                width:      "100%", background: i === cursor ? C.primary + "18" : "transparent",
                border:     "none", borderLeft: i === cursor ? `2px solid ${C.primary}` : "2px solid transparent",
                padding:    "10px 20px", textAlign: "left", cursor: "pointer",
                display:    "flex", gap: 12, alignItems: "flex-start",
                transition: "background 0.1s",
              }}
              onMouseEnter={() => setCursor(i)}
            >
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1, opacity: 0.8 }}>{KIND_ICON[hit.kind] ?? "📄"}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.textWhite, fontSize: 13, fontFamily: F.mono, fontWeight: 600, marginBottom: 2 }}>
                  {hit.title}
                </div>
                <div style={{ color: C.primary, fontSize: 10, fontFamily: F.mono, marginBottom: 3 }}>
                  {hit.subtitle}
                </div>
                <div style={{ color: C.textDim, fontSize: 11, fontFamily: F.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {hit.excerpt}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hints */}
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 16 }}>
          {[["↑↓", "navegar"], ["↵", "abrir"], ["esc", "cerrar"]].map(([key, label]) => (
            <div key={key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <kbd style={{ background: C.surfaceLow, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px", fontSize: 10, color: C.textMuted, fontFamily: F.mono }}>
                {key}
              </kbd>
              <span style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
