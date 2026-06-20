"use client";

import { useState, useMemo } from "react";
import { C, F } from "../../lib/tokens";
import { uid, today, includesQuery } from "../../lib/utils";
import { inputStyle } from "../ui/inputStyle";
import { Tag } from "../ui/Tag";
import { Btn } from "../ui/Btn";
import { Modal } from "../ui/Modal";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import type { AEWState, CustomSection, CustomEntry, FieldSchema } from "../../lib/types";

interface CustomSectionPanelProps {
  section:  CustomSection;
  state:    AEWState;
  setState: React.Dispatch<React.SetStateAction<AEWState>>;
  query:    string;
  toast:    (msg: string, kind?: "success" | "error" | "info") => void;
}

// ─── Dynamic field renderer (read) ──────────────────────────────────────────

function FieldValue({ field, value }: { field: FieldSchema; value: string }) {
  if (!value) return <span style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12 }}>—</span>;

  if (field.type === "status") {
    return <span style={{ background: C.primary + "22", border: `1px solid ${C.primary}44`, color: C.primary, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontFamily: F.mono }}>{value}</span>;
  }
  if (field.type === "rating") {
    const n = parseInt(value, 10) || 0;
    return <span style={{ color: "#feca57", fontSize: 16 }}>{"★".repeat(n)}{"☆".repeat(Math.max(0, 5 - n))}</span>;
  }
  if (field.type === "url") {
    return <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontFamily: F.mono, fontSize: 12, wordBreak: "break-all" }}>{value}</a>;
  }
  if (field.type === "tags") {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {value.split(",").map((t) => t.trim()).filter(Boolean).map((t) => <Tag key={t} label={t} />)}
      </div>
    );
  }
  if (field.type === "code") {
    return <pre style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, color: "#c7f9ff", fontSize: 12, fontFamily: F.mono, overflowX: "auto", margin: 0 }}><code>{value}</code></pre>;
  }
  return <span style={{ color: C.textBody, fontFamily: F.mono, fontSize: 13 }}>{value}</span>;
}

// ─── Dynamic field input (write) ─────────────────────────────────────────────

function FieldInput({ field, value, onChange }: { field: FieldSchema; value: string; onChange: (v: string) => void }) {
  if (field.type === "textarea") {
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder ?? ""} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />;
  }
  if (field.type === "select" || field.type === "status") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">— seleccionar —</option>
        {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === "rating") {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {[1,2,3,4,5].map((n) => (
          <button key={n} onClick={() => onChange(String(n))} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 24, color: parseInt(value, 10) >= n ? "#feca57" : C.textFaint,
          }}>★</button>
        ))}
      </div>
    );
  }
  if (field.type === "code") {
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="// Código..." style={{ ...inputStyle, minHeight: 120, resize: "vertical", fontFamily: F.code }} />;
  }
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder ?? field.label} type={field.type === "number" ? "number" : field.type === "url" ? "url" : field.type === "date" ? "date" : "text"} style={inputStyle} />;
}

// ─── Entry editor modal ───────────────────────────────────────────────────────

interface EntryEditorProps {
  section:  CustomSection;
  initial?: CustomEntry;
  onSave:   (entry: CustomEntry) => void;
  onClose:  () => void;
}

function EntryEditor({ section, initial, onSave, onClose }: EntryEditorProps) {
  const [title,   setTitle]   = useState(initial?.title   ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags,    setTags]    = useState(initial?.tags.join(", ") ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initial?.fields ?? {});

  const setField = (id: string, val: string) => setFieldValues((prev) => ({ ...prev, [id]: val }));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id:        initial?.id  ?? uid("ent"),
      sectionId: section.id,
      title:     title.trim(),
      content,
      fields:    fieldValues,
      tags:      tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: initial?.createdAt ?? today(),
      updatedAt: today(),
      pinned:    initial?.pinned ?? false,
    });
  };

  const isNew = !initial;

  return (
    <Modal title={isNew ? `Nueva entrada` : `Editar — ${initial?.title}`} subtitle={section.icon + " " + section.name.toUpperCase()} onClose={onClose} maxWidth={680}>
      <div style={{ display: "grid", gap: 14 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título..." style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} autoFocus />

        {section.fields.map((field) => (
          <div key={field.id}>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>
              {field.label.toUpperCase()}{field.required ? " *" : ""}
            </div>
            <FieldInput field={field} value={fieldValues[field.id] ?? ""} onChange={(v) => setField(field.id, v)} />
          </div>
        ))}

        {(section.mode === "notes" || section.mode === "both") && (
          <div>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>CONTENIDO</div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={"## Título\n\nEscribe aquí..."} style={{ ...inputStyle, minHeight: 200, resize: "vertical", lineHeight: 1.7 }} />
          </div>
        )}

        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags: tag1, tag2, tag3" style={inputStyle} />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave} style={{ background: section.color, border: "none", color: "#fff", borderRadius: 8, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: F.mono, fontWeight: 700 }}>
            Guardar
          </button>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.borderStrong}`, color: C.textMuted, borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontFamily: F.mono, fontSize: 13 }}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main CustomSectionPanel ──────────────────────────────────────────────────

export function CustomSectionPanel({ section, state, setState, query, toast }: CustomSectionPanelProps) {
  const [editing,   setEditing]   = useState<CustomEntry | null | "new">(null);
  const [viewing,   setViewing]   = useState<string | null>(null);

  const entries = useMemo(
    () => state.customEntries.filter((e) => e.sectionId === section.id),
    [state.customEntries, section.id]
  );

  const q = query.trim().toLowerCase();
  const visible = entries.filter((e) =>
    !q || includesQuery([e.title, e.content, e.tags.join(" "), ...Object.values(e.fields)].join(" "), q)
  ).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  const viewingEntry = viewing ? entries.find((e) => e.id === viewing) : null;

  const saveEntry = (entry: CustomEntry) => {
    setState((prev) => {
      const exists = prev.customEntries.some((e) => e.id === entry.id);
      const next   = exists
        ? prev.customEntries.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...prev.customEntries];
      return { ...prev, customEntries: next };
    });
    toast(editing === "new" ? "Entrada creada." : "Entrada actualizada.", "success");
    setEditing(null);
    setViewing(entry.id);
  };

  const deleteEntry = (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    setState((prev) => ({ ...prev, customEntries: prev.customEntries.filter((e) => e.id !== id) }));
    toast("Entrada eliminada.", "info");
    if (viewing === id) setViewing(null);
  };

  const togglePin = (entry: CustomEntry) => {
    setState((prev) => ({
      ...prev,
      customEntries: prev.customEntries.map((e) => e.id === entry.id ? { ...e, pinned: !e.pinned } : e),
    }));
  };

  // ─── Layout: 2 columns, list + detail ─────────────────────────────────────

  const listFields = section.fields.filter((f) => f.showInList);
  const accentField = section.fields.find((f) => f.accentField);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, minHeight: "70vh", border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>

        {/* Left — entry list */}
        <div style={{ background: C.surfaceLow, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}`, background: section.color + "0a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: section.color, fontSize: 10, fontFamily: F.mono, letterSpacing: 2 }}>
                  {section.icon} {section.name.toUpperCase()}
                </div>
                <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono, marginTop: 2 }}>
                  {visible.length} entrada{visible.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button onClick={() => setEditing("new")} style={{
                background: section.color, border: "none", color: "#fff",
                borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontFamily: F.mono, fontSize: 11, fontWeight: 700,
              }}>
                + Nueva
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {visible.length === 0 ? (
              <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12, padding: "24px 12px", textAlign: "center", lineHeight: 1.7 }}>
                {q ? "Sin coincidencias." : `Sin entradas aún.\nHaz clic en "+ Nueva" para comenzar.`}
              </div>
            ) : (
              visible.map((entry) => {
                const isActive = viewing === entry.id;
                const accentVal = accentField ? entry.fields[accentField.id] : null;

                return (
                  <button key={entry.id} onClick={() => setViewing(entry.id)} style={{
                    width: "100%", background: isActive ? section.color + "18" : "transparent",
                    border: `1px solid ${isActive ? section.color + "55" : "transparent"}`,
                    borderRadius: 8, padding: "10px 10px", marginBottom: 3,
                    cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <div style={{ color: isActive ? C.textWhite : C.textDim, fontFamily: F.mono, fontSize: 12, fontWeight: isActive ? 700 : 400, lineHeight: 1.4 }}>
                        {entry.pinned && <span style={{ color: section.color, marginRight: 4 }}>📌</span>}
                        {entry.title}
                      </div>
                      {accentVal && (
                        <span style={{ background: section.color + "22", color: section.color, borderRadius: 4, padding: "1px 6px", fontSize: 9, fontFamily: F.mono, flexShrink: 0, whiteSpace: "nowrap" }}>
                          {accentVal}
                        </span>
                      )}
                    </div>
                    {listFields.filter((f) => !f.accentField).slice(0, 2).map((f) => {
                      const val = entry.fields[f.id];
                      if (!val) return null;
                      return (
                        <div key={f.id} style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 10, marginTop: 2 }}>
                          <span style={{ color: C.textMuted }}>{f.label}: </span>{val.slice(0, 40)}
                        </div>
                      );
                    })}
                    {entry.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        {entry.tags.slice(0, 3).map((t) => (
                          <span key={t} style={{ background: section.color + "18", color: section.color, borderRadius: 3, padding: "1px 5px", fontSize: 9 }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ color: C.textFaint, fontSize: 9, fontFamily: F.mono, marginTop: 4 }}>{entry.updatedAt}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right — detail view */}
        <div style={{ background: C.surface, display: "flex", flexDirection: "column", overflow: "auto" }}>
          {viewingEntry ? (
            <div style={{ padding: 32 }}>
              {/* Detail header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ color: section.color, fontSize: 10, fontFamily: F.mono, letterSpacing: 2 }}>
                  {section.icon} {section.name.toUpperCase()} / ENTRADA
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn label={viewingEntry.pinned ? "📌 Fijado" : "📌 Fijar"} color={section.color} onClick={() => togglePin(viewingEntry)} />
                  <Btn label="✏️ Editar" onClick={() => setEditing(viewingEntry)} />
                  <Btn label="🗑" color={C.red} onClick={() => deleteEntry(viewingEntry.id)} />
                </div>
              </div>

              <h2 style={{ color: C.textWhite, fontSize: 22, fontWeight: 800, fontFamily: F.mono, marginBottom: 12, letterSpacing: -0.5 }}>
                {viewingEntry.title}
              </h2>

              {viewingEntry.tags.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {viewingEntry.tags.map((t) => <Tag key={t} label={t} color={section.color} />)}
                </div>
              )}

              <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono, marginBottom: 24 }}>
                Creado: {viewingEntry.createdAt} · Actualizado: {viewingEntry.updatedAt}
              </div>

              {/* Field values */}
              {section.fields.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 28 }}>
                  {section.fields.map((field) => {
                    const val = viewingEntry.fields[field.id];
                    return (
                      <div key={field.id} style={{ background: C.surfaceLow, borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>{field.label.toUpperCase()}</div>
                        <FieldValue field={field} value={val ?? ""} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Free content */}
              {(section.mode === "notes" || section.mode === "both") && viewingEntry.content && (
                <div style={{ borderTop: `1px solid ${C.surfaceHigh}`, paddingTop: 24 }}>
                  <MarkdownRenderer content={viewingEntry.content} />
                </div>
              )}

              {!viewingEntry.content && section.fields.length === 0 && (
                <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 13 }}>Entrada sin contenido.</div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.3 }}>{section.icon}</div>
              <div style={{ color: C.textDim, fontFamily: F.mono, fontSize: 16, marginBottom: 8 }}>{section.name}</div>
              <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12, marginBottom: 28, lineHeight: 1.7 }}>
                {section.description || "Selecciona una entrada o crea una nueva."}
              </div>
              <button onClick={() => setEditing("new")} style={{
                background: section.color, border: "none", color: "#fff",
                borderRadius: 8, padding: "10px 24px", cursor: "pointer",
                fontSize: 13, fontFamily: F.mono, fontWeight: 700,
              }}>
                + Primera entrada
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EntryEditor
          section={section}
          initial={editing === "new" ? undefined : editing}
          onSave={saveEntry}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
