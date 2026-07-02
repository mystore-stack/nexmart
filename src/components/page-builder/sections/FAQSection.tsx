"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SectionConfig, PageSection, FAQ } from "../types";

interface FAQSectionProps {
  section: PageSection;
}

export function FAQSection({ section }: FAQSectionProps) {
  const config = section.config as SectionConfig & { faqs?: FAQ[] };
  const faqs = config.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center text-gray-500">
          No FAQs configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            {config.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {faqs.map((faq: FAQ, index: number) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-4 pt-0 text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
