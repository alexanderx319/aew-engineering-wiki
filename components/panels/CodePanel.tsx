"use client";

import { useState } from "react";
import { C, F } from "../../lib/tokens";
import { includesQuery } from "../../lib/utils";
import { Tag } from "../ui/Tag";
import { Btn } from "../ui/Btn";
import { SnippetEditor } from "../editors";
import type { AEWState, Snippet, EditorMode } from "../../lib/types";

interface CodePanelProps {
  state:    AEWState;
  setState: React.Dispatch<React.SetStateAction<AEWState>>;
  query:    string;
  toast:    (msg: string, kind?: "success" | "error" | "info") => void;
}

export function CodePanel({ state, setState, query, toast }: CodePanelProps) {
  const [mode,           setMode]           = useState<EditorMode>("view");
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  const q = query.trim().toLowerCase();

  const visible = state.snippets.filter((s) =>
    q ? includesQuery([s.id, s.title, s.language, s.description, s.code, s.tags.join(" ")].join(" "), q) : true
  );

  const saveSnippet = (snippet: Snippet) => {
    setState((prev) => {
      const exists = prev.snippets.some((s) => s.id === snippet.id);
      const next   = exists ? prev.snippets.map((s) => (s.id === snippet.id ? snippet : s)) : [snippet, ...prev.snippets];
      return { ...prev, snippets: next };
    });
    toast(editingSnippet ? "Snippet actualizado." : "Snippet guardado.", "success");
    setMode("view");
    setEditingSnippet(null);
  };

  const deleteSnippet = (id: string) => {
    if (!confirm("¿Eliminar este snippet?")) return;
    setState((prev) => ({ ...prev, snippets: prev.snippets.filter((s) => s.id !== id) }));
    toast("Snippet eliminado.", "info");
  };

  const copySnippet = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast("Código copiado al portapapeles.", "success");
    } catch {
      toast("No se pudo copiar.", "error");
    }
  };

  if (mode !== "view") {
    return (
      <SnippetEditor
        key={`${mode}-${editingSnippet?.id ?? "new"}`}
        initial={mode === "edit" ? editingSnippet ?? undefined : undefined}
        onSave={saveSnippet}
        onCancel={() => { setMode("view"); setEditingSnippet(null); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 4 }}>CÓDIGO</div>
          <h2 style={{ color: C.textWhite, fontSize: 22, fontWeight: 800, fontFamily: F.mono, margin: 0 }}>
            {visible.length} snippet{visible.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <button
          onClick={() => setMode("new")}
          style={{ background: C.purple + "22", border: `1px solid ${C.purple}44`, color: C.purple, borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontFamily: F.mono }}
        >
          + Nuevo snippet
        </button>
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.textMuted, fontFamily: F.mono }}>
          {q ? `Sin snippets que coincidan con "${q}".` : "Sin snippets guardados aún."}
        </div>
      )}

      {visible.map((s) => (
        <div key={s.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ color: C.purple, fontSize: 11, fontFamily: F.mono }}>{s.language} · {s.date}</div>
              <h3 style={{ color: C.textWhite, fontSize: 15, fontWeight: 700, margin: "4px 0 8px" }}>{s.title}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {s.tags.slice(0, 4).map((t) => <Tag key={t} label={t} color={C.purple} />)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Btn label="Copiar" onClick={() => copySnippet(s.code)} />
              <Btn label="✏️"    onClick={() => { setEditingSnippet(s); setMode("edit"); }} />
              <Btn label="🗑"    color={C.red} onClick={() => deleteSnippet(s.id)} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {s.description && (
              <div style={{ background: C.surfaceLow, borderRadius: 8, padding: 14 }}>
                <div style={{ color: C.teal, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>DESCRIPCIÓN</div>
                <div style={{ color: C.textBody, fontSize: 13, fontFamily: F.mono, lineHeight: 1.6 }}>{s.description}</div>
              </div>
            )}
            <pre style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, color: "#c7f9ff", overflowX: "auto", fontSize: 12, lineHeight: 1.7, fontFamily: F.code, whiteSpace: "pre", margin: 0 }}>
              <code>{s.code}</code>
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
