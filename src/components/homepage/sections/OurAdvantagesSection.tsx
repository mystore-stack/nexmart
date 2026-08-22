"use client";

import React from "react";
import { Truck, ShieldCheck, HeadphonesIcon, RotateCcw, Gift, Clock } from "lucide-react";

interface OurAdvantagesSectionProps {
  config: any;
}

const defaultAdvantages = [
  { icon: Truck, title: "Free Shipping", description: "On orders over 500 MAD" },
  { icon: ShieldCheck, title: "Secure Payment", description: "100% secure transactions" },
  { icon: HeadphonesIcon, title: "24/7 Support", description: "Dedicated customer service" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Gift, title: "Gift Wrapping", description: "Premium gift options" },
  { icon: Clock, title: "Fast Delivery", description: "Express shipping available" },
];

export function OurAdvantagesSection({ config }: OurAdvantagesSectionProps) {
  const advantages = config.advantages || defaultAdvantages;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {config.title || "Why Choose NexMart"}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {advantages.map((advantage: any, index: number) => {
            const Icon = advantage.icon || defaultAdvantages[index % defaultAdvantages.length].icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0D7A5E] to-[#C89B3C] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                <p className="text-sm text-gray-600">{advantage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
