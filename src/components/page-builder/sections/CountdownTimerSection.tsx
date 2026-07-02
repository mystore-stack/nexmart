"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import type { SectionConfig, PageSection } from "../types";

interface CountdownTimerSectionProps {
  section: PageSection;
}

export function CountdownTimerSection({ section }: CountdownTimerSectionProps) {
  const config = section.config as SectionConfig & {
    targetDate?: string;
    message?: string;
  };
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = config.targetDate ? new Date(config.targetDate) : null;
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [config.targetDate]);

  if (!config.targetDate) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center text-gray-500">
            No target date configured for countdown
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 md:py-24 ${
        section.spacing === "large" ? "py-32" : section.spacing === "small" ? "py-12" : ""
      }`}
      style={{ backgroundColor: section.backgroundColor || config.backgroundColor }}
    >
      <div className="container-main">
        <div className="text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {config.title || "Limited Time Offer"}
          </h2>

          <div className="flex justify-center gap-4 md:gap-8">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((item) => (
              <div key={item.label} className="bg-background border border-border rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          {config.message && (
            <p className="mt-8 text-lg text-muted-foreground">{config.message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
