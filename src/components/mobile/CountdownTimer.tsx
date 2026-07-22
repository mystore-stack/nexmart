"use client";
// src/components/mobile/CountdownTimer.tsx
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: string; // ISO timestamp
  className?: string;
}

/**
 * Real-time countdown timer for deals.
 */
export function CountdownTimer({ endTime, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`flex items-center gap-1 text-xs font-bold tabular-nums ${className || ""}`}>
      <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-gray-900 text-white rounded-md px-1.5 py-0.5 text-[11px] font-black">
            {v}
          </span>
          {i < 2 && <span className="text-gray-500 text-[10px]">:</span>}
        </span>
      ))}
    </div>
  );
}
