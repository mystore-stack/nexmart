"use client";

import React from "react";
import { Label } from "@/components/ui/shadcn-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/shadcn-input";
import type { PageSection } from "@prisma/client";

interface AnimationTabProps {
  section: PageSection;
  onConfigUpdate: (updates: any) => void;
}

export function AnimationTab({ section, onConfigUpdate }: AnimationTabProps) {
  const config = section.config as any;

  return (
    <div className="space-y-6">
      {/* Animation Type */}
      <div>
        <Label>Animation Type</Label>
        <Select
          value={config.animation?.type || "none"}
          onValueChange={(value: string) => onConfigUpdate({
            animation: { ...config.animation, type: value }
          })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade In</SelectItem>
            <SelectItem value="slide">Slide Up</SelectItem>
            <SelectItem value="scale">Scale</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
            <SelectItem value="flip">Flip</SelectItem>
            <SelectItem value="rotate">Rotate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Animation Duration */}
      <div>
        <Label>Duration (ms)</Label>
        <Input
          type="number"
          value={config.animation?.duration || 600}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({
            animation: { ...config.animation, duration: parseInt(e.target.value) }
          })}
          min={100}
          max={3000}
          step={100}
          className="mt-2"
        />
      </div>

      {/* Animation Delay */}
      <div>
        <Label>Delay (ms)</Label>
        <Input
          type="number"
          value={config.animation?.delay || 0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigUpdate({
            animation: { ...config.animation, delay: parseInt(e.target.value) }
          })}
          min={0}
          max={2000}
          step={100}
          className="mt-2"
        />
      </div>

      {/* Animation Easing */}
      <div>
        <Label>Easing</Label>
        <Select
          value={config.animation?.easing || "ease"}
          onValueChange={(value: string) => onConfigUpdate({
            animation: { ...config.animation, easing: value }
          })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select easing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="ease">Ease</SelectItem>
            <SelectItem value="ease-in">Ease In</SelectItem>
            <SelectItem value="ease-out">Ease Out</SelectItem>
            <SelectItem value="ease-in-out">Ease In Out</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trigger */}
      <div>
        <Label>Trigger</Label>
        <Select
          value={config.animation?.trigger || "onLoad"}
          onValueChange={(value: string) => onConfigUpdate({
            animation: { ...config.animation, trigger: value }
          })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="onLoad">On Load</SelectItem>
            <SelectItem value="onScroll">On Scroll</SelectItem>
            <SelectItem value="onClick">On Click</SelectItem>
            <SelectItem value="onHover">On Hover</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
