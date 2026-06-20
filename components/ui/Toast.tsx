"use client";

import { useState, useCallback, useRef } from "react";
import { C, F } from "../../lib/tokens";

export type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id:      number;
  message: string;
  kind:    ToastKind;
}

interface UseToastReturn {
  toasts:  ToastItem[];
  toast:   (message: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

// ─── Toast renderer ────────────────────────────────────────────────────────

const KIND_COLOR: Record<ToastKind, string> = {
  success: C.teal,
  error:   C.red,
  info:    C.primary,
};

interface ToastRendererProps {
  toasts:  ToastItem[];
  dismiss: (id: number) => void;
}

export function ToastRenderer({ toasts, dismiss }: ToastRendererProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position:      "fixed",
        bottom:        24,
        right:         24,
        zIndex:        9999,
        display:       "flex",
        flexDirection: "column",
        gap:           10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const color = KIND_COLOR[t.kind];
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              background:   C.surface,
              border:       `1px solid ${color}55`,
              borderLeft:   `3px solid ${color}`,
              borderRadius: 10,
              padding:      "12px 18px",
              color:        C.textBody,
              fontFamily:   F.mono,
              fontSize:     13,
              boxShadow:    "0 8px 32px rgba(0,0,0,0.5)",
              pointerEvents:"all",
              cursor:       "pointer",
              minWidth:     260,
              maxWidth:     380,
              lineHeight:   1.5,
            }}
          >
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
