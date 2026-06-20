"use client";

import { useState } from "react";
import { C, F } from "../../lib/tokens";
import { SECTION_TEMPLATES, SECTION_COLORS } from "../../lib/constants";
import { uid, today } from "../../lib/utils";
import { inputStyle } from "./inputStyle";
import { Modal } from "./Modal";
import type { CustomSection, FieldSchema, FieldType, SectionContentMode } from "../../lib/types";

interface SectionWizardProps {
  onClose: () => void;
  onSave:  (section: CustomSection) => void;
  order:   number;
}

type Step = "template" | "configure" | "fields";

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: "text",     label: "Texto",     icon: "Aa" },
  { type: "textarea", label: "Párrafo",   icon: "¶"  },
  { type: "number",   label: "Número",    icon: "#"  },
  { type: "select",   label: "Selección", icon: "▾"  },
  { type: "status",   label: "Estado",    icon: "◉"  },
  { type: "tags",     label: "Tags",      icon: "🏷" },
  { type: "url",      label: "URL",       icon: "🔗" },
  { type: "date",     label: "Fecha",     icon: "📅" },
  { type: "rating",   label: "Rating",    icon: "★"  },
  { type: "code",     label: "Código",    icon: "{}" },
];

const MODE_OPTIONS: { mode: SectionContentMode; label: string; desc: string; icon: string }[] = [
  { mode: "collection", label: "Colección",        icon: "⊞", desc: "Campos estructurados — ideal para libros, hardware, recursos" },
  { mode: "notes",      label: "Notas libres",      icon: "📝", desc: "Markdown libre — ideal para ideas, diario, investigación" },
  { mode: "both",       label: "Mixto",             icon: "⊟", desc: "Campos + contenido libre — el más flexible" },
];

export function SectionWizard({ onClose, onSave, order }: SectionWizardProps) {
  const [step,        setStep]        = useState<Step>("template");
  const [name,        setName]        = useState("");
  const [icon,        setIcon]        = useState("📂");
  const [color,       setColor]       = useState(SECTION_COLORS[0]);
  const [description, setDescription] = useState("");
  const [mode,        setMode]        = useState<SectionContentMode>("both");
  const [fields,      setFields]      = useState<FieldSchema[]>([]);

  const applyTemplate = (tpl: typeof SECTION_TEMPLATES[number]) => {
    setName(tpl.label);
    setIcon(tpl.icon);
    setColor(tpl.color);
    setDescription(tpl.description);
    setMode(tpl.mode);
    setFields(tpl.fields.map((f) => {
      const opts = (f as { options?: readonly string[] }).options;
      return { ...f, options: opts ? [...opts] : undefined };
    }) as FieldSchema[]);
    setStep("configure");
  };

  const addField = () => {
    setFields((prev) => [...prev, {
      id:          uid("fld"),
      label:       "Nuevo campo",
      type:        "text",
      placeholder: "",
      showInList:  false,
      required:    false,
      accentField: false,
    }]);
  };

  const updateField = (index: number, patch: Partial<FieldSchema>) => {
    setFields((prev) => prev.map((f, i) => i === index ? { ...f, ...patch } : f));
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const next = [...fields];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setFields(next);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id:          uid("sec"),
      name:        name.trim(),
      icon:        icon.trim() || "📂",
      color,
      description: description.trim(),
      mode,
      fields,
      order,
      createdAt:   today(),
    });
  };

  const btn = (label: string, onClick: () => void, accent = false) => (
    <button onClick={onClick} style={{
      background:   accent ? color : "transparent",
      border:       accent ? "none" : `1px solid ${C.borderStrong}`,
      color:        accent ? "#fff" : C.textMuted,
      borderRadius: 8, padding: "9px 20px", cursor: "pointer",
      fontFamily: F.mono, fontSize: 13, fontWeight: accent ? 700 : 400,
    }}>{label}</button>
  );

  return (
    <Modal
      title={step === "template" ? "Nueva sección" : step === "configure" ? `Configurar — ${name || "sin nombre"}` : `Campos — ${name}`}
      subtitle={`PASO ${step === "template" ? "1" : step === "configure" ? "2" : "3"} DE 3`}
      onClose={onClose}
      maxWidth={700}
    >
      {/* ── Step 1: Template picker ── */}
      {step === "template" && (
        <div>
          <p style={{ color: C.textDim, fontFamily: F.mono, fontSize: 12, marginBottom: 20 }}>
            Elige una plantilla para empezar rápido, o crea una desde cero.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {SECTION_TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => applyTemplate(tpl)} style={{
                background:   C.surfaceLow,
                border:       `1px solid ${C.border}`,
                borderRadius: 10,
                padding:      "14px 12px",
                cursor:       "pointer",
                textAlign:    "left",
                transition:   "all 0.15s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.background = tpl.color + "12"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.background = C.surfaceLow; }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{tpl.icon}</div>
                <div style={{ color: C.textWhite, fontFamily: F.mono, fontSize: 13, fontWeight: 700 }}>{tpl.label}</div>
                <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>
                  {tpl.description || "Sección en blanco personalizable"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Basic config ── */}
      {step === "configure" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🚀" style={{ ...inputStyle, textAlign: "center", fontSize: 22 }} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la sección" style={{ ...inputStyle, fontSize: 15 }} autoFocus />
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción opcional..." style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} />

          {/* Color picker */}
          <div>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 8 }}>COLOR DE ACENTO</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SECTION_COLORS.map((c, ci) => (
                <button key={ci} onClick={() => setColor(c)} style={{
                  width: 28, height: 28, borderRadius: "50%", background: c, border: color === c ? `3px solid #fff` : `2px solid transparent`, cursor: "pointer", flexShrink: 0,
                }} />
              ))}
            </div>
          </div>

          {/* Content mode */}
          <div>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 8 }}>TIPO DE CONTENIDO</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {MODE_OPTIONS.map((m) => (
                <button key={m.mode} onClick={() => setMode(m.mode)} style={{
                  background:   mode === m.mode ? color + "22" : C.surfaceLow,
                  border:       `1px solid ${mode === m.mode ? color + "88" : C.border}`,
                  borderRadius: 8, padding: "10px 10px", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ color: mode === m.mode ? C.textWhite : C.textDim, fontFamily: F.mono, fontSize: 12, fontWeight: 700 }}>{m.label}</div>
                  <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 10, marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            {btn("← Volver", () => setStep("template"))}
            {mode === "notes"
              ? btn("Crear sección", handleSave, true)
              : btn(`Configurar campos →`, () => setStep("fields"), true)
            }
          </div>
        </div>
      )}

      {/* ── Step 3: Field editor ── */}
      {step === "fields" && (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ color: C.textDim, fontFamily: F.mono, fontSize: 12 }}>
            Define los campos de cada entrada. El título siempre está incluido.
          </p>

          {fields.length === 0 && (
            <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12, padding: "16px", textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: 8 }}>
              Sin campos personalizados — solo título {mode === "both" ? "y contenido libre" : ""}.
            </div>
          )}

          {fields.map((field, i) => (
            <div key={field.id} style={{ background: C.surfaceLow, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  value={field.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                  placeholder="Nombre del campo"
                  style={inputStyle}
                />
                <select value={field.type} onChange={(e) => updateField(i, { type: e.target.value as FieldType })} style={inputStyle}>
                  {FIELD_TYPES.map((ft) => (
                    <option key={ft.type} value={ft.type}>{ft.icon} {ft.label}</option>
                  ))}
                </select>
              </div>

              {field.type === "text" || field.type === "textarea" || field.type === "number" || field.type === "url" ? (
                <input value={field.placeholder ?? ""} onChange={(e) => updateField(i, { placeholder: e.target.value })} placeholder="Placeholder opcional" style={inputStyle} />
              ) : null}

              {(field.type === "select" || field.type === "status") && (
                <input
                  value={field.options?.join(", ") ?? ""}
                  onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Opción 1, Opción 2, Opción 3"
                  style={inputStyle}
                />
              )}

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ display: "flex", gap: 6, alignItems: "center", color: C.textMuted, fontFamily: F.mono, fontSize: 11, cursor: "pointer" }}>
                  <input type="checkbox" checked={field.showInList} onChange={(e) => updateField(i, { showInList: e.target.checked })} />
                  Ver en lista
                </label>
                <label style={{ display: "flex", gap: 6, alignItems: "center", color: C.textMuted, fontFamily: F.mono, fontSize: 11, cursor: "pointer" }}>
                  <input type="checkbox" checked={field.accentField} onChange={(e) => updateField(i, { accentField: e.target.checked })} />
                  Campo destacado
                </label>
                <label style={{ display: "flex", gap: 6, alignItems: "center", color: C.textMuted, fontFamily: F.mono, fontSize: 11, cursor: "pointer" }}>
                  <input type="checkbox" checked={field.required ?? false} onChange={(e) => updateField(i, { required: e.target.checked })} />
                  Requerido
                </label>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button onClick={() => moveField(i, -1)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: F.mono, fontSize: 12 }}>↑</button>
                  <button onClick={() => moveField(i,  1)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: F.mono, fontSize: 12 }}>↓</button>
                  <button onClick={() => removeField(i)} style={{ background: "transparent", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: F.mono, fontSize: 12 }}>✕</button>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addField} style={{
            width: "100%", background: color + "12", border: `1px dashed ${color}44`, color, borderRadius: 8,
            padding: "9px", cursor: "pointer", fontFamily: F.mono, fontSize: 12,
          }}>
            + Agregar campo
          </button>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            {btn("← Volver", () => setStep("configure"))}
            {btn("Crear sección", handleSave, true)}
          </div>
        </div>
      )}
    </Modal>
  );
}
