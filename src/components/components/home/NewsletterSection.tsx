"use client";
// src/components/home/NewsletterSection.tsx - Moroccan Luxury
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, Star, ShieldCheck, ArrowRight } from "lucide-react";

const PERKS = [
  { icon: Star, text: "Offres exclusives membres" },
  { icon: Sparkles, text: "Recommandations IA personnalisées" },
  { icon: ShieldCheck, text: "Alertes de prix en temps réel" },
];

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
  enabled?: boolean;
}

export function NewsletterSection({ title, subtitle, enabled = true }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!enabled) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Dark moroccan background */}
      <div className="absolute inset-0 bg-moroccan-navy" />
      <div className="absolute inset-0 moroccan-zellige-bg opacity-30" />

      {/* Radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] opacity-25"
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.6) 0%, transparent 70%)", transform: "translateY(-40%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-20"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)", transform: "translateY(30%)" }} />

      {/* Top / bottom gold lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

      {/* Floating decorative Moroccan shape */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-8 right-12 w-32 h-32 opacity-10 hidden lg:block"
      >
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <path d="M50 18 L82 50 L50 82 L18 50 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
          <path d="M50 31 L69 50 L50 69 L31 50 Z" stroke="#D4AF37" strokeWidth="0.75" fill="none" />
          <circle cx="50" cy="50" r="7" stroke="#D4AF37" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="3" fill="#D4AF37" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-8 left-12 w-24 h-24 opacity-8 hidden lg:block"
      >
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M40 4 L76 40 L40 76 L4 40 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
          <path d="M40 16 L64 40 L40 64 L16 40 Z" stroke="#D4AF37" strokeWidth="0.75" fill="none" />
          <circle cx="40" cy="40" r="5" stroke="#D4AF37" strokeWidth="0.75" fill="none" />
        </svg>
      </motion.div>

      <div className="relative container-main">
        <div className="mx-auto max-w-3xl text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-gold-400/30 bg-gold-400/10 px-5 py-2 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-gold-300">
              Communauté Exclusive
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display text-4xl font-light text-white md:text-5xl lg:text-6xl leading-tight mb-4"
          >
            {title || "Rejoignez les meilleurs"}
            <span className="block font-semibold" style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #f0d060 50%, #D4AF37 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              acheteurs du Maroc.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 text-base text-white/55 leading-relaxed max-w-xl mx-auto"
          >
            {subtitle || "Abonnez-vous pour recevoir en avant-première les meilleures offres, les nouvelles collections et les recommandations de notre IA."}
          </motion.p>

          {/* Perks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-10 flex flex-wrap justify-center gap-4"
          >
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-4 py-2.5 backdrop-blur">
                <Icon className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <span className="text-xs font-medium text-white/75">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto max-w-md rounded-2xl border border-gold-400/30 bg-gold-400/10 px-8 py-8 backdrop-blur"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/20 mx-auto">
                  <Star className="h-6 w-6 text-gold-400 fill-gold-400" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-white mb-2">Bienvenue !</h3>
                <p className="text-sm text-white/60">Vous êtes maintenant membre de la communauté NexMart. Vérifiez votre email.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="h-14 w-full rounded-2xl border border-white/14 bg-white/8 pl-11 pr-4 text-sm text-white outline-none backdrop-blur placeholder:text-white/35 focus:border-gold-400/50 focus:bg-white/12 transition-all"
                    style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)" }}
                  />
                </div>
                <button type="submit" className="btn btn-gold h-14 px-7 font-display text-sm tracking-wide group whitespace-nowrap">
                  S&apos;abonner gratuitement
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </motion.div>

          <p className="mt-5 text-xs text-white/30">
            En vous abonnant, vous acceptez notre politique de confidentialité. Désinscription possible à tout moment.
          </p>
        </div>
      </div>
    </section>
  );
}
