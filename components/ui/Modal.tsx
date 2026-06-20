"use client";

import { useEffect } from "react";
import type React from "react";
import { C, F } from "../../lib/tokens";

interface ModalProps {
  title:     string;
  subtitle?: string;
  onClose:   () => void;
  children:  React.ReactNode;
  maxWidth?: number;
}

export function Modal({ title, subtitle, onClose, children, maxWidth = 640 }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position:        "fixed",
        inset:           0,
        background:      "rgba(0,0,0,0.72)",
        zIndex:          2000,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         20,
        backdropFilter:  "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        "100%",
          maxWidth,
          background:   C.surface,
          border:       `1px solid ${C.border}`,
          borderRadius: 14,
          padding:      24,
          boxShadow:    "0 24px 80px rgba(0,0,0,0.6)",
          animation:    "aew-modal-in 0.15s ease-out",
        }}
      >
        <div
          style={{
            display:       "flex",
            justifyContent:"space-between",
            alignItems:    "flex-start",
            gap:           16,
            marginBottom:  20,
          }}
        >
          <div>
            {subtitle && (
              <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>
                {subtitle}
              </div>
            )}
            <h3 style={{ color: C.textWhite, fontSize: 20, fontWeight: 800, margin: 0, fontFamily: F.mono }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background:   "transparent",
              border:       `1px solid ${C.borderStrong}`,
              color:        C.textMuted,
              borderRadius: 8,
              width:        36,
              height:       36,
              cursor:       "pointer",
              fontFamily:   F.mono,
              flexShrink:   0,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
