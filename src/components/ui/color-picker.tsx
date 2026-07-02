'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  presets?: string[];
}

export function ColorPicker({ value, onChange, className, presets = [] }: ColorPickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border border-border/40 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 px-3 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="#000000"
        />
      </div>
      {presets.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className="w-6 h-6 rounded-md border border-border/40 hover:scale-110 transition-transform"
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>
      )}
    </div>
  );
}
