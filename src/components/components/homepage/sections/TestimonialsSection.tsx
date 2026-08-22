"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote, MessageCircle } from "lucide-react";

interface TestimonialsSectionProps {
  config: any;
  testimonials?: any[];
}

export function TestimonialsSection({ config, testimonials = [] }: TestimonialsSectionProps) {
  // Show placeholder if no testimonials available
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    { id: '1', name: 'Sarah Benali', role: 'Fashion Designer', content: 'Absolutely love the quality and style! The luxury collection exceeded my expectations. Fast delivery and excellent customer service.', rating: 5, avatarUrl: null },
    { id: '2', name: 'Mohammed Alami', role: 'Business Owner', content: 'Best online shopping experience in Morocco. The products are authentic and the prices are competitive. Highly recommended!', rating: 5, avatarUrl: null },
    { id: '3', name: 'Fatima Zahra', role: 'Beauty Blogger', content: 'The beauty products are amazing! Great selection of premium brands and the packaging is always perfect. Will definitely order again.', rating: 5, avatarUrl: null },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-indigo-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "What Our Customers Say"}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}
        </motion.div>
        
        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayTestimonials.map((testimonial: any) => (
            <motion.div
              key={testimonial.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="bg-white rounded-3xl p-8 relative hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 border border-gray-100/50">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-indigo-100">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-8 leading-relaxed line-clamp-4">{testimonial.content}</p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  {testimonial.avatarUrl ? (
                    <Image
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0D7A5E] to-[#C89B3C] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    {testimonial.role && (
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
