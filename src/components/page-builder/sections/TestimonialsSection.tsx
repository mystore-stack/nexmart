import React from "react";
import { Star } from "lucide-react";
import type { SectionConfig, PageSection, Testimonial } from "../types";

interface TestimonialsSectionProps {
  section: PageSection;
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const config = section.config as SectionConfig & {
    testimonials?: Testimonial[];
    columns?: 1 | 2 | 3;
    cardBgColor?: string;
  };
  const testimonials = config.testimonials || [];

  if (testimonials.length === 0) {
    return (
      <div className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          No testimonials configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            {config.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>
        )}

        <div
          className={`grid gap-6 ${
            config.columns === 1
              ? "grid-cols-1"
              : config.columns === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {testimonials.map((testimonial: Testimonial, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6"
              style={{
                backgroundColor: config.cardBgColor || "#ffffff",
              }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {testimonial.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
