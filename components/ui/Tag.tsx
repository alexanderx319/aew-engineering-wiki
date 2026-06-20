import { C, F } from "../../lib/tokens";

interface TagProps {
  label: string;
  color?: string;
}

export function Tag({ label, color = C.primary }: TagProps) {
  return (
    <span
      style={{
        background:  color + "22",
        color,
        border:      `1px solid ${color}44`,
        borderRadius: 4,
        padding:     "2px 8px",
        fontSize:    10,
        fontFamily:  F.mono,
        display:     "inline-flex",
        alignItems:  "center",
        gap:         6,
        whiteSpace:  "nowrap",
      }}
    >
      {label}
    </span>
  );
}
