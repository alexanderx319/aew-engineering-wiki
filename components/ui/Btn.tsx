import { C, F } from "../../lib/tokens";

interface BtnProps {
  label:   string;
  color?:  string;
  onClick: () => void;
  title?:  string;
}

export function Btn({ label, color = C.primary, onClick, title }: BtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background:  color + "22",
        border:      `1px solid ${color}44`,
        color,
        borderRadius: 6,
        padding:     "4px 12px",
        cursor:      "pointer",
        fontSize:    12,
        fontFamily:  F.mono,
        transition:  "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
