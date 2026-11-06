"use client";

import { useCompareStore } from "@/store/compare";
import Link from "next/link";
import { Scale, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function CompareFloatingBar() {
  const { items, clear } = useCompareStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0 || pathname === "/compare") {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 bg-slate-900 text-white rounded-full pl-3.5 pr-2 py-2 shadow-2xl border border-slate-700/60 backdrop-blur-md">
        <Link
          href="/compare"
          className="flex items-center gap-2 text-xs font-bold hover:text-emerald-300 transition"
        >
          <Scale size={16} className="text-emerald-400" />
          <span>Comparer ({items.length})</span>
        </Link>
        <button
          onClick={clear}
          className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          aria-label="Effacer"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
