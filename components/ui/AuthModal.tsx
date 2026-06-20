"use client";

import { useState } from "react";
import { C, F } from "../../lib/tokens";
import { signInWithEmail, signUpWithEmail, resetPassword } from "../../lib/sync";
import { inputStyle } from "./inputStyle";

type AuthMode = "login" | "register" | "reset";

interface AuthModalProps {
  onClose:   () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode,     setMode]     = useState<AuthMode>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [message,  setMessage]  = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) setError(error.message);
        else setMessage("Revisa tu email para restablecer la contraseña.");
        setLoading(false);
        return;
      }

      const fn = mode === "login" ? signInWithEmail : signUpWithEmail;
      const { error } = await fn(email, password);

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos."
            : error.message === "User already registered"
            ? "Este email ya tiene una cuenta. Inicia sesión."
            : error.message
        );
      } else {
        if (mode === "register") {
          setMessage("Cuenta creada. Revisa tu email para confirmar.");
        } else {
          onSuccess();
          onClose();
        }
      }
    } catch {
      setError("Error de conexión. Verifica tu internet.");
    }

    setLoading(false);
  };

  const TITLES: Record<AuthMode, string> = {
    login:    "Iniciar sesión",
    register: "Crear cuenta",
    reset:    "Restablecer contraseña",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position:       "fixed", inset: 0, zIndex: 4000,
        background:     "rgba(0,0,0,0.8)",
        backdropFilter: "blur(6px)",
        display:        "flex", alignItems: "center", justifyContent: "center",
        padding:        20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        "100%", maxWidth: 420,
          background:   C.surface,
          border:       `1px solid ${C.borderStrong}`,
          borderRadius: 16,
          padding:      32,
          boxShadow:    "0 32px 80px rgba(0,0,0,0.7)",
          animation:    "aew-modal-in 0.15s ease-out",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.primary}, ${C.teal})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: F.mono,
          }}>A</div>
          <div>
            <div style={{ color: C.textWhite, fontFamily: F.mono, fontSize: 14, fontWeight: 800 }}>AEW</div>
            <div style={{ color: C.textMuted, fontFamily: F.mono, fontSize: 10, letterSpacing: 2 }}>ENGINEERING WIKI</div>
          </div>
        </div>

        <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, letterSpacing: 2, marginBottom: 6 }}>
          ACCESO
        </div>
        <h2 style={{ color: C.textWhite, fontFamily: F.mono, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
          {TITLES[mode]}
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, marginBottom: 6 }}>EMAIL</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={inputStyle}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {mode !== "reset" && (
            <div>
              <div style={{ color: C.textMuted, fontSize: 10, fontFamily: F.mono, marginBottom: 6 }}>CONTRASEÑA</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          )}

          {error && (
            <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "10px 14px", color: C.red, fontFamily: F.mono, fontSize: 12 }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: C.teal + "18", border: `1px solid ${C.teal}44`, borderRadius: 8, padding: "10px 14px", color: C.teal, fontFamily: F.mono, fontSize: 12 }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background:   loading ? C.surfaceHigh : C.primary,
              border:       "none", color: "#fff", borderRadius: 8,
              padding:      "12px", cursor: loading ? "not-allowed" : "pointer",
              fontFamily:   F.mono, fontSize: 13, fontWeight: 700,
              boxShadow:    loading ? "none" : `0 4px 16px ${C.primary}44`,
              transition:   "all 0.15s",
            }}
          >
            {loading ? "Cargando..." : TITLES[mode]}
          </button>
        </div>

        {/* Mode switchers */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("register"); setError(""); }} style={{ background: "transparent", border: "none", color: C.primary, cursor: "pointer", fontFamily: F.mono, fontSize: 12, textAlign: "left" }}>
                ¿No tienes cuenta? Crear una →
              </button>
              <button onClick={() => { setMode("reset"); setError(""); }} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontFamily: F.mono, fontSize: 11, textAlign: "left" }}>
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}
          {mode === "register" && (
            <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "transparent", border: "none", color: C.primary, cursor: "pointer", fontFamily: F.mono, fontSize: 12, textAlign: "left" }}>
              ¿Ya tienes cuenta? Iniciar sesión →
            </button>
          )}
          {mode === "reset" && (
            <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "transparent", border: "none", color: C.primary, cursor: "pointer", fontFamily: F.mono, fontSize: 12, textAlign: "left" }}>
              ← Volver al login
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontFamily: F.mono, fontSize: 12 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
