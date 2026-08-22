"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, Gift, CheckCircle, ArrowRight } from "lucide-react";

export function PremiumNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

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
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#C8A04D]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#0F6B57]/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 lg:p-16 shadow-2xl border border-[#ECECEC]"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-8 bg-[#0F6B57] rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#111111] mb-4 font-display">
              Restez Informé
              <span className="block text-[#0F6B57]">
                Des Offres Exclusives
              </span>
            </h2>
            
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Inscrivez-vous pour recevoir nos dernières promotions, nouveautés et conseils shopping directement dans votre boîte mail.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            {[
              { icon: <Gift className="w-5 h-5" />, text: "Offres exclusives" },
              { icon: <Sparkles className="w-5 h-5" />, text: "Nouveautés en avant-première" },
              { icon: <CheckCircle className="w-5 h-5" />, text: "Sans spam, promis" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-700">
                <div className="text-[#C8A04D]">{benefit.icon}</div>
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-[#ECECEC] focus:border-[#0F6B57] focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-[#0F6B57] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Inscrit!</span>
                  </>
                ) : (
                  <>
                    <span>S&apos;inscrire</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            En vous inscrivant, vous acceptez notre politique de confidentialité. Vous pouvez vous désabonner à tout moment.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
