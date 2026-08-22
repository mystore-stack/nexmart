"use client";

import React from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "/about" },
        { label: "Carrières", href: "/careers" },
        { label: "Presse", href: "/press" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Aide",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
        { label: "Retours", href: "/returns" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "Conditions", href: "/terms" },
        { label: "Confidentialité", href: "/privacy" },
        { label: "Cookies", href: "/cookies" },
        { label: "Licences", href: "/licenses" },
      ],
    },
    {
      title: "Catégories",
      links: [
        { label: "Électronique", href: "/categories/electronics" },
        { label: "Mode", href: "/categories/fashion" },
        { label: "Maison", href: "/categories/home" },
        { label: "Sport", href: "/categories/sports" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
  ];

  const paymentMethods = [
    { name: "Visa", color: "text-[#0F6B57]" },
    { name: "Mastercard", color: "text-[#C8A04D]" },
    { name: "PayPal", color: "text-[#0F6B57]" },
    { name: "Stripe", color: "text-[#C8A04D]" },
    { name: "CMI", color: "text-[#0F6B57]" },
  ];

  return (
    <footer className="relative bg-[#111111] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-[#ECECEC]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2 font-display">Restez connecté</h3>
              <p className="text-gray-400">Recevez nos offres exclusives et nouveautés</p>
            </div>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-[#ECECEC]/30 focus:border-[#C8A04D] focus:outline-none text-white placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#C8A04D] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>S&apos;inscrire</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-[#C8A04D] font-display">
                NexMart
              </h3>
              <p className="text-gray-400 leading-relaxed">
                La marketplace premium du Maroc. Découvrez des milliers de produits sélectionnés avec soin.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-[#C8A04D]" />
                  <span>contact@nexmart.ma</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-[#C8A04D]" />
                  <span>+212 522 123 456</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-[#C8A04D]" />
                  <span>Casablanca, Maroc</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#C8A04D] transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#ECECEC]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-gray-400"
            >
              <span>© {currentYear} NexMart. Tous droits réservés.</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:flex items-center gap-1">
                Fait avec <Heart className="w-4 h-4 text-[#C8A04D] fill-[#C8A04D]" /> au Maroc
              </span>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-6"
            >
              {paymentMethods.map((method, i) => (
                <span key={i} className={`font-bold ${method.color}`}>
                  {method.name}
                </span>
              ))}
            </motion.div>

            {/* Language & Currency */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                <option value="MAD">MAD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
