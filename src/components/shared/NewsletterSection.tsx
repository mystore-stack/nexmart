"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";

interface NewsletterSectionProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  backgroundColor?: string;
  gradient?: string;
  showSuccess?: boolean;
}

export function NewsletterSection({
  title = "Stay Updated",
  description = "Subscribe to our newsletter for exclusive offers, new arrivals, and insider news.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  backgroundColor = "#0F766E",
  gradient,
  showSuccess = false,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(showSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSuccess(true);
    setIsSubmitting(false);
    setEmail("");
  };

  const bgStyle = gradient
    ? { background: gradient }
    : { backgroundColor };

  return (
    <section className="relative py-16 md:py-20 px-4 md:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={bgStyle} />
      
      {/* Moroccan Pattern */}
      <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display">
            {title}
          </h2>

          {/* Description */}
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          {/* Form */}
          {!isSuccess ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-white text-brand-700 rounded-xl font-semibold hover:bg-white/90 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    {buttonText}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-xl font-semibold text-white">
                Successfully subscribed!
              </p>
              <p className="text-white/80">
                Check your email for confirmation.
              </p>
            </motion.div>
          )}

          {/* Privacy Note */}
          {!isSuccess && (
            <p className="text-sm text-white/60 mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
