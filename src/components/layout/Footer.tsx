"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Mail, Send, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Flash Deals", href: "/deals" },
    { label: "Categories", href: "/categories" },
    { label: "Brands", href: "/brands" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Press", href: "/press" },
  ],
  Help: [
    { label: "Help Center", href: "/help" },
    { label: "Shipping", href: "/shipping" },
    { label: "Easy Returns", href: "/returns" },
    { label: "Track Order", href: "/orders/track" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
    { label: "Contact", href: "/contact" },
  ],
};

const socials = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "YouTube", href: "#", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-950">
      <div className="mx-auto max-w-[1440px] px-8 py-12">
        <div className="grid grid-cols-[1.25fr_1fr] gap-12 border-b border-slate-200 pb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-lg font-black text-white">
                N
              </span>
              <span className="text-2xl font-semibold tracking-normal">NexStore</span>
            </Link>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
              A premium marketplace built for clean discovery, fast checkout, and high product
              density across fashion, electronics, home, beauty, gaming, and essentials.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0f5d43] hover:bg-emerald-50 hover:text-[#0f5d43]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4 text-[#0f5d43]" />
              Newsletter
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-normal">Get first access to premium deals.</h3>
            <form className="mt-5 flex gap-2" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="h-12 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0f5d43] focus:ring-4 focus:ring-emerald-100"
              />
              <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#0f5d43] px-5 text-sm font-bold text-white transition hover:bg-[#0b4834]">
                <Send className="h-4 w-4" />
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 py-10">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-950">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-500 transition hover:text-[#0f5d43]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NexStore. All rights reserved.</p>
          <p>Secure payments · Free shipping · Easy returns</p>
        </div>
      </div>
    </footer>
  );
}
