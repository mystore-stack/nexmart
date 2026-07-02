'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

interface SliderControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function SliderControl({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  label,
  showValue = true,
  className
}: SliderControlProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div
          className="absolute top-1/2 left-0 h-2 bg-brand-500 rounded-l-lg pointer-events-none -translate-y-1/2"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-500 rounded-full shadow-lg border-2 border-background pointer-events-none"
          style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}
