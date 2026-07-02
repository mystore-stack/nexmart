import React from "react";
import { CheckCircle } from "lucide-react";
import type { SectionConfig, PageSection, IconItem } from "../types";

interface BenefitsSectionProps {
  section: PageSection;
}

export function BenefitsSection({ section }: BenefitsSectionProps) {
  const config = section.config as SectionConfig & {
    benefits?: IconItem[];
  };
  const benefits = config.benefits || [
    { title: "Free Shipping", description: "On orders over 500 MAD" },
    { title: "Secure Payment", description: "100% secure transactions" },
    { title: "24/7 Support", description: "Dedicated customer service" },
  ];

  return (
    <section
      className={`py-16 md:py-24 ${
        section.spacing === "large" ? "py-32" : section.spacing === "small" ? "py-12" : ""
      }`}
      style={{ backgroundColor: section.backgroundColor || config.backgroundColor }}
    >
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {config.title || "Why Choose Us"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {config.description || "Discover the benefits of shopping with us"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit: IconItem, index: number) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
