"use client";

import { C, F } from "../lib/tokens";
import { CORE_NAV } from "../lib/constants";
import type { AEWState, SectionId, NavItem } from "../lib/types";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  active:    SectionId;
  setActive: (id: SectionId) => void;
  state:     AEWState;
  onNewSection: () => void;
  onDeleteSection: (id: string) => void;
  isOnline: boolean;
  isInstalled: boolean;
  user: User | null;
  onAuthClick?: () => void;

}

export function Sidebar({ active, setActive, state, onNewSection, onDeleteSection, isOnline = true, isInstalled = false, user, onAuthClick }: SidebarProps) {
  // Build full nav: core + custom sections
  const customNav: NavItem[] = state.customSections.map((s) => ({
    icon:   s.icon,
    label:  s.name,
    id:     s.id,
    color:  s.color,
    custom: true,
  }));

  return (
    <aside style={{
      width:         220,
      minHeight:     "100vh",
      background:    `linear-gradient(180deg, #0d0d10 0%, #0a0a0c 100%)`,
      borderRight:   `1px solid ${C.border}`,
      display:       "flex",
      flexDirection: "column",
      position:      "fixed",
      top:           0,
      left:          0,
      zIndex:        100,
    }}>
      <style>{`
        .aew-sec-row { position: relative; display: flex; align-items: center; }
        .aew-sec-del {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; color: #555; cursor: pointer;
          font-size: 12px; padding: 4px 6px; border-radius: 4px;
          opacity: 0; transition: opacity 0.15s, color 0.15s, background 0.15s;
        }
        .aew-sec-row:hover .aew-sec-del,
        .aew-sec-del:focus-visible { opacity: 1; }
        .aew-sec-del:hover { color: ${C.red}; background: ${C.red}18; }
      `}</style>
      {/* Logo */}
      <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.teal} 100%)`,
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 900, color: "#fff", fontFamily: F.mono, flexShrink: 0,
            boxShadow: `0 4px 16px ${C.primary}44`,
          }}>A</div>
          <div>
            <div style={{ color: C.textWhite, fontSize: 13, fontWeight: 800, letterSpacing: 1, fontFamily: F.mono }}>AEW</div>
            <div style={{ color: C.textFaint, fontSize: 9, letterSpacing: 2, fontFamily: F.mono }}>ENGINEERING WIKI</div>
          </div>
        </div>
      </div>

      {/* Scrollable nav area */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 8, paddingBottom: 8 }}>
        {/* Core sections */}
        {CORE_NAV.map((item) => (
          <NavButton key={item.id} item={item} active={active} setActive={setActive} />
        ))}

        {/* Custom sections divider */}
        {customNav.length > 0 && (
          <>
            <div style={{ padding: "12px 18px 6px", color: C.textFaint, fontSize: 9, fontFamily: F.mono, letterSpacing: 2 }}>
              SECCIONES
            </div>
            {customNav.map((item) => (
              <div key={item.id} className="aew-sec-row">
                <div style={{ flex: 1 }}>
                  <NavButton item={item} active={active} setActive={setActive} />
                </div>
                {/* Delete button — revealed on row hover via .aew-sec-row:hover */}
                <button
                  className="aew-sec-del"
                  onClick={(e) => { e.stopPropagation(); onDeleteSection(item.id); }}
                  title="Eliminar sección"
                >
                  ✕
                </button>
              </div>
            ))}
          </>
        )}

        {/* New section button */}
        <button onClick={onNewSection} style={{
          width: "calc(100% - 16px)", margin: "8px 8px 0",
          background: C.primary + "12", border: `1px dashed ${C.primary}44`,
          color: C.primary, borderRadius: 8, padding: "8px 12px",
          cursor: "pointer", fontFamily: F.mono, fontSize: 11, textAlign: "left",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>+</span>
          Nueva sección
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `linear-gradient(135deg, #2a2a3a, #1a1a28)`,
            border: `1px solid ${C.border}`, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: C.textMuted, fontSize: 11, fontFamily: F.mono, fontWeight: 700,
          }}>N</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.textDim, fontSize: 11, fontFamily: F.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ? user.email.split("@")[0] : "Alexander"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: user ? "#6c63ff" : isOnline ? "#1dd1a1" : "#ff6b6b", flexShrink: 0 }} />
              <span style={{ color: C.textFaint, fontSize: 9, fontFamily: F.mono }}>
                {user ? "sincronizado" : isOnline ? "local · online" : "offline"}
              </span>
            </div>
          </div>
          {onAuthClick && (
            <button onClick={onAuthClick} title={user ? "Cerrar sesión" : "Iniciar sesión"} style={{
              background: user ? C.red + "18" : C.primary + "18",
              border: `1px solid ${user ? C.red + "44" : C.primary + "44"}`,
              color: user ? C.red : C.primary,
              borderRadius: 6, padding: "4px 8px", cursor: "pointer",
              fontFamily: F.mono, fontSize: 9, flexShrink: 0,
            }}>
              {user ? "salir" : "login"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({ item, active, setActive }: { item: NavItem; active: SectionId; setActive: (id: SectionId) => void }) {
  const isActive = active === item.id;
  return (
    <button
      onClick={() => setActive(item.id)}
      style={{
        width:      "100%",
        background: isActive ? item.color + "18" : "transparent",
        border:     "none",
        borderLeft: isActive ? `3px solid ${item.color}` : "3px solid transparent",
        color:      isActive ? C.textWhite : C.textMuted,
        display:    "flex",
        alignItems: "center",
        gap:        10,
        padding:    "9px 18px",
        cursor:     "pointer",
        fontSize:   12,
        fontFamily: F.mono,
        textAlign:  "left",
        transition: "all 0.12s",
      }}
    >
      <span style={{ fontSize: 13, opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
      {isActive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, flexShrink: 0 }} />}
    </button>
  );
}
