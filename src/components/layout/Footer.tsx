"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Twitter, Youtube, MapPin, Phone, MessageCircle } from "lucide-react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

function MoroccanDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="opacity-60">
        <path d="M16 2 L30 16 L16 30 L2 16 Z" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="16" cy="16" r="3" fill={color} />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
    </div>
  );
}

function DefaultLogo({ primaryColor }: { primaryColor: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={primaryColor} />
      <path d="M20 6 L34 20 L20 34 L6 20 Z" stroke="rgba(212,175,55,0.8)" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.9)" />
    </svg>
  );
}

export function Footer() {
  const { settings, footer } = useSiteConfig();

  const contactInfo = {
    email: (footer?.contactInfo as any)?.email ?? settings.email,
    phone: (footer?.contactInfo as any)?.phone ?? settings.phone,
    address: (footer?.contactInfo as any)?.address ?? settings.address,
  };

  const socials =
    (footer?.socialLinks?.length ? footer.socialLinks : settings.socialLinks)?.map(
      (s: any) => ({
        icon: ICON_MAP[s.icon || s.platform || ""] || Facebook,
        href: s.url || "#",
        label: s.platform || "Social",
      })
    ) ?? [];

  const columns =
    footer?.columns?.length
      ? (footer.columns as Array<{ title: string; links: Array<{ title: string; url: string }> }>)
      : footer && (footer as any).quickLinks?.length
        ? [{ title: "Liens", links: (footer as any).quickLinks.map((l: any) => l) }]
        : [];

  const legalLinks = (footer?.legalLinks as Array<{ title: string; url: string }>) ?? [];
  const description = footer?.description ?? settings.seoDescription;
  const copyright =
    settings.copyrightText ??
    `© ${new Date().getFullYear()} ${settings.storeName}. Tous droits réservés.`;

  const newsletter = (footer as any)?.newsletterSettings as
    | { enabled?: boolean; title?: string; placeholder?: string }
    | undefined;

  return (
    <footer className="relative overflow-hidden">
      <div className="relative bg-moroccan-navy text-white" style={{ borderTopColor: settings.secondaryColor }}>
        <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />
        <div
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent to-transparent"
          style={{ backgroundImage: `linear-gradient(to right, transparent, ${settings.secondaryColor}99, transparent)` }}
        />

        {(newsletter?.enabled !== false) && (
          <div className="relative border-b border-white/8">
            <div className="container-main py-14">
              <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
                <div>
                  <h3 className="font-display text-3xl font-light text-white md:text-4xl leading-tight mb-3">
                    {newsletter?.title || "Newsletter"}
                  </h3>
                  {description && (
                    <p className="text-sm leading-6 text-white/55 max-w-sm">{description}</p>
                  )}
                </div>
                <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      type="email"
                      placeholder={newsletter?.placeholder || "Votre adresse email"}
                      className="h-14 w-full rounded-2xl border border-white/14 bg-white/8 pl-11 pr-4 text-sm text-white outline-none backdrop-blur placeholder:text-white/35 focus:border-white/30 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-gold h-14 px-7 font-display text-sm tracking-wide"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    S&apos;abonner
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="relative container-main py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="mb-6 flex items-center gap-3.5 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-brand-lg flex-shrink-0 overflow-hidden">
                  {footer?.logoUrl || settings.logoUrl ? (
                    <Image
                      src={(footer?.logoUrl || settings.logoUrl)!}
                      alt={settings.storeName}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <DefaultLogo primaryColor={settings.primaryColor} />
                  )}
                </div>
                <div>
                  <span className="block font-display text-2xl font-semibold text-white">{settings.storeName}</span>
                  {settings.storeTagline && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                      {settings.storeTagline}
                    </span>
                  )}
                </div>
              </Link>

              {description && (
                <p className="max-w-xs text-sm leading-7 text-white/50 mb-7">{description}</p>
              )}

              <div className="space-y-2.5 mb-7">
                {contactInfo.address && (
                  <div className="flex items-center gap-2.5 text-sm text-white/50">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: settings.secondaryColor }} />
                    {contactInfo.address}
                  </div>
                )}
                {contactInfo.phone && (
                  <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white">
                    <Phone className="h-4 w-4 flex-shrink-0" style={{ color: settings.secondaryColor }} />
                    {contactInfo.phone}
                  </a>
                )}
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4 flex-shrink-0" style={{ color: settings.secondaryColor }} />
                    WhatsApp
                  </a>
                )}
                {contactInfo.email && (
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white">
                    <Mail className="h-4 w-4 flex-shrink-0" style={{ color: settings.secondaryColor }} />
                    {contactInfo.email}
                  </a>
                )}
                {settings.businessHours && (
                  <p className="text-xs text-white/40">{settings.businessHours}</p>
                )}
              </div>

              {socials.length > 0 && (
                <div className="flex items-center gap-2.5">
                  {socials.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/8 transition-all hover:border-white/30"
                      style={{ ["--hover-bg" as string]: settings.primaryColor }}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-white/70">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links?.map((link: any) => (
                    <li key={link.title}>
                      <Link href={link.url} className="text-sm text-white/50 transition-all hover:text-white hover:translate-x-1 inline-flex">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <MoroccanDivider color={settings.secondaryColor} />

          <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
            <p className="text-xs text-white/35">{copyright}</p>
            {legalLinks.length > 0 && (
              <div className="flex items-center gap-6">
                {legalLinks.map((link) => (
                  <Link key={link.title} href={link.url} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                    {link.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
