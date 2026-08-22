"use client";

import React from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  LuxurySectionHeader,
  testimonials,
} from "@/components/homepage/luxury-homepage-shared";

const TestimonialsPremium: React.FC = () => {
  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f4ee_100%)] py-20">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Témoignages"
          title="Ils ont choisi NexMart."
          description="Portraits premium, citations lisibles — la preuve sociale qui clôt la homepage avec chaleur et confiance."
          align="center"
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-[34px] border border-stone-200 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg first:bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-stone-100">
                  <ImageWithFallback
                    src={testimonial.image}
                    fallbackSrc="/assets/hero-fallback.svg"
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-950">{testimonial.name}</h3>
                  <p className="text-sm text-stone-500">{testimonial.role} · {testimonial.city}</p>
                </div>
              </div>
              <p className="font-display text-2xl leading-10 tracking-[-0.03em] text-stone-900">
                “{testimonial.quote}”
              </p>
              <div className="mt-6 rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
                Favorite section: <span className="font-semibold text-stone-950">{testimonial.product}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

TestimonialsPremium.displayName = "TestimonialsPremium";

export default React.memo(TestimonialsPremium);
