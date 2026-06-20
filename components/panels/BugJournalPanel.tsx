"use client";

import { useState } from "react";
import { C, F } from "../../lib/tokens";
import { includesQuery } from "../../lib/utils";
import { Tag } from "../ui/Tag";
import { Btn } from "../ui/Btn";
import { BugEditor } from "../editors";
import type { AEWState, Bug, EditorMode } from "../../lib/types";

interface BugJournalPanelProps {
  state:    AEWState;
  setState: React.Dispatch<React.SetStateAction<AEWState>>;
  query:    string;
  toast:    (msg: string, kind?: "success" | "error" | "info") => void;
}

export function BugJournalPanel({ state, setState, query, toast }: BugJournalPanelProps) {
  const [mode,       setMode]       = useState<EditorMode>("view");
  const [editingBug, setEditingBug] = useState<Bug | null>(null);

  const q = query.trim().toLowerCase();

  const visible = state.bugs.filter((b) =>
    q ? includesQuery([b.id, b.title, b.cause, b.solution, b.project, b.status].join(" "), q) : true
  );

  const saveBug = (bug: Bug) => {
    setState((prev) => {
      const exists  = prev.bugs.some((b) => b.id === bug.id);
      const nextBugs = exists ? prev.bugs.map((b) => (b.id === bug.id ? bug : b)) : [bug, ...prev.bugs];
      return { ...prev, bugs: nextBugs };
    });
    toast(editingBug ? "Bug actualizado." : "Bug registrado.", "success");
    setMode("view");
    setEditingBug(null);
  };

  const deleteBug = (id: string) => {
    if (!confirm("¿Eliminar este bug?")) return;
    setState((prev) => ({ ...prev, bugs: prev.bugs.filter((b) => b.id !== id) }));
    toast("Bug eliminado.", "info");
  };

  if (mode !== "view") {
    return (
      <BugEditor
        key={`${mode}-${editingBug?.id ?? "new"}`}
        initial={mode === "edit" ? editingBug ?? undefined : undefined}
        onSave={saveBug}
        onCancel={() => { setMode("view"); setEditingBug(null); }}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 4 }}>BUG JOURNAL</div>
          <h2 style={{ color: C.textWhite, fontSize: 22, fontWeight: 800, fontFamily: F.mono, margin: 0 }}>
            {visible.length} bug{visible.length !== 1 ? "s" : ""} documentado{visible.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <button
          onClick={() => setMode("new")}
          style={{ background: C.red + "22", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontFamily: F.mono }}
        >
          + Nuevo bug
        </button>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.textMuted, fontFamily: F.mono }}>
          {q ? `Sin bugs que coincidan con "${q}".` : "Sin bugs documentados aún."}
        </div>
      )}

      {/* Bug cards */}
      {visible.map((b) => (
        <div key={b.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ color: C.red, fontSize: 11, fontFamily: F.mono }}>{b.id}</span>
              <h3 style={{ color: C.textWhite, fontSize: 15, fontWeight: 700, margin: "4px 0 8px" }}>{b.title}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag label={b.project} color={C.primary} />
                <Tag label={b.status}  color={b.status === "Resuelto" ? C.teal : C.yellow} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono }}>{b.date}</span>
              <Btn label="✏️" onClick={() => { setEditingBug(b); setMode("edit"); }} />
              <Btn label="🗑" color={C.red} onClick={() => deleteBug(b.id)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoBlock label="CAUSA"    color={C.red}  value={b.cause}    />
            <InfoBlock label="SOLUCIÓN" color={C.teal} value={b.solution} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoBlock({ label, color, value }: { label: string; color: string; value: string }) {
  return (
    <div style={{ background: C.surfaceLow, borderRadius: 8, padding: 14 }}>
      <div style={{ color, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      <div style={{ color: C.textBody, fontSize: 13, fontFamily: F.mono, lineHeight: 1.6 }}>{value || "—"}</div>
    </div>
  );
}
