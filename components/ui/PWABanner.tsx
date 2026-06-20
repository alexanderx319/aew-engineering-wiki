"use client";

import { C, F } from "../../lib/tokens";

interface PWABannerProps {
  canInstall: boolean;
  isOnline:   boolean;
  onInstall:  () => void;
}

export function PWABanner({ canInstall, isOnline, onInstall }: PWABannerProps) {
  // Offline banner — always show when offline
  if (!isOnline) {
    return (
      <div style={{
        position:       "fixed",
        bottom:         80,
        left:           "50%",
        transform:      "translateX(-50%)",
        background:     C.yellow + "ee",
        border:         `1px solid ${C.yellow}`,
        borderRadius:   10,
        padding:        "10px 20px",
        display:        "flex",
        alignItems:     "center",
        gap:            10,
        zIndex:         8000,
        fontFamily:     F.mono,
        fontSize:       12,
        color:          "#000",
        backdropFilter: "blur(8px)",
        boxShadow:      "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <span>⚡</span>
        <span>Sin conexión — trabajando en modo offline</span>
      </div>
    );
  }

  // Install prompt — show when browser offers it
  if (canInstall) {
    return (
      <div style={{
        position:       "fixed",
        bottom:         24,
        left:           "50%",
        transform:      "translateX(-50%)",
        background:     C.surface,
        border:         `1px solid ${C.primary}55`,
        borderRadius:   14,
        padding:        "14px 20px",
        display:        "flex",
        alignItems:     "center",
        gap:            14,
        zIndex:         8000,
        fontFamily:     F.mono,
        boxShadow:      `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${C.primary}22`,
        backdropFilter: "blur(12px)",
        minWidth:       320,
      }}>
        <div style={{
          width:          40, height: 40, borderRadius: 10,
          background:     `linear-gradient(135deg, ${C.primary}, #3ecfcf)`,
          display:        "flex", alignItems: "center", justifyContent: "center",
          fontSize:       20, fontWeight: 900, color: "#fff", flexShrink: 0,
        }}>A</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.textWhite, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
            Instalar AEW
          </div>
          <div style={{ color: C.textMuted, fontSize: 11 }}>
            Accede sin internet desde cualquier dispositivo
          </div>
        </div>
        <button
          onClick={onInstall}
          style={{
            background:   C.primary,
            border:       "none",
            color:        "#fff",
            borderRadius: 8,
            padding:      "8px 16px",
            cursor:       "pointer",
            fontFamily:   F.mono,
            fontSize:     12,
            fontWeight:   700,
            flexShrink:   0,
            boxShadow:    `0 4px 12px ${C.primary}55`,
          }}
        >
          Instalar
        </button>
      </div>
    );
  }

  return null;
}
