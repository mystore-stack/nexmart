"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  onSubscribe?: (email: string) => Promise<void>;
}

export function NewsletterSection({
  title = "Stay in the Loop",
  subtitle = "Get exclusive deals, new arrivals, and insider tips delivered to your inbox.",
  placeholder = "Enter your email",
  onSubscribe,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      }
      toast.success("Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-[#0f5d43]/20 to-slate-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#d6b25e]/5 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#0f5d43]/5 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d6b25e]/20 border border-[#d6b25e]/40 mb-6"
        >
          <Mail className="w-8 h-8 text-[#d6b25e]" />
        </motion.div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-[#d6b25e]" />
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">{subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur text-white placeholder:text-white/50 focus:outline-none focus:border-[#d6b25e]/50 focus:ring-1 focus:ring-[#d6b25e]/30 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#d6b25e] to-[#c29c4a] hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-white/50 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </motion.section>
  );
}
