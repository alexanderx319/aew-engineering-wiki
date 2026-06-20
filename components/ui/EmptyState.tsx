import { C, F } from "../../lib/tokens";

interface EmptyStateProps {
  icon:         string;
  title:        string;
  description:  string;
  actionLabel?: string;
  onAction?:    () => void;
  color?:       string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, color = C.primary }: EmptyStateProps) {
  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "80px 40px",
      textAlign:      "center",
    }}>
      <div style={{
        width:          80,
        height:         80,
        borderRadius:   "50%",
        background:     color + "12",
        border:         `1px solid ${color}22`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       36,
        marginBottom:   20,
        boxShadow:      `0 0 40px ${color}18`,
      }}>
        {icon}
      </div>
      <div style={{ color: C.textWhite, fontFamily: F.mono, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12, lineHeight: 1.8, marginBottom: 24, maxWidth: 280 }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{
          background:   color,
          border:       "none",
          color:        "#fff",
          borderRadius: 8,
          padding:      "10px 24px",
          cursor:       "pointer",
          fontFamily:   F.mono,
          fontSize:     13,
          fontWeight:   700,
          boxShadow:    `0 4px 16px ${color}44`,
        }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
