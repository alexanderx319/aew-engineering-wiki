"use client";

import { C, F } from "../../lib/tokens";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  title:    string;
  message:  string;
  danger?:  boolean;
  onConfirm: () => void;
  onCancel:  () => void;
}

export function ConfirmModal({ title, message, danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  const accentColor = danger ? C.red : C.primary;

  return (
    <Modal title={title} subtitle="CONFIRMAR ACCIÓN" onClose={onCancel} maxWidth={440}>
      <p style={{ color: C.textBody, fontFamily: F.mono, fontSize: 13, lineHeight: 1.7, margin: "0 0 24px" }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onConfirm}
          style={{
            background:   accentColor,
            border:       "none",
            color:        "#fff",
            borderRadius: 8,
            padding:      "10px 22px",
            cursor:       "pointer",
            fontSize:     13,
            fontFamily:   F.mono,
            fontWeight:   700,
          }}
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          style={{
            background:   "transparent",
            border:       `1px solid ${C.borderStrong}`,
            color:        C.textMuted,
            borderRadius: 8,
            padding:      "10px 20px",
            cursor:       "pointer",
            fontSize:     13,
            fontFamily:   F.mono,
          }}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
