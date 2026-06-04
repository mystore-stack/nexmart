"use client";
// src/components/home/NewsletterSection.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check, Shield, Zap, Gift } from "lucide-react";
import toast from "react-hot-toast";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // In production, POST to /api/newsletter
    setSubmitted(true);
              toast.success("You&apos;re subscribed! Check your inbox for a welcome gift.");
  };

  return (
    <section className="section bg-foreground text-background">
      <div className="container-main">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Get exclusive deals in your inbox
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Join 500,000+ shoppers. Subscribe and get{" "}
              <span className="text-brand-400 font-semibold">10% off</span> your first order.
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-3 text-green-400 font-semibold text-lg">
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                You&apos;re subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-all text-sm"
                  />
                </div>
                <button type="submit" className="btn-brand py-3.5 px-6 justify-center whitespace-nowrap">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/50">
              {[
                { icon: Shield, label: "No spam, ever" },
                { icon: Zap, label: "Exclusive deals" },
                { icon: Gift, label: "Welcome gift" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
