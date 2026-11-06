"use client";

import { NexPointsScreen } from "@/components/mobile";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoyaltyPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      {/* Top Header */}
      <div className="bg-[#084C3E] px-4 pt-4 pb-2 text-white flex items-center justify-between">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-bold text-sm tracking-wide">NexPoints Club</span>
        <div className="w-9" />
      </div>

      <NexPointsScreen />
    </div>
  );
}
