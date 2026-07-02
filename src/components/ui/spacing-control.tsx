'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { Link2, Unlink } from 'lucide-react';

interface SpacingControlProps {
  value: { top: string; right: string; bottom: string; left: string };
  onChange: (value: { top: string; right: string; bottom: string; left: string }) => void;
  label?: string;
  linked?: boolean;
  onToggleLinked?: () => void;
  className?: string;
}

export function SpacingControl({ 
  value, 
  onChange, 
  label = 'Spacing', 
  linked = false,
  onToggleLinked,
  className 
}: SpacingControlProps) {
  const handleInputChange = (side: keyof typeof value, newValue: string) => {
    if (linked) {
      onChange({ top: newValue, right: newValue, bottom: newValue, left: newValue });
    } else {
      onChange({ ...value, [side]: newValue });
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {onToggleLinked && (
          <button
            onClick={onToggleLinked}
            className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            title={linked ? 'Unlink all' : 'Link all'}
          >
            {linked ? <Link2 className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Visual Box Model */}
      <div className="relative p-4 bg-muted/30 rounded-lg border border-border/40">
        {/* Margin */}
        <div className="absolute inset-2 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Top Margin */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <input
                type="text"
                value={value.top}
                onChange={(e) => handleInputChange('top', e.target.value)}
                className="w-12 h-6 text-xs text-center rounded border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="0"
              />
            </div>
            
            {/* Right Margin */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2">
              <input
                type="text"
                value={value.right}
                onChange={(e) => handleInputChange('right', e.target.value)}
                className="w-12 h-6 text-xs text-center rounded border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="0"
              />
            </div>
            
            {/* Bottom Margin */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <input
                type="text"
                value={value.bottom}
                onChange={(e) => handleInputChange('bottom', e.target.value)}
                className="w-12 h-6 text-xs text-center rounded border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="0"
              />
            </div>
            
            {/* Left Margin */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2">
              <input
                type="text"
                value={value.left}
                onChange={(e) => handleInputChange('left', e.target.value)}
                className="w-12 h-6 text-xs text-center rounded border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="0"
              />
            </div>

            {/* Content Box */}
            <div className="w-16 h-16 bg-background border-2 border-dashed border-border/60 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Top</span>
          <input
            type="text"
            value={value.top}
            onChange={(e) => handleInputChange('top', e.target.value)}
            className="w-full h-8 px-2 text-sm rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="0px"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Bottom</span>
          <input
            type="text"
            value={value.bottom}
            onChange={(e) => handleInputChange('bottom', e.target.value)}
            className="w-full h-8 px-2 text-sm rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="0px"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Left</span>
          <input
            type="text"
            value={value.left}
            onChange={(e) => handleInputChange('left', e.target.value)}
            className="w-full h-8 px-2 text-sm rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="0px"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Right</span>
          <input
            type="text"
            value={value.right}
            onChange={(e) => handleInputChange('right', e.target.value)}
            className="w-full h-8 px-2 text-sm rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="0px"
          />
        </div>
      </div>
    </div>
  );
}
