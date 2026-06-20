"use client";

import { useState } from "react";
import { C, F } from "../../lib/tokens";
import { uid, today, parseTags } from "../../lib/utils";
import { inputStyle } from "../ui/inputStyle";
import { Modal } from "../ui/Modal";
import { WordCounter } from "../ui/WordCounter";
import type { Article, Bug, Experiment, Snippet, Category } from "../../lib/types";

// ─── Shared primitives ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 4 }}>
      {children}
    </div>
  );
}

const saveBtn: React.CSSProperties = {
  background: C.primary, border: "none", color: "#fff",
  borderRadius: 8, padding: "10px 22px", cursor: "pointer",
  fontSize: 13, fontFamily: F.mono, fontWeight: 700,
  boxShadow: `0 4px 14px #6c63ff44`,
};

const cancelBtn: React.CSSProperties = {
  background: "transparent", border: `1px solid ${C.borderStrong}`,
  color: C.textMuted, borderRadius: 8, padding: "10px 20px",
  cursor: "pointer", fontSize: 13, fontFamily: F.mono,
};

const editorWrap: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 10, padding: 32,
};

// ─── Category modal ────────────────────────────────────────────────────────────

interface CategoryModalProps {
  mode:     "create" | "edit";
  initial?: Category;
  onClose:  () => void;
  onSave:   (data: { name: string; icon: string; description: string }) => void;
}

export function CategoryModal({ mode, initial, onClose, onSave }: CategoryModalProps) {
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [icon,        setIcon]        = useState(initial?.icon        ?? "📁");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <Modal title={mode === "create" ? "Nueva categoría" : "Editar categoría"} subtitle="CATEGORÍAS" onClose={onClose} maxWidth={560}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Icono" style={{ ...inputStyle, textAlign: "center", fontSize: 22 }} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" style={inputStyle} autoFocus />
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción opcional..." style={{ ...inputStyle, height: 80, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 12 }}>
          <button style={saveBtn}   onClick={() => { if (!name.trim()) return; onSave({ name, icon, description }); }}>Guardar</button>
          <button style={cancelBtn} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Article editor ────────────────────────────────────────────────────────────

interface ArticleEditorProps {
  initial?:          Article;
  categories:        Category[];
  defaultCategoryId: string;
  onSave:            (article: Article) => void;
  onCancel:          () => void;
}

export function ArticleEditor({ initial, categories, defaultCategoryId, onSave, onCancel }: ArticleEditorProps) {
  const [title,      setTitle]      = useState(initial?.title           ?? "");
  const [content,    setContent]    = useState(initial?.content         ?? "");
  const [tags,       setTags]       = useState(initial?.tags.join(", ") ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId      ?? defaultCategoryId);
  const isEdit = Boolean(initial);

  const handleSave = () => {
    const t = title.trim();
    if (!t) return;
    onSave({
      id:        initial?.id ?? `${t.toLowerCase().replace(/ /g, "-")}-${Date.now()}`,
      title:     t, content,
      tags:      parseTags(tags),
      date:      initial?.date ?? today(),
      updatedAt: today(),
      categoryId,
    });
  };

  return (
    <div>
      <Label>{isEdit ? "EDITANDO ARTÍCULO" : "NUEVO ARTÍCULO"}</Label>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del artículo..." style={{ ...inputStyle, fontSize: 18 }} autoFocus />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags: Arch, Linux, Python" style={inputStyle} />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono }}>
          Usa ## para secciones, ### para subsecciones, ``` para código.
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"## Descripción\n\nEscribe aquí...\n\n## Solución\n\nPasos..."}
          style={{ ...inputStyle, height: 360, resize: "vertical", lineHeight: 1.7 }}
        />
        <WordCounter text={content} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={saveBtn}   onClick={handleSave}>Guardar</button>
        <button style={cancelBtn} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Bug editor ────────────────────────────────────────────────────────────────

interface BugEditorProps {
  initial?: Bug;
  onSave:   (bug: Bug) => void;
  onCancel: () => void;
}

export function BugEditor({ initial, onSave, onCancel }: BugEditorProps) {
  const [title,    setTitle]    = useState(initial?.title    ?? "");
  const [cause,    setCause]    = useState(initial?.cause    ?? "");
  const [solution, setSolution] = useState(initial?.solution ?? "");
  const [project,  setProject]  = useState(initial?.project  ?? "");
  const [status,   setStatus]   = useState<Bug["status"]>(initial?.status ?? "Resuelto");
  const isEdit = Boolean(initial);

  return (
    <div style={editorWrap}>
      <Label>{isEdit ? "EDITANDO BUG" : "NUEVO BUG"}</Label>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input value={title}   onChange={(e) => setTitle(e.target.value)}   placeholder="Título del bug..."       style={inputStyle} autoFocus />
        <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Proyecto relacionado..."  style={inputStyle} />
        <textarea value={cause}    onChange={(e) => setCause(e.target.value)}    placeholder="Causa del bug..."    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
        <textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Solución aplicada..." style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
        <select value={status} onChange={(e) => setStatus(e.target.value as Bug["status"])} style={inputStyle}>
          <option value="Resuelto">Resuelto</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={saveBtn}   onClick={() => { if (!title.trim()) return; onSave({ id: initial?.id ?? `BUG-${Date.now().toString(36).toUpperCase()}`, title, cause, solution, project, date: initial?.date ?? today(), status }); }}>Guardar</button>
        <button style={cancelBtn} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Experiment editor ─────────────────────────────────────────────────────────

interface ExperimentEditorProps {
  initial?: Experiment;
  onSave:   (experiment: Experiment) => void;
  onCancel: () => void;
}

export function ExperimentEditor({ initial, onSave, onCancel }: ExperimentEditorProps) {
  const [title,      setTitle]      = useState(initial?.title             ?? "");
  const [tags,       setTags]       = useState(initial?.tags.join(", ")   ?? "");
  const [status,     setStatus]     = useState<Experiment["status"]>(initial?.status ?? "Pendiente");
  const [summary,    setSummary]    = useState(initial?.summary            ?? "");
  const [hypothesis, setHypothesis] = useState(initial?.hypothesis         ?? "");
  const [procedure,  setProcedure]  = useState(initial?.procedure          ?? "");
  const [result,     setResult]     = useState(initial?.result             ?? "");
  const [conclusion, setConclusion] = useState(initial?.conclusion         ?? "");
  const isEdit = Boolean(initial);

  const fields = [
    { label: "RESUMEN",       value: summary,    set: setSummary,    ph: "Qué se busca lograr...",      rows: 3 },
    { label: "HIPÓTESIS",     value: hypothesis, set: setHypothesis, ph: "Qué se espera que ocurra...", rows: 3 },
    { label: "PROCEDIMIENTO", value: procedure,  set: setProcedure,  ph: "Pasos seguidos...",           rows: 4 },
    { label: "RESULTADO",     value: result,     set: setResult,     ph: "Qué ocurrió realmente...",    rows: 3 },
    { label: "CONCLUSIÓN",    value: conclusion, set: setConclusion, ph: "Qué se aprendió...",          rows: 3 },
  ];

  return (
    <div style={editorWrap}>
      <Label>{isEdit ? "EDITANDO EXPERIMENTO" : "NUEVO EXPERIMENTO"}</Label>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título..." style={{ ...inputStyle, fontSize: 16 }} autoFocus />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12 }}>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags: ESP32, FSM..." style={inputStyle} />
          <select value={status} onChange={(e) => setStatus(e.target.value as Experiment["status"])} style={inputStyle}>
            <option value="Pendiente">Pendiente</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
        {fields.map((f) => (
          <div key={f.label}>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>{f.label}</div>
            <textarea value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} style={{ ...inputStyle, minHeight: f.rows * 28, resize: "vertical" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={saveBtn}   onClick={() => { if (!title.trim()) return; onSave({ id: initial?.id ?? uid("exp"), title, summary, hypothesis, procedure, result, conclusion, tags: parseTags(tags), date: initial?.date ?? today(), updatedAt: today(), status }); }}>Guardar</button>
        <button style={cancelBtn} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Snippet editor ────────────────────────────────────────────────────────────

interface SnippetEditorProps {
  initial?: Snippet;
  onSave:   (snippet: Snippet) => void;
  onCancel: () => void;
}

export function SnippetEditor({ initial, onSave, onCancel }: SnippetEditorProps) {
  const [title,       setTitle]       = useState(initial?.title           ?? "");
  const [language,    setLanguage]    = useState(initial?.language         ?? "TypeScript");
  const [tags,        setTags]        = useState(initial?.tags.join(", ") ?? "");
  const [description, setDescription] = useState(initial?.description     ?? "");
  const [code,        setCode]        = useState(initial?.code            ?? "");
  const isEdit = Boolean(initial);

  return (
    <div style={editorWrap}>
      <Label>{isEdit ? "EDITANDO SNIPPET" : "NUEVO SNIPPET"}</Label>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título..." style={inputStyle} autoFocus />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12 }}>
          <input value={tags}      onChange={(e) => setTags(e.target.value)}     placeholder="Tags: ESP32, PWM..."  style={inputStyle} />
          <input value={language}  onChange={(e) => setLanguage(e.target.value)} placeholder="Lenguaje"             style={inputStyle} />
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción breve..." style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />
        <textarea value={code}        onChange={(e) => setCode(e.target.value)}        placeholder="// Código aquí..."    style={{ ...inputStyle, minHeight: 260, resize: "vertical", fontFamily: F.code }} />
        <WordCounter text={code} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={saveBtn}   onClick={() => { if (!title.trim()) return; onSave({ id: initial?.id ?? `CODE-${Date.now().toString(36).toUpperCase()}`, title, language, description, code, tags: parseTags(tags), date: initial?.date ?? today(), updatedAt: today() }); }}>Guardar</button>
        <button style={cancelBtn} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
