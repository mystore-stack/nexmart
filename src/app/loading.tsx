// src/app/loading.tsx — Moroccan Luxury Loading
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-moroccan-sand dark:bg-moroccan-navy">
      <div className="absolute inset-0 moroccan-pattern-bg opacity-20" />
      <div className="relative flex flex-col items-center gap-6">
        {/* Rotating Moroccan shape */}
        <div className="relative h-16 w-16">
          <svg className="animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 4 L60 32 L32 60 L4 32 Z" stroke="rgba(15,118,110,0.6)" strokeWidth="2" fill="none" />
            <path d="M32 14 L50 32 L32 50 L14 32 Z" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" fill="none" />
            <circle cx="32" cy="32" r="6" fill="rgba(15,118,110,0.8)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-gold-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-foreground">NexMart</p>
          <p className="text-xs text-muted-foreground mt-0.5">Chargement en cours…</p>
        </div>
      </div>
    </div>
  );
}
