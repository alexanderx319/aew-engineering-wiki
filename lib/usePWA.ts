"use client";

import { useState, useEffect } from "react";

export interface PWAState {
  isInstalled:    boolean;   // running as standalone PWA
  isOnline:       boolean;   // network status
  canInstall:     boolean;   // browser showing install prompt
  swRegistered:   boolean;   // service worker active
  install:        () => void; // trigger install prompt
}

// BeforeInstallPromptEvent is not in standard TS types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWA(): PWAState {
  const [isInstalled,  setIsInstalled]  = useState(false);
  const [isOnline,     setIsOnline]     = useState(true);
  const [canInstall,   setCanInstall]   = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Detect if running as installed PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    // Network status
    setIsOnline(navigator.onLine);
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);

    // Install prompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Detect installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt = null;
    });

    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          setSwRegistered(true);
          // Check for updates every 60 seconds
          setInterval(() => reg.update(), 60_000);
        })
        .catch((err) => console.warn("SW registration failed:", err));
    }

    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
      deferredPrompt = null;
    }
  };

  return { isInstalled, isOnline, canInstall, swRegistered, install };
}
