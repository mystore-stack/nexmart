"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnnouncementBarData } from "@/lib/homepage/types";

interface AnnouncementBarProps {
  data: AnnouncementBarData;
}

export function AnnouncementBar({ data }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (data.autoHide && data.hideAfter) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, data.hideAfter * 1000);
      return () => clearTimeout(timer);
    }
  }, [data.autoHide, data.hideAfter]);

  if (!isVisible || !data.text) return null;

  return (
    <div
      className="relative w-full text-center py-2 px-4"
      style={{
        backgroundColor: data.backgroundColor || 'rgba(13,122,94,0.06)',
        color: data.textColor || 'var(--color-primary)'
      }}
    >
      <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
        {data.icon && <span className="text-sm">{data.icon}</span>}
        <span className="text-sm font-medium">
          {data.link ? (
            <a href={data.link} className="hover:underline" style={{ color: data.textColor || 'var(--color-primary)' }}>
              {data.text}
            </a>
          ) : (
            data.text
          )}
        </span>
        {data.linkText && data.link && (
          <a href={data.link} className="text-xs font-semibold hover:underline badge-gold" style={{ padding: '6px 10px' }}>
            {data.linkText}
          </a>
        )}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        style={{ color: data.textColor || 'var(--color-primary)' }}
        aria-label="Fermer la bannière"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
