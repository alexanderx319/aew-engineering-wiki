"use client";

/**
 * AEW — Alexander Engineering Wiki v3.0
 * Con sincronización Supabase.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { C, F } from "../lib/tokens";
import { loadState, saveState, normalizeState } from "../lib/storage";
import { buildSearchHits } from "../lib/search";
import { useKeyboard } from "../lib/useKeyboard";
import { supabase } from "../lib/supabase";
import { pullState, pushState, pushStateBeacon, signOut } from "../lib/sync";
import type { AEWState, SectionId, CustomSection } from "../lib/types";
import type { User } from "@supabase/supabase-js";

import { Sidebar }            from "../components/Sidebar";
import { Topbar }             from "../components/Topbar";
import { Dashboard }          from "../components/panels/Dashboard";
import { WikiPanel }          from "../components/panels/WikiPanel";
import { BugJournalPanel }    from "../components/panels/BugJournalPanel";
import { ExperimentsPanel }   from "../components/panels/ExperimentsPanel";
import { CodePanel }          from "../components/panels/CodePanel";
import { CustomSectionPanel } from "../components/panels/CustomSectionPanel";
import { SectionWizard }      from "../components/ui/SectionWizard";
import { CommandPalette }     from "../components/ui/CommandPalette";
import { AuthModal }          from "../components/ui/AuthModal";
import { useToast, ToastRenderer } from "../components/ui/Toast";
import { usePWA }             from "../lib/usePWA";
import { PWABanner }          from "../components/ui/PWABanner";

// ─── Section title map ─────────────────────────────────────────────────────────
const SECTION_TITLES: Record<string, string> = {
  dashboard: "Dashboard", wiki: "Wiki", bugs: "Bug Journal",
  experiments: "Experimentos", code: "Código",
};

// ─── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: #0a0a0c; color: #fff; height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::selection { background: #6c63ff44; color: #fff; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e1e28; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #2e2e3e; }
  textarea, input, select { color-scheme: dark; font-family: monospace; }
  textarea:focus, input:focus, select:focus {
    outline: none !important;
    border-color: #6c63ff88 !important;
    box-shadow: 0 0 0 3px #6c63ff18 !important;
  }
  button:focus-visible { outline: 2px solid #6c63ff; outline-offset: 2px; }
  @keyframes aew-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes aew-fade-in {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Debounce helper ───────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Root component ────────────────────────────────────────────────────────────
export default function AEW() {
  const [mounted,     setMounted]     = useState(false);
  const [state,       setState]       = useState<AEWState>(() => ({
    categories: [], articles: [], bugs: [], experiments: [],
    snippets: [], customSections: [], customEntries: [],
  }));
  const [active,      setActive]      = useState<SectionId>("dashboard");
  const [query,       setQuery]       = useState("");
  const [showWizard,  setShowWizard]  = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showAuth,    setShowAuth]    = useState(false);
  const [user,        setUser]        = useState<User | null>(null);
  const [syncing,     setSyncing]     = useState(false);
  const isSyncingRef   = useRef(false);
  // Tracks the user id whose data is currently being pulled/has been pulled,
  // so redundant SIGNED_IN events (e.g. session restored on refresh) don't
  // trigger a second, racing pullState() for the same user.
  const pulledForUserRef = useRef<string | null>(null);
  // True while a pull is in flight or hasn't happened yet for a logged-in
  // user. Blocks the local-save effect from persisting stale local state
  // (or the push effect from firing) until the remote pull has resolved.
  const hydratingRemoteRef = useRef(false);
  // Always-current refs so the visibilitychange/pagehide flush below can
  // read the latest state/user without depending on a stale closure.
  const stateRef = useRef(state);
  const userRef  = useRef(user);
  stateRef.current = state;
  userRef.current  = user;
  // Current Supabase access token, kept in sync via onAuthStateChange below.
  // Needed because the emergency beacon push uses a raw fetch() (so it can
  // set keepalive: true) instead of the supabase-js client, so it can't pull
  // the token from the SDK's internal session at call time.
  const accessTokenRef = useRef<string | null>(null);
  // True whenever `state` has changed since the last successful pushState().
  // Lets the emergency flush skip firing when there's nothing new to send.
  const dirtyRef = useRef(false);
  // updated_at (ISO string) of the last row WE wrote via pushState/beacon.
  // The Realtime UPDATE event for our own write echoes back to us too —
  // without this guard, applying it would be harmless but wasteful, and
  // more importantly: if a local edit happened in the gap between our
  // pushState() call resolving and the echo arriving, applying the echo
  // would clobber that newer local edit with the older snapshot we just
  // sent. Comparing timestamps lets us ignore echoes of our own writes.
  const lastPushedAtRef = useRef<string | null>(null);
  // True for one render cycle right after we've applied a Realtime update
  // from another device. Stops that incoming state from being immediately
  // re-pushed back to Supabase as if it were a fresh local edit (a no-op
  // round trip, but one that needlessly re-triggers the echo guard above).
  const applyingRemoteRef = useRef(false);

  const { toasts, toast, dismiss } = useToast();
  const { isOnline, canInstall, install, isInstalled } = usePWA();

  // ─── Debounced state for sync (avoid hammering Supabase on every keystroke) ───
  // Kept short (not 2000ms) because anything still debouncing when the user
  // refreshes/closes the tab is lost — see flushPendingPush below for the
  // safety net that covers that exact window.
  const debouncedState = useDebounce(state, 400);

  // ─── Hydration + Auth ─────────────────────────────────────────────────────────
  // Single source of truth for "load remote data for this user, exactly once
  // per session". Both the initial getSession() check and the SIGNED_IN event
  // (which Supabase also fires when it merely *restores* a session from
  // storage on page load, not only on a fresh login) funnel through here.
  // pulledForUserRef deduplicates so only one pull ever runs per user id.
  const hydrateForUser = useCallback(async (userId: string, opts: { notify: boolean }) => {
    if (pulledForUserRef.current === userId) return; // already pulled this session
    pulledForUserRef.current = userId;
    hydratingRemoteRef.current = true;
    try {
      const remote = await pullState(userId);
      if (remote) {
        setState(remote);
        saveState(remote, userId);
        if (opts.notify) toast("Datos sincronizados.", "success");
      }
      // If remote is null (no row yet — e.g. brand-new account), we
      // deliberately keep whatever local state is already loaded instead of
      // wiping it, and let the push effect create the row.
    } finally {
      hydratingRemoteRef.current = false;
    }
  }, [toast]);

  useEffect(() => {
    const init = async () => {
      // Resolve identity FIRST, before touching localStorage or rendering
      // any state. Previously loadState() ran with no userId, reading a
      // single shared key — so on every page load (including right after
      // sign-out) the UI would flash whatever was in that shared slot
      // (guest data, or a previous account's data) before the async
      // getSession()/pullState() calls below could correct it. That flash
      // was also being written back via the saveState effect, occasionally
      // racing the real pull and leaving the wrong snapshot cached. Now we
      // know the identity before the very first setState, so there is
      // nothing to flash and nothing to mis-save.
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      setState(loadState(userId));
      setMounted(true);

      // Check URL params
      const params  = new URLSearchParams(window.location.search);
      const section = params.get("section") as SectionId | null;
      if (section) { setActive(section); window.history.replaceState({}, "", "/"); }

      if (session?.user) {
        setUser(session.user);
        userRef.current = session.user;
        accessTokenRef.current = session.access_token;
        await hydrateForUser(session.user.id, { notify: false });
      }
    };

    init();

    // Listen for auth changes. Note: Supabase fires SIGNED_IN both for a
    // genuine new login AND when it restores a persisted session on page
    // load — hydrateForUser's dedup guard is what makes this safe to call
    // unconditionally here without re-racing the init() pull above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // A real, fresh sign-in (not the page-load session restore, which
        // is handled by init() above) — pulledForUserRef being unset for
        // this id is what distinguishes the two. Switch local storage to
        // this user's own namespaced slot before pulling, so we never
        // render the previous identity's cached state in between.
        if (pulledForUserRef.current !== session.user.id) {
          setState(loadState(session.user.id));
        }
        setUser(session.user);
        userRef.current = session.user;
        accessTokenRef.current = session.access_token;
        await hydrateForUser(session.user.id, { notify: true });
      }
      if (event === "TOKEN_REFRESHED" && session) {
        // Keep the beacon's token current so a flush that fires after a
        // long idle period (post token-refresh) still authenticates.
        accessTokenRef.current = session.access_token;
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        userRef.current = null;
        accessTokenRef.current = null;
        pulledForUserRef.current = null;
        // Switch back to the guest slot instead of leaving the just-logged-
        // out user's data on screen (and about to be re-saved into the
        // shared/guest key by the persistence effect below).
        setState(loadState(null));
        toast("Sesión cerrada.", "info");
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrateForUser, toast]);

  // ─── Realtime: pick up changes pushed from other devices ─────────────────────
  // This is the piece that was missing. pushState()/pushStateBeacon() write
  // to aew_state, but nothing was ever listening for OTHER sessions' writes
  // to that same row — so a second device only ever saw new data at the
  // moment it first mounted (hydrateForUser, which runs once per session).
  // After that, it was frozen until a manual refresh re-ran hydration. That
  // is the entire "UI needs Refresh" / "phone → laptop doesn't sync" bug.
  // Subscribing to postgres_changes on this user's row closes that gap: any
  // device's write now reaches every other open session within ~1s.
  useEffect(() => {
    if (!mounted || !user) return;

    const channel = supabase
      .channel(`aew_state:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aew_state",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as { state: unknown; updated_at: string };
          if (!row || !row.state) return;

          // Ignore the echo of our own write — see lastPushedAtRef comment.
          if (lastPushedAtRef.current && row.updated_at <= lastPushedAtRef.current) {
            return;
          }
          // Ignore events that arrive while we're mid-pull on initial
          // hydration — that pull will already apply the latest snapshot.
          if (hydratingRemoteRef.current) return;

          const remote = normalizeState(row.state);
          applyingRemoteRef.current = true;
          setState(remote);
          saveState(remote, user.id);
          // Treat this snapshot as "already in sync" so the debounced push
          // effect below doesn't immediately re-upload it.
          lastPushedAtRef.current = row.updated_at;
          dirtyRef.current = false;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mounted, user]);

  // ─── Persistence — local ──────────────────────────────────────────────────────
  useEffect(() => {
    // Skip while a remote pull is in flight: writing here would persist
    // stale (pre-pull) local state to localStorage and could clobber the
    // incoming remote state's write in saveState() right after.
    if (mounted && !hydratingRemoteRef.current) saveState(state, userRef.current?.id ?? null);
    // Any state change while logged in means there's something the server
    // doesn't have yet — flag it so the emergency flush knows to fire if the
    // tab is hidden/closed before the debounced push below catches up.
    // Skip this for state changes that came FROM Realtime (applyingRemoteRef)
    // — that snapshot is already on the server, there's nothing new to send.
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    if (mounted && userRef.current && !hydratingRemoteRef.current) dirtyRef.current = true;
  }, [state, mounted]);

  // ─── Sync to Supabase (debounced, only when logged in) ───────────────────────
  useEffect(() => {
    if (!mounted || !user || isSyncingRef.current || hydratingRemoteRef.current) return;
    // Nothing locally new to send (e.g. this debounce settled on a snapshot
    // that just arrived via Realtime from another device) — skip the upload.
    if (!dirtyRef.current) return;
    isSyncingRef.current = true;
    pushState(user.id, debouncedState).then((updatedAt) => {
      isSyncingRef.current = false;
      if (updatedAt) {
        dirtyRef.current = false;
        lastPushedAtRef.current = updatedAt;
      } else {
        console.warn("Sync failed — will retry on next change");
      }
    });
  }, [debouncedState, user, mounted]);

  // ─── Emergency flush on tab hide / refresh / close ────────────────────────────
  // Closes the window the debounce above can't: if the user refreshes or
  // switches tabs while a change is still debouncing (or while pushState()
  // is mid-flight), that update would otherwise be lost, and the next
  // pullState() on reload would overwrite it with the server's older copy —
  // exactly the "disappears, then reappears two refreshes later" symptom.
  // 'visibilitychange' fires reliably on both refresh and tab-close across
  // desktop and mobile browsers (unlike 'beforeunload', which mobile Safari
  // and Chrome often skip), so it's the primary hook; 'pagehide' is a backup
  // for browsers that don't fire visibilitychange before teardown.
  useEffect(() => {
    const flushPendingPush = () => {
      const u = userRef.current;
      const token = accessTokenRef.current;
      if (!u || !token || !dirtyRef.current) return;
      lastPushedAtRef.current = pushStateBeacon(token, u.id, stateRef.current);
      dirtyRef.current = false;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPendingPush();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flushPendingPush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flushPendingPush);
    };
  }, []);

  // ─── Dynamic title ────────────────────────────────────────────────────────────
  useEffect(() => {
    const custom    = state.customSections.find((s) => s.id === active);
    const name      = custom?.name ?? SECTION_TITLES[active] ?? active;
    document.title  = `${name} · AEW`;
  }, [active, state.customSections]);

  // ─── Search ───────────────────────────────────────────────────────────────────
  const hits = useMemo(() => buildSearchHits(state, query), [state, query]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────────
  useKeyboard({
    onSearch:     () => setShowPalette(true),
    onNewSection: () => setShowWizard(true),
    onEscape:     () => { setShowPalette(false); setShowWizard(false); setShowAuth(false); setQuery(""); },
  });

  // ─── Handle sign out ──────────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    // All cleanup (clearing user, switching state back to the guest storage
    // slot, etc.) happens in the SIGNED_OUT branch of onAuthStateChange
    // above — that's the single source of truth, so we don't duplicate it
    // here and risk the two racing each other.
    await signOut();
  }, []);

  // ─── Custom sections ───────────────────────────────────────────────────────────
  const handleCreateSection = useCallback((section: CustomSection) => {
    setState((prev) => ({
      ...prev,
      customSections: [...prev.customSections, section].sort((a, b) => a.order - b.order),
    }));
    setShowWizard(false);
    setActive(section.id);
    toast(`Sección "${section.name}" creada.`, "success");
  }, [toast]);

  const handleDeleteSection = useCallback((id: string) => {
    const section    = state.customSections.find((s) => s.id === id);
    if (!section) return;
    const entryCount = state.customEntries.filter((e) => e.sectionId === id).length;
    const msg        = entryCount > 0
      ? `¿Eliminar "${section.name}" y sus ${entryCount} entradas?`
      : `¿Eliminar la sección "${section.name}"?`;
    if (!confirm(msg)) return;
    setState((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((s) => s.id !== id),
      customEntries:  prev.customEntries.filter((e) => e.sectionId !== id),
    }));
    if (active === id) setActive("dashboard");
    toast(`Sección "${section.name}" eliminada.`, "info");
  }, [state.customSections, state.customEntries, active, toast]);

  // ─── Export / Import ───────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: `aew-backup-${new Date().toISOString().slice(0, 10)}.json`,
    }).click();
    URL.revokeObjectURL(url);
    toast("Backup exportado.", "success");
  }, [state, toast]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = normalizeState(JSON.parse(ev.target?.result as string));
        setState(imported);
        toast("Backup importado correctamente.", "success");
      } catch {
        toast("Archivo inválido.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [toast]);

  // ─── Loading ───────────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0c", flexDirection: "column", gap: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #6c63ff, #3ecfcf)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "monospace",
        }}>A</div>
        <div style={{ color: "#333", fontFamily: "monospace", fontSize: 10, letterSpacing: 4 }}>CARGANDO</div>
      </div>
    );
  }

  const activeCustomSection = state.customSections.find((s) => s.id === active);
  const sharedProps = { state, setState, query };
  const panelProps  = { ...sharedProps, toast };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          active={active}
          setActive={setActive}
          state={state}
          onNewSection={() => setShowWizard(true)}
          onDeleteSection={handleDeleteSection}
          isOnline={isOnline}
          isInstalled={isInstalled}
          user={user}
          onAuthClick={() => user ? handleSignOut() : setShowAuth(true)}
        />

        <main style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Topbar
            query={query}
            setQuery={setQuery}
            active={active}
            setActive={setActive}
            hits={hits}
            state={state}
            onExport={handleExport}
            onImport={handleImport}
            onNewSection={() => setShowWizard(true)}
            onOpenPalette={() => setShowPalette(true)}
          />

          <div key={active} style={{ flex: 1, padding: "36px 40px", animation: "aew-fade-in 0.2s ease-out" }}>
            {active === "dashboard"   && <Dashboard    setActive={setActive} {...sharedProps} />}
            {active === "wiki"        && <WikiPanel     {...sharedProps} />}
            {active === "bugs"        && <BugJournalPanel  {...panelProps} />}
            {active === "experiments" && <ExperimentsPanel {...panelProps} />}
            {active === "code"        && <CodePanel        {...panelProps} />}
            {activeCustomSection      && <CustomSectionPanel section={activeCustomSection} {...panelProps} />}
          </div>
        </main>
      </div>

      {showWizard  && <SectionWizard order={state.customSections.length} onClose={() => setShowWizard(false)} onSave={handleCreateSection} />}
      {showPalette && <CommandPalette hits={hits} query={query} setQuery={setQuery} onSelect={(s) => { setActive(s); setQuery(""); }} onClose={() => { setShowPalette(false); setQuery(""); }} />}
      {showAuth    && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => toast("Sesión iniciada.", "success")} />}

      <PWABanner canInstall={canInstall} isOnline={isOnline} onInstall={install} />
      <ToastRenderer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
