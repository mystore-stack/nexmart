// src/app/not-found.tsx — Moroccan 404
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />
      <div className="relative text-center px-6">
        <div className="mb-6 flex justify-center">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="opacity-30">
            <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
            <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
            <path d="M50 35 L65 50 L50 65 L35 50 Z" stroke="#0F766E" strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="8" fill="rgba(212,175,55,0.4)" />
          </svg>
        </div>
        <h1 className="font-display text-8xl font-bold text-brand-700 dark:text-brand-400 mb-4">404</h1>
        <p className="font-display text-2xl font-semibold mb-3 text-foreground">Page introuvable</p>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée. Explorez notre boutique premium.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary h-12 px-8">Retour à l&apos;accueil</Link>
          <Link href="/products" className="btn-outline h-12 px-8">Explorer la boutique</Link>
        </div>
      </div>
    </div>
  );
}
