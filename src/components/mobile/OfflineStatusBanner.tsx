"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { useOfflineCacheStore } from "@/store/offline-cache";
import { useWishlistStore } from "@/store";

export function OfflineStatusBanner() {
  const { isOnline, setIsOnline } = useOfflineCacheStore();
  const syncWishlist = useWishlistStore((s) => s.syncWithServer);
  const [showReconnected, setShowReconnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Synchronize pending data with server
      if (typeof syncWishlist === "function") {
        syncWishlist();
      }
      setTimeout(() => setShowReconnected(false), 3500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [setIsOnline, syncWishlist]);

  if (!mounted) return null;

  // Offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[600] bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-2">
        <WifiOff size={15} />
        <span>Mode hors-ligne — Consultation des données enregistrées</span>
      </div>
    );
  }

  // Reconnected toast banner
  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[600] bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-2">
        <Wifi size={15} />
        <span>Connexion rétablie — Données synchronisées</span>
      </div>
    );
  }

  return null;
}
