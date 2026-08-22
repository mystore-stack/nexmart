"use client";
// src/app/error.tsx — Moroccan Luxury Error Page
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[App Error]:", error); }, [error]);

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 moroccan-pattern-bg opacity-10" />
      <div className="absolute top-0 left-1/2 w-96 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)" }} />

      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h1 className="relative font-display text-3xl font-semibold mb-3 text-foreground">Une erreur est survenue</h1>
      <p className="relative max-w-sm text-muted-foreground leading-relaxed mb-4">
        Une erreur inattendue s&apos;est produite. Réessayez ou contactez notre support si le problème persiste.
      </p>
      {error.digest && (
        <p className="relative mb-6 rounded-xl border border-border bg-muted/60 px-4 py-2 text-xs font-mono text-muted-foreground">
          ID : {error.digest}
        </p>
      )}
      <div className="relative flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary h-11 px-7">Réessayer</button>
        <Link href="/" className="btn-outline h-11 px-7 flex items-center">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
