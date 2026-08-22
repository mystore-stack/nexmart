"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  date: string;
  verified: boolean;
}

interface PremiumTestimonialsProps {
  testimonials: Testimonial[];
}

export function PremiumTestimonials({ testimonials }: PremiumTestimonialsProps) {
  if (testimonials.length === 0) return null;

  const featuredTestimonial = testimonials[0];
  const otherTestimonials = testimonials.slice(1, 5);

  return (
    <section className="relative bg-[#FAF9F7] py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(15 107 87 / 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#0F6B57]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#C8A04D]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Quote className="w-12 h-12 mx-auto mb-4 text-[#C8A04D]" />
          <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-4 font-display">
            Ce Que Disent
            <span className="block text-[#0F6B57]">
              Nos Clients
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les avis de nos clients satisfaits
          </p>
        </motion.div>

        {/* Featured Testimonial */}
        {featuredTestimonial && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#ECECEC] shadow-lg">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-[#C8A04D] text-[#C8A04D]" />
                    ))}
                  </div>

                  <blockquote className="text-2xl text-gray-800 leading-relaxed italic">
                    &ldquo;{featuredTestimonial.text}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#C8A04D] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {featuredTestimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111] text-lg">{featuredTestimonial.name}</p>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{featuredTestimonial.location}</span>
                      </div>
                    </div>
                  </div>

                  {featuredTestimonial.verified && (
                    <div className="flex items-center gap-2 bg-[#0F6B57]/10 text-[#0F6B57] px-4 py-2 rounded-full text-sm font-semibold w-fit">
                      <CheckCircle className="w-4 h-4" />
                      <span>Achat vérifié</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#ECECEC]">
                    <p className="text-sm text-gray-500">Produit acheté:</p>
                    <p className="font-semibold text-[#111111]">{featuredTestimonial.product}</p>
                  </div>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square rounded-2xl bg-white shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[#C8A04D]/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Quote className="w-24 h-24 mx-auto mb-4 text-[#C8A04D]/30" />
                      <p className="text-gray-400 font-semibold">Client Satisfait</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Testimonials */}
        {otherTestimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherTestimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-[#ECECEC]"
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < testimonial.rating ? 'fill-[#C8A04D] text-[#C8A04D]' : 'text-gray-300'}`} />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.text}</p>

                  {/* User */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#C8A04D] flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111] text-sm">{testimonial.name}</p>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{testimonial.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Badge */}
                  {testimonial.verified && (
                    <div className="flex items-center gap-1 text-[#0F6B57] text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      <span>Vérifié</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href="/testimonials">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Voir tous les avis</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
