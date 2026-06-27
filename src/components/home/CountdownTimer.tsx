"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";

interface CountdownTimerProps {
  endDate: string;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function CountdownTimer({ endDate, className = "", showLabel = true, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(endDate).getTime();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsExpired(false);
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return null;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={`font-bold ${compact ? "text-lg" : "text-2xl md:text-3xl"}`}>
        {value.toString().padStart(2, "0")}
      </div>
      {showLabel && !compact && (
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
          {label}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="w-4 h-4 text-red-500" />
        <span className="font-mono text-sm">
          {timeLeft.hours.toString().padStart(2, "0")}:
          {timeLeft.minutes.toString().padStart(2, "0")}:
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 md:gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-red-500 animate-pulse" />
        <span className="text-sm font-medium text-red-500">Flash Sale Ends In:</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {timeLeft.days > 0 && <TimeBlock value={timeLeft.days} label="Days" />}
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <TimeBlock value={timeLeft.minutes} label="Minutes" />
        <TimeBlock value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
}
