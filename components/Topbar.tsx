"use client";

import type React from "react";
import { C, F } from "../lib/tokens";
import { NAV } from "../lib/constants";
import type { SectionId, SearchHit } from "../lib/types";

// ─── Search result pill ────────────────────────────────────────────────────

const KIND_ICON: Record<string, string> = {
  category:   "📁",
  article:    "📝",
  bug:        "🐛",
  experiment: "🧪",
  snippet:    "{ }",
  customEntry: "📂",
};

interface TopbarProps {
  query:        string;
  setQuery:     (q: string) => void;
  active:       SectionId;
  setActive:    (id: SectionId) => void;
  hits:         SearchHit[];
  state:        import("../lib/types").AEWState;
  onExport:     () => void;
  onImport:     React.ChangeEventHandler<HTMLInputElement>;
  onNewSection:  () => void;
  onOpenPalette: () => void;
}

export function Topbar({ query, setQuery, active, setActive, hits, state, onExport, onImport, onNewSection, onOpenPalette }: TopbarProps) {
  const hasHits = query.trim().length > 0 && hits.length > 0;
  const noHits  = query.trim().length > 0 && hits.length === 0;

  return (
    <div
      style={{
        position:        "sticky",
        top:             0,
        zIndex:          50,
        background:      C.surfaceLow + "ee",
        backdropFilter:  "blur(12px)",
        borderBottom:    `1px solid ${C.border}`,
        padding:         "12px 32px",
      }}
    >
      {/* Row 1: search + actions */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        {/* Search */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => onOpenPalette()}
            placeholder="Buscar...  Ctrl+K"
            style={{
              width:        "100%",
              background:   C.surface,
              border:       `1px solid ${query ? C.primary + "88" : C.border}`,
              borderRadius: 8,
              padding:      "9px 16px 9px 40px",
              color:        C.textWhite,
              fontFamily:   F.mono,
              fontSize:     13,
              outline:      "none",
              boxSizing:    "border-box",
              transition:   "border-color 0.2s",
            }}
          />
          {/* search icon */}
          <span
            style={{
              position:  "absolute",
              left:      14,
              top:       "50%",
              transform: "translateY(-50%)",
              color:     query ? C.primary : C.textMuted,
              fontSize:  14,
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12, fontFamily: F.mono, padding: "2px 6px" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={onExport}
          style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: F.mono, fontSize: 12, whiteSpace: "nowrap" }}
        >
          Exportar
        </button>
        <label
          style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: F.mono, fontSize: 12, whiteSpace: "nowrap" }}
        >
          Importar
          <input type="file" accept=".json,application/json,text/plain" style={{ display: "none" }} onChange={onImport as React.ChangeEventHandler<HTMLInputElement>} />
        </label>
        <button
          onClick={onNewSection}
          style={{ background: C.primary, border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: F.mono, fontSize: 12, whiteSpace: "nowrap", fontWeight: 700 }}
        >
          + Sección
        </button>
      </div>

      {/* Row 2: nav tabs — core + custom sections */}
      {(() => {
        const allItems = [
          ...NAV,
          ...state.customSections.map((s) => ({ id: s.id, label: s.name, icon: s.icon, color: s.color })),
        ];
        return (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {allItems.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  style={{
                    background:   isActive ? C.surfaceHigh : "transparent",
                    border:       isActive ? `1px solid ${item.color}55` : `1px solid transparent`,
                    color:        isActive ? C.textWhite : C.textMuted,
                    borderRadius: 20,
                    padding:      "5px 14px",
                    cursor:       "pointer",
                    fontFamily:   F.mono,
                    fontSize:     11,
                    transition:   "all 0.12s",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          5,
                  }}
                >
                  <span style={{ fontSize: 12 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Search results dropdown */}
      {hasHits && (
        <div
          style={{
            position:     "absolute",
            top:          "100%",
            left:         32,
            right:        32,
            background:   C.surface,
            border:       `1px solid ${C.border}`,
            borderRadius: 12,
            boxShadow:    "0 16px 48px rgba(0,0,0,0.5)",
            zIndex:       200,
            maxHeight:    400,
            overflowY:    "auto",
            padding:      8,
          }}
        >
          {hits.map((hit) => {
            const section = [
              ...NAV,
              ...state.customSections.map((s) => ({ id: s.id, label: s.name, icon: s.icon, color: s.color })),
            ].find((n) => n.id === hit.section);
            return (
              <button
                key={`${hit.section}-${hit.id}`}
                onClick={() => { setActive(hit.section); setQuery(""); }}
                style={{
                  width:        "100%",
                  background:   "transparent",
                  border:       "none",
                  borderRadius: 8,
                  padding:      "10px 14px",
                  textAlign:    "left",
                  cursor:       "pointer",
                  display:      "flex",
                  gap:          12,
                  alignItems:   "flex-start",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHigh}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{KIND_ICON[hit.kind]}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.textWhite, fontSize: 13, fontFamily: F.mono, fontWeight: 600, marginBottom: 2 }}>
                    {hit.title}
                  </div>
                  <div style={{ color: section?.color ?? C.textMuted, fontSize: 10, fontFamily: F.mono, marginBottom: 4 }}>
                    {hit.subtitle}
                  </div>
                  <div style={{ color: C.textDim, fontSize: 11, fontFamily: F.mono, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hit.excerpt}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {noHits && (
        <div
          style={{
            position:     "absolute",
            top:          "100%",
            left:         32,
            right:        32,
            background:   C.surface,
            border:       `1px solid ${C.border}`,
            borderRadius: 12,
            boxShadow:    "0 16px 48px rgba(0,0,0,0.5)",
            zIndex:       200,
            padding:      "20px 24px",
            color:        C.textMuted,
            fontFamily:   F.mono,
            fontSize:     13,
          }}
        >
          Sin resultados para "{query}".
        </div>
      )}
    </div>
  );
}
