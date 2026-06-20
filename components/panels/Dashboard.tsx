import { C, F } from "../../lib/tokens";
import { includesQuery } from "../../lib/utils";
import { Tag } from "../ui/Tag";
import type { AEWState, SectionId } from "../../lib/types";

interface DashboardProps {
  setActive: (id: SectionId) => void;
  state:     AEWState;
  query:     string;
}

interface StatDef {
  label:    string;
  value:    number;
  section:  SectionId;
  color:    string;
  icon:     string;
  sublabel: string;
}

export function Dashboard({ setActive, state, query }: DashboardProps) {
  const q = query.trim().toLowerCase();

  const stats: StatDef[] = [
    {
      label:    "Artículos",
      value:    state.articles.length,
      section:  "wiki",
      color:    C.primary,
      icon:     "📝",
      sublabel: `en ${state.categories.length} categorías`,
    },
    {
      label:    "Bugs resueltos",
      value:    state.bugs.filter((b) => b.status === "Resuelto").length,
      section:  "bugs",
      color:    C.teal,
      icon:     "✅",
      sublabel: `de ${state.bugs.length} total`,
    },
    {
      label:    "Bugs pendientes",
      value:    state.bugs.filter((b) => b.status === "Pendiente").length,
      section:  "bugs",
      color:    C.red,
      icon:     "🐛",
      sublabel: "requieren atención",
    },
    {
      label:    "Experimentos",
      value:    state.experiments.filter((e) => e.status === "Completado").length,
      section:  "experiments",
      color:    C.yellow,
      icon:     "🧪",
      sublabel: `de ${state.experiments.length} total`,
    },
    {
      label:    "Snippets",
      value:    state.snippets.length,
      section:  "code",
      color:    C.purple,
      icon:     "{ }",
      sublabel: "de código guardados",
    },
  ];

  const recentArticles = state.articles
    .filter((a) => !q || includesQuery([a.title, a.tags.join(" ")].join(" "), q))
    .slice(0, 4);

  const recentBugs = state.bugs
    .filter((b) => !q || includesQuery([b.title, b.project, b.status].join(" "), q))
    .slice(0, 4);

  const recentExperiments = state.experiments
    .filter((e) => !q || includesQuery([e.title, e.summary, e.status].join(" "), q))
    .slice(0, 3);

  const recentSnippets = state.snippets
    .filter((s) => !q || includesQuery([s.title, s.language, s.description].join(" "), q))
    .slice(0, 3);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 3, marginBottom: 12 }}>
              SISTEMA PERSONAL DE CONOCIMIENTO
            </div>
            <h1 style={{
              color:        C.textWhite,
              fontSize:     36,
              fontWeight:   900,
              margin:       0,
              fontFamily:   F.mono,
              letterSpacing: -1.5,
              lineHeight:   1.1,
              background:   `linear-gradient(135deg, #fff 0%, ${C.primary} 60%, ${C.teal} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Alexander<br />Engineering Wiki
            </h1>
            <p style={{ color: C.textMuted, marginTop: 16, fontSize: 13, fontFamily: F.mono, letterSpacing: 0.5 }}>
              "No guarda información. Conserva experiencia."
            </p>
          </div>
          <div style={{
            background:   `linear-gradient(135deg, ${C.primary}22, ${C.teal}11)`,
            border:       `1px solid ${C.primary}33`,
            borderRadius: 16,
            padding:      "20px 28px",
            textAlign:    "center",
            minWidth:     120,
          }}>
            <div style={{ color: C.primary, fontSize: 32, fontWeight: 900, fontFamily: F.mono }}>
              {state.articles.length + state.bugs.length + state.experiments.length + state.snippets.length + state.customEntries.length}
            </div>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 1, marginTop: 4 }}>
              ENTRADAS TOTALES
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 36 }}>
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setActive(s.section)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = s.color + "88";
              e.currentTarget.style.transform   = "translateY(-2px)";
              e.currentTarget.style.boxShadow   = `0 8px 24px ${s.color}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = s.color + "33";
              e.currentTarget.style.transform   = "translateY(0)";
              e.currentTarget.style.boxShadow   = "none";
            }}
            style={{
              background:   C.surface,
              border:       `1px solid ${s.color}33`,
              borderRadius: 12,
              padding:      "18px 16px",
              cursor:       "pointer",
              textAlign:    "left",
              transition:   "all 0.18s ease",
              position:     "relative",
              overflow:     "hidden",
            }}
          >
            {/* Accent line top */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ color: s.color, fontSize: 30, fontWeight: 900, fontFamily: F.mono, lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: C.textWhite, fontSize: 12, marginTop: 6, fontWeight: 600 }}>{s.label}</div>
            <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono, marginTop: 3 }}>{s.sublabel}</div>
          </button>
        ))}
      </div>

      {/* ── Custom sections quick stats ───────────────────────────────── */}
      {state.customSections.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, marginBottom: 12 }}>
            SECCIONES PERSONALIZADAS
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {state.customSections.map((s) => {
              const count = state.customEntries.filter((e) => e.sectionId === s.id).length;
              return (
                <button key={s.id} onClick={() => setActive(s.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = s.color + "12"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = s.color + "33"; e.currentTarget.style.background = C.surface; }}
                  style={{
                    background: C.surface, border: `1px solid ${s.color}33`, borderRadius: 10,
                    padding: "14px 18px", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    minWidth: 130,
                  }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ color: s.color, fontSize: 22, fontWeight: 900, fontFamily: F.mono }}>{count}</div>
                  <div style={{ color: C.textWhite, fontSize: 12, marginTop: 4, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono, marginTop: 2 }}>→ ir a sección</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pulso del proyecto (sections activity bar chart) ───────────── */}
      {(() => {
        const sectionStats: { label: string; icon: string; color: string; id: SectionId; count: number }[] = [
          { label: "Wiki",         icon: "📖",  color: C.primary, id: "wiki",        count: state.articles.length },
          { label: "Bug Journal",  icon: "🐛",  color: C.red,     id: "bugs",        count: state.bugs.length },
          { label: "Experimentos", icon: "🧪",  color: C.yellow,  id: "experiments", count: state.experiments.length },
          { label: "Código",       icon: "{ }", color: C.purple,  id: "code",        count: state.snippets.length },
          ...state.customSections.map((s) => ({
            label: s.name, icon: s.icon, color: s.color, id: s.id,
            count: state.customEntries.filter((e) => e.sectionId === s.id).length,
          })),
        ];
        const maxCount = Math.max(1, ...sectionStats.map((s) => s.count));

        return (
          <div style={{ marginBottom: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 22px" }}>
            <div style={{ color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, marginBottom: 16 }}>
              PULSO DEL PROYECTO
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {sectionStats.map((s) => (
                <button key={s.id} onClick={() => setActive(s.id)} style={{
                  display: "grid", gridTemplateColumns: "140px 1fr 36px", gap: 12, alignItems: "center",
                  background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", textAlign: "left",
                }}>
                  <div style={{ color: C.textDim, fontSize: 12, fontFamily: F.mono, display: "flex", alignItems: "center", gap: 6, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </div>
                  <div style={{ height: 8, background: C.surfaceHigh, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      width: `${Math.max(3, (s.count / maxCount) * 100)}%`,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <div style={{ color: s.color, fontSize: 12, fontFamily: F.mono, fontWeight: 700, textAlign: "right" }}>{s.count}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Actividad reciente (unified timeline across everything) ─────── */}
      {(() => {
        type Activity = { id: string; title: string; date: string; icon: string; color: string; sectionId: SectionId; sectionLabel: string };
        const parse = (d: string) => { const t = Date.parse(d); return isNaN(t) ? 0 : t; };

        const activity: Activity[] = [
          ...state.articles.map((a) => ({ id: a.id, title: a.title, date: a.updatedAt, icon: "📝", color: C.primary, sectionId: "wiki" as SectionId, sectionLabel: "Wiki" })),
          ...state.bugs.map((b) => ({ id: b.id, title: b.title, date: b.date, icon: "🐛", color: C.red, sectionId: "bugs" as SectionId, sectionLabel: "Bug Journal" })),
          ...state.experiments.map((e) => ({ id: e.id, title: e.title, date: e.updatedAt, icon: "🧪", color: C.yellow, sectionId: "experiments" as SectionId, sectionLabel: "Experimentos" })),
          ...state.snippets.map((s) => ({ id: s.id, title: s.title, date: s.updatedAt, icon: "{ }", color: C.purple, sectionId: "code" as SectionId, sectionLabel: "Código" })),
          ...state.customEntries.map((e) => {
            const sec = state.customSections.find((s) => s.id === e.sectionId);
            return { id: e.id, title: e.title, date: e.updatedAt, icon: sec?.icon ?? "📂", color: sec?.color ?? C.primary, sectionId: e.sectionId, sectionLabel: sec?.name ?? "Sección" };
          }),
        ]
          .filter((a) => !q || includesQuery(a.title + " " + a.sectionLabel, q))
          .sort((a, b) => parse(b.date) - parse(a.date))
          .slice(0, 8);

        if (activity.length === 0) return null;

        return (
          <div style={{ marginBottom: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, color: C.teal, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, fontWeight: 700, background: C.teal + "08" }}>
              ACTIVIDAD RECIENTE
            </div>
            <div>
              {activity.map((a) => (
                <button key={`${a.sectionId}-${a.id}`} onClick={() => setActive(a.sectionId)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 20px", background: "transparent", border: "none",
                  borderBottom: `1px solid ${C.border}11`, cursor: "pointer", textAlign: "left",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHigh}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.textWhite, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                  </div>
                  <Tag label={a.sectionLabel} color={a.color} />
                  <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono, flexShrink: 0, minWidth: 80, textAlign: "right" }}>{a.date}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Recent grids ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <RecentCard title="ARTÍCULOS RECIENTES" accentColor={C.primary} onViewAll={() => setActive("wiki")} empty={recentArticles.length === 0}>
          {recentArticles.map((a) => (
            <RecentRow key={a.id}>
              <div style={{ color: C.textWhite, fontSize: 13, fontWeight: 600 }}>{a.title}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                {a.tags.slice(0, 3).map((t) => <Tag key={t} label={t} />)}
              </div>
            </RecentRow>
          ))}
        </RecentCard>

        <RecentCard title="BUGS RECIENTES" accentColor={C.red} onViewAll={() => setActive("bugs")} empty={recentBugs.length === 0}>
          {recentBugs.map((b) => (
            <RecentRow key={b.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ color: C.textWhite, fontSize: 13, fontWeight: 600 }}>{b.title}</div>
                <Tag label={b.status} color={b.status === "Resuelto" ? C.teal : C.yellow} />
              </div>
              <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, marginTop: 3 }}>{b.project} · {b.date}</div>
            </RecentRow>
          ))}
        </RecentCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <RecentCard title="EXPERIMENTOS RECIENTES" accentColor={C.yellow} onViewAll={() => setActive("experiments")} empty={recentExperiments.length === 0}>
          {recentExperiments.map((e) => (
            <RecentRow key={e.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div style={{ color: C.textWhite, fontSize: 13, fontWeight: 600 }}>{e.title}</div>
                <Tag label={e.status} color={e.status === "Completado" ? C.teal : C.yellow} />
              </div>
              <div style={{ color: C.textMuted, fontSize: 11, fontFamily: F.mono, marginTop: 3 }}>
                {e.summary.slice(0, 60)}{e.summary.length > 60 ? "…" : ""}
              </div>
            </RecentRow>
          ))}
        </RecentCard>

        <RecentCard title="SNIPPETS RECIENTES" accentColor={C.purple} onViewAll={() => setActive("code")} empty={recentSnippets.length === 0}>
          {recentSnippets.map((s) => (
            <RecentRow key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ color: C.textWhite, fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                <Tag label={s.language} color={C.purple} />
              </div>
              <div style={{ color: C.textMuted, fontSize: 11, fontFamily: F.mono, marginTop: 3 }}>
                {s.description.slice(0, 60)}{s.description.length > 60 ? "…" : ""}
              </div>
            </RecentRow>
          ))}
        </RecentCard>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function RecentCard({ title, accentColor, onViewAll, empty, children }: {
  title:       string;
  accentColor: string;
  onViewAll:   () => void;
  empty:       boolean;
  children:    React.ReactNode;
}) {
  return (
    <div style={{
      background:   C.surface,
      border:       `1px solid ${C.border}`,
      borderRadius: 12,
      overflow:     "hidden",
    }}>
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        padding:        "14px 20px",
        borderBottom:   `1px solid ${C.border}`,
        background:     accentColor + "08",
      }}>
        <div style={{ color: accentColor, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, fontWeight: 700 }}>{title}</div>
        <button
          onClick={onViewAll}
          style={{ background: "transparent", border: "none", color: accentColor + "aa", cursor: "pointer", fontSize: 11, fontFamily: F.mono }}
        >
          Ver todos →
        </button>
      </div>
      <div style={{ padding: "8px 0" }}>
        {empty
          ? <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12, padding: "16px 20px" }}>Sin registros aún.</div>
          : children}
      </div>
    </div>
  );
}

function RecentRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}11` }}>
      {children}
    </div>
  );
}
