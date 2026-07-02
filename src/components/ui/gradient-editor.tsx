'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface GradientStop {
  id: string;
  color: string;
  position: number;
}

interface GradientEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function GradientEditor({ value, onChange, className }: GradientEditorProps) {
  const [type, setType] = React.useState<'linear' | 'radial'>('linear');
  const [direction, setDirection] = React.useState(90);
  const [stops, setStops] = React.useState<GradientStop[]>([
    { id: '1', color: '#0F766E', position: 0 },
    { id: '2', color: '#D4AF37', position: 100 }
  ]);

  const addStop = () => {
    const newStop: GradientStop = {
      id: String(Date.now()),
      color: '#000000',
      position: 50
    };
    setStops([...stops, newStop].sort((a, b) => a.position - b.position));
  };

  const removeStop = (id: string) => {
    if (stops.length > 2) {
      setStops(stops.filter(s => s.id !== id));
    }
  };

  const updateStop = (id: string, updates: Partial<GradientStop>) => {
    setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.position - b.position));
  };

  const generateGradient = () => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    return type === 'linear' 
      ? `linear-gradient(${direction}deg, ${stopsStr})`
      : `radial-gradient(circle, ${stopsStr})`;
  };

  React.useEffect(() => {
    onChange(generateGradient());
  }, [type, direction, stops]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview */}
      <div 
        className="h-16 rounded-lg border border-border/40"
        style={{ background: generateGradient() }}
      />

      {/* Type Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setType('linear')}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            type === 'linear'
              ? 'bg-brand-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Linear
        </button>
        <button
          onClick={() => setType('radial')}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            type === 'radial'
              ? 'bg-brand-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Radial
        </button>
      </div>

      {/* Direction Slider (Linear only) */}
      {type === 'linear' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0°</span>
            <span>{direction}°</span>
            <span>360°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={direction}
            onChange={(e) => setDirection(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Gradient Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Stops</span>
          <button
            onClick={addStop}
            className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <div key={stop.id} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="h-8 w-8 rounded border border-border/40 cursor-pointer bg-transparent"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={stop.position}
                onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10 text-right">{stop.position}%</span>
              {stops.length > 2 && (
                <button
                  onClick={() => removeStop(stop.id)}
                  className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
