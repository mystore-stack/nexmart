"use client";

import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

interface NewsletterSectionProps {
  config: any;
}

export function NewsletterSection({ config }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, integrate with newsletter API
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail("");
  };

  return (
    <section className="py-16 bg-gradient-to-r from-[#0D7A5E] to-[#C89B3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {config.title || "Stay Updated"}
          </h2>
          <p className="text-white/90 mb-8">
            {config.description || "Subscribe to our newsletter for exclusive deals, new arrivals, and luxury updates."}
          </p>
          
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-[#0D7A5E] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
              <p className="font-semibold">Thank you for subscribing!</p>
            </div>
          )}
          
          {config.showSocialProof && (
            <p className="text-white/70 text-sm mt-4">
              Join {config.subscriberCount || "10,000+"} luxury shoppers
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
