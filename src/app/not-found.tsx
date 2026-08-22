// src/app/not-found.tsx — Moroccan 404
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold mb-4">404</h1>
        <p className="text-2xl font-semibold mb-3">Page introuvable</p>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Cette page n'existe pas ou a été déplacée. Explorez notre boutique premium.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="px-8 py-3 bg-primary text-primary-foreground rounded">Retour à l'accueil</Link>
          <Link href="/products" className="px-8 py-3 border rounded">Explorer la boutique</Link>
        </div>
      </div>
    </div>
  );
}
