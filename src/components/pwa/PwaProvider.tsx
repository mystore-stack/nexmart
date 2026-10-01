"use client";

import { useEffect, useState } from "react";
import { NexmartEmblem } from "@/components/ui/NexmartLogo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "nexmart-pwa-install-dismissed";

export function PwaProvider() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;

      const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      if (!dismissed) {
        setInstallPrompt(promptEvent);
      }
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
    }
  };

  const dismissInstall = () => {
    setInstallPrompt(null);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <>
      {installPrompt && !isOffline && (
        <div className="fixed inset-x-3 bottom-6 z-[100] sm:inset-x-auto sm:right-4 sm:w-[360px]">
          <div className="rounded-[22px] border border-[#d4af37]/40 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E]/10">
                <NexmartEmblem size={30} color="#0F766E" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">Installez NexMart</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Accédez rapidement à votre boutique depuis votre écran d&apos;accueil.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={dismissInstall}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Plus tard
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-full bg-[#0F766E] px-4 py-2 text-xs font-bold text-white shadow-[0_12px_25px_rgba(15,118,110,0.25)] transition hover:bg-[#0d6b60]"
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOffline && null}

      {isOffline && (
        <div className="fixed inset-x-3 bottom-6 z-[100] sm:inset-x-auto sm:right-4 sm:w-[360px]">
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-amber-200 bg-[#fff7ed] px-4 py-3 shadow-[0_15px_40px_rgba(15,23,42,0.12)]">
            <div>
              <p className="text-sm font-bold text-amber-900">Vous êtes hors connexion.</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
