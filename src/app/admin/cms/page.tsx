"use client";
// src/app/admin/cms/page.tsx — Admin CMS Central Hub
import React, { useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Grid,
  Zap,
  Truck,
  Sparkles,
  Award,
  PackagePlus,
  Gift,
  Layers,
  Building2,
  Sliders,
  Mail,
  LayoutTemplate,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const CMS_MODULES = [
  { id: "banners", name: "Gestion des Bannières", desc: "Hero banners & bannières promotionnelles", icon: ImageIcon, color: "text-blue-600 bg-blue-50 border-blue-200", href: "/admin/cms/banners" },
  { id: "homepage-builder", name: "Homepage Builder", desc: "Organisez les sections et l'ordre de la page d'accueil", icon: LayoutTemplate, color: "text-cyan-600 bg-cyan-50 border-cyan-200", href: "/admin/cms/homepage-builder" },
  { id: "categories", name: "Catégories", desc: "Ordre, masquage et illustrations des catégories", icon: Grid, color: "text-amber-600 bg-amber-50 border-amber-200", href: "/admin/cms/categories" },
  { id: "editors-choice", name: "Editor's Choice", desc: "Luxury banner, curated products, ordering, and preview", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-200", href: "/admin/cms/editors-choice" },
  { id: "flash-deals", name: "Ventes Flash", desc: "Compte à rebours, remises et stocks", icon: Zap, color: "text-orange-600 bg-orange-50 border-orange-200", href: "/admin/cms/flash-deals" },
  { id: "service-banners", name: "Bannières de Service", desc: "Livraison rapide & Paiement à la livraison", icon: Truck, color: "text-emerald-600 bg-emerald-50 border-emerald-200", href: "/admin/cms/service-banners" },
  { id: "sponsored", name: "Produits Sponsorisés", desc: "Mise en avant sponsorisée sur la page d'accueil", icon: Award, color: "text-sky-600 bg-sky-50 border-sky-200", href: "/admin/cms/sponsored" },
  { id: "bestsellers", name: "Meilleures Ventes", desc: "Classement et rangs des best-sellers", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50 border-indigo-200", href: "/admin/cms/bestsellers" },
  { id: "new-arrivals", name: "Nouveautés", desc: "Gestion des cartes des derniers produits arrivés", icon: PackagePlus, color: "text-teal-600 bg-teal-50 border-teal-200", href: "/admin/cms/new-arrivals" },
  { id: "mystery-boxes", name: "Mystery Boxes", desc: "Offres boîtes mystères et tarifs de départ", icon: Gift, color: "text-pink-600 bg-pink-50 border-pink-200", href: "/admin/cms/mystery-boxes" },
  { id: "bundle-builder", name: "Constructeur de Packs", desc: "Réductions bundles et choix des produits", icon: Layers, color: "text-emerald-700 bg-emerald-100 border-emerald-300", href: "/admin/cms/bundle-builder" },
  { id: "brands", name: "Marques Partenaires", desc: "Logos, liens et ordre d'affichage des marques", icon: Building2, color: "text-slate-700 bg-slate-100 border-slate-300", href: "/admin/cms/brands" },
  { id: "features", name: "Barre d'Avantages", desc: "Livraison, Paiement sécurisé, Support 24/7", icon: Sliders, color: "text-rose-600 bg-rose-50 border-rose-200", href: "/admin/cms/features" },
  { id: "newsletter", name: "Newsletter", desc: "Textes, accroches et paramètres de la newsletter", icon: Mail, color: "text-violet-600 bg-violet-50 border-violet-200", href: "/admin/cms/newsletter" },
  { id: "footer", name: "Pied de Page", desc: "Coordonnées, liens légaux et réseaux sociaux", icon: LayoutTemplate, color: "text-gray-700 bg-gray-100 border-gray-300", href: "/admin/cms/footer" },
];

export default function AdminCmsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-brand-700" />
            Gestion Dynamique du CMS Page d&apos;Accueil
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez en temps réel chaque section de la homepage NexMart : CRUD, glisser-déposer, visibilité et programmation.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="btn-outline inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl border border-border hover:bg-muted"
        >
          <Eye className="w-4 h-4" />
          Aperçu Live Homepage
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sections Gérées</span>
          <p className="text-3xl font-black text-foreground">15 Modules</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Dynamiques
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mises à Jour</span>
          <p className="text-3xl font-black text-brand-700">En Temps Réel</p>
          <span className="text-[11px] text-muted-foreground font-medium">Synchronisation automatique Prisma DB</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Contrôles Avancés</span>
          <p className="text-3xl font-black text-purple-700">CRUD & Scheduling</p>
          <span className="text-[11px] text-purple-600 font-bold">Activer/Masquer & Dates début/fin</span>
        </div>
      </div>

      {/* Grid of 15 CMS Modules */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Modules d&apos;Administration de la Page d&apos;Accueil</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CMS_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="group relative p-6 rounded-3xl border border-border bg-card hover:border-gold-300 hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl border ${mod.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-brand-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Gérer <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-brand-700 transition-colors mb-1">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {mod.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  Plein accès CRUD & Réordonnancement
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
