"use client";

import React from "react";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          NexMart
        </Link>
      </div>
    </header>
  );
}
