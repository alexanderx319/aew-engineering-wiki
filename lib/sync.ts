/**
 * AEW Sync Layer
 * Sincroniza AEWState con Supabase.
 * Estrategia: localStorage como cache local, Supabase como fuente de verdad.
 */

import { supabase } from "./supabase";
import { normalizeState } from "./storage";
import type { AEWState } from "./types";

// ─── Pull: Supabase → local ───────────────────────────────────────────────────
export async function pullState(userId: string): Promise<AEWState | null> {
  const { data, error } = await supabase
    .from("aew_state")
    .select("state")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return normalizeState(data.state);
}

// ─── Push: local → Supabase ───────────────────────────────────────────────────
// Returns the updated_at timestamp it wrote on success (null on failure), so
// the caller can record it and ignore the Realtime echo of its own write.
export async function pushState(userId: string, state: AEWState): Promise<string | null> {
  const updatedAt = new Date().toISOString();
  const { error } = await supabase
    .from("aew_state")
    .upsert(
      { user_id: userId, state, updated_at: updatedAt },
      { onConflict: "user_id" }
    );

  return error ? null : updatedAt;
}

// ─── Emergency push on tab hide/unload ────────────────────────────────────────
// A normal supabase-js call is an in-flight fetch tied to the page's lifetime:
// if the tab is refreshed or closed while it's pending, the browser can abort
// it. `fetch(..., { keepalive: true })` is specifically designed to survive
// that — the browser guarantees the request is sent even after the page is
// gone (subject to a small body-size cap, which our state payload is well
// under). This is what flushPendingPush() in app/page.tsx calls on
// visibilitychange/pagehide to close the "changed-but-not-yet-pushed" window
// that a debounce alone can never fully cover.
export function pushStateBeacon(
  accessToken: string,
  userId: string,
  state: AEWState
): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const updatedAt = new Date().toISOString();
  try {
    fetch(`${url}/rest/v1/aew_state?on_conflict=user_id`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${accessToken}`,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id: userId,
        state,
        updated_at: updatedAt,
      }),
    }).catch(() => {
      // Best-effort: nothing else to do if even keepalive fails (e.g. body
      // too large or browser unsupported) — localStorage still has the data
      // and the next normal pushState() on the next session will catch up.
    });
  } catch {
    // Synchronous throw (e.g. fetch unavailable) — same best-effort fallback.
  }
  return updatedAt;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}
