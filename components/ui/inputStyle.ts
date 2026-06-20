import type React from "react";
import { C, F } from "../../lib/tokens";

export const inputStyle: React.CSSProperties = {
  width:       "100%",
  background:  C.surfaceLow,
  border:      `1px solid #2a2a35`,
  borderRadius: 8,
  padding:     "10px 14px",
  color:       C.textWhite,
  fontFamily:  F.mono,
  outline:     "none",
  boxSizing:   "border-box",
  fontSize:    13,
};
