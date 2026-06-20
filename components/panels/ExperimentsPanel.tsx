"use client";

import { useState } from "react";
import { C, F } from "../../lib/tokens";
import { includesQuery } from "../../lib/utils";
import { Tag } from "../ui/Tag";
import { Btn } from "../ui/Btn";
import { ExperimentEditor } from "../editors";
import type { AEWState, Experiment, EditorMode } from "../../lib/types";

interface ExperimentsPanelProps {
  state:    AEWState;
  setState: React.Dispatch<React.SetStateAction<AEWState>>;
  query:    string;
  toast:    (msg: string, kind?: "success" | "error" | "info") => void;
}

export function ExperimentsPanel({ state, setState, query, toast }: ExperimentsPanelProps) {
  const [mode,               setMode]               = useState<EditorMode>("view");
  const [editingExperiment,  setEditingExperiment]  = useState<Experiment | null>(null);

  const q = query.trim().toLowerCase();

  const visible = state.experiments.filter((e) =>
    q ? includesQuery([e.id, e.title, e.summary, e.hypothesis, e.procedure, e.result, e.conclusion, e.tags.join(" "), e.status].join(" "), q) : true
  );

  const saveExperiment = (experiment: Experiment) => {
    setState((prev) => {
      const exists = prev.experiments.some((e) => e.id === experiment.id);
      const next   = exists ? prev.experiments.map((e) => (e.id === experiment.id ? experiment : e)) : [experiment, ...prev.experiments];
      return { ...prev, experiments: next };
    });
    toast(editingExperiment ? "Experimento actualizado." : "Experimento registrado.", "success");
    setMode("view");
    setEditingExperiment(null);
  };

  const deleteExperiment = (id: string) => {
    if (!confirm("¿Eliminar este experimento?")) return;
    setState((prev) => ({ ...prev, experiments: prev.experiments.filter((e) => e.id !== id) }));
    toast("Experimento eliminado.", "info");
  };

  if (mode !== "view") {
    return (
      <ExperimentEditor
        key={`${mode}-${editingExperiment?.id ?? "new"}`}
        initial={mode === "edit" ? editingExperiment ?? undefined : undefined}
        onSave={saveExperiment}
        onCancel={() => { setMode("view"); setEditingExperiment(null); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 4 }}>EXPERIMENTOS</div>
          <h2 style={{ color: C.textWhite, fontSize: 22, fontWeight: 800, fontFamily: F.mono, margin: 0 }}>
            {visible.length} experimento{visible.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <button
          onClick={() => setMode("new")}
          style={{ background: C.yellow + "22", border: `1px solid ${C.yellow}44`, color: C.yellow, borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontFamily: F.mono }}
        >
          + Nuevo experimento
        </button>
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.textMuted, fontFamily: F.mono }}>
          {q ? `Sin experimentos que coincidan con "${q}".` : "Sin experimentos documentados aún."}
        </div>
      )}

      {visible.map((e) => (
        <div key={e.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ color: C.yellow, fontSize: 11, fontFamily: F.mono }}>{e.date}</div>
              <h3 style={{ color: C.textWhite, fontSize: 15, fontWeight: 700, margin: "4px 0 8px" }}>{e.title}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag label={e.status} color={e.status === "Completado" ? C.teal : C.yellow} />
                {e.tags.slice(0, 4).map((t) => <Tag key={t} label={t} />)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Btn label="✏️" onClick={() => { setEditingExperiment(e); setMode("edit"); }} />
              <Btn label="🗑" color={C.red} onClick={() => deleteExperiment(e.id)} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <ExBlock label="RESUMEN"    color={C.purple} value={e.summary}    />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ExBlock label="HIPÓTESIS"  color={C.red}    value={e.hypothesis} />
              <ExBlock label="CONCLUSIÓN" color={C.teal}   value={e.conclusion} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExBlock({ label, color, value }: { label: string; color: string; value: string }) {
  return (
    <div style={{ background: C.surfaceLow, borderRadius: 8, padding: 14 }}>
      <div style={{ color, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      <div style={{ color: C.textBody, fontSize: 13, fontFamily: F.mono, lineHeight: 1.6 }}>{value || "—"}</div>
    </div>
  );
}
