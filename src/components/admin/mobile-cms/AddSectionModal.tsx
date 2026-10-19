"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ShoppingBag,
  Zap,
  Tag,
  Grid,
  Award,
  Gift,
  Compass,
  FileText,
  Bell,
  Smartphone,
  Layers,
  Heart,
  Plus,
  Search,
} from "lucide-react";

export interface RegistrySectionType {
  type: string;
  name: string;
  nameAr: string;
  category: "hero" | "products" | "navigation" | "offers" | "popups";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultLayout: string;
  defaultConfig: Record<string, any>;
}

export const SECTION_REGISTRY: RegistrySectionType[] = [
  // 1. Vitrines & En-tête
  {
    type: "hero",
    name: "Hero Carousel Principal",
    nameAr: "البانر الدوار الرئيسي",
    category: "hero",
    description: "Carrousel immersif plein écran avec diapositives, textes animés, CTA et navigation rapide.",
    icon: Sparkles,
    defaultLayout: "carousel",
    defaultConfig: {
      banners: [
        {
          id: `banner-${Date.now()}`,
          badgeFr: "NOUVELLE COLLECTION",
          badgeAr: "تشكيلة جديدة",
          titleFr: "Le Luxe Marocain",
          titleAr: "الفخامة المغربية",
          subtitleFr: "Découvrez notre sélection exclusive",
          subtitleAr: "اكتشفوا تشكيلتنا الحصرية",
          ctaFr: "Découvrir",
          ctaAr: "اكتشف الآن",
          image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200",
          target: { type: "category" },
        },
      ],
    },
  },
  {
    type: "custom-banner",
    name: "Bannière Personnalisée & CTA",
    nameAr: "بانر مخصص مع زر تفاعلي",
    category: "hero",
    description: "Bannière au design soigné avec choix de couleurs marocaines, typographies, icônes et bouton d'action.",
    icon: Tag,
    defaultLayout: "banner",
    defaultConfig: {
      ctaLabel: "Explorer l'offre",
      ctaLabelAr: "استكشف العرض",
      ctaAction: "SHOP",
      backgroundColor: "#1B4332",
      textColor: "#FFFFFF",
      accentColor: "#D4AF37",
      icon: "sparkles",
      borderRadius: 16,
      padding: 16,
    },
  },
  {
    type: "discover",
    name: "Vitrine Découverte & Campagne",
    nameAr: "واجهة الاستكشاف والحملات",
    category: "hero",
    description: "Bannière promotionnelle panoramique mettant en avant un univers de marque ou une campagne ciblée.",
    icon: Compass,
    defaultLayout: "banner",
    defaultConfig: {
      badge: "EXCLUSIVITÉ",
      badgeAr: "حصرياً",
    },
  },

  // 2. Catalogue & Produits
  {
    type: "products",
    name: "Rayon de Produits (Sélection ou Dynamique)",
    nameAr: "معرض المنتجات المخصص",
    category: "products",
    description: "Grille ou carrousel horizontal de produits : choix manuel depuis le catalogue ou tri dynamique (populaires, tendances).",
    icon: ShoppingBag,
    defaultLayout: "grid",
    defaultConfig: {
      productLayout: "grid",
      columns: 2,
      showPrice: true,
      showOldPrice: true,
      showDiscount: true,
      limit: 8,
    },
  },
  {
    type: "flash",
    name: "Vente Flash avec Compte à Rebours",
    nameAr: "تخفيضات فلاش مع عد تنازلي",
    category: "products",
    description: "Section d'urgence commerciale avec minuteur temps réel, prix barrés et sélection de produits remisés.",
    icon: Zap,
    defaultLayout: "banner",
    defaultConfig: {
      endsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
  },
  {
    type: "grouped-offers",
    name: "Offres Groupées & Packs",
    nameAr: "العروض المجمعة والباقات",
    category: "products",
    description: "Vitrine présentant des sélections de produits complémentaires avec ajout individuel direct au panier.",
    icon: Layers,
    defaultLayout: "grid",
    defaultConfig: {
      limit: 6,
    },
  },

  // 3. Navigation & Découverte
  {
    type: "categories",
    name: "Catégories Rapides",
    nameAr: "التصنيفات السريعة",
    category: "navigation",
    description: "Boutons ronds ou pastilles défilantes avec icônes ou images illustrant les rayons clés du magasin.",
    icon: Grid,
    defaultLayout: "pills",
    defaultConfig: {
      displayMode: "pills",
      limit: 8,
      showAllButton: true,
    },
  },
  {
    type: "brands",
    name: "Marques Vedettes",
    nameAr: "أشهر العلامات التجارية",
    category: "navigation",
    description: "Carrousel fluide des logos des marques officielles partenaires du magasin.",
    icon: Award,
    defaultLayout: "brands",
    defaultConfig: {
      brandSelectionMode: "all",
      maxVisible: 10,
    },
  },
  {
    type: "gift",
    name: "Trouveur de Cadeaux NexMart (Gift Finder)",
    nameAr: "مساعد اختيار الهدايا",
    category: "navigation",
    description: "Expérience interactive guidant le client selon l'occasion, le destinataire et la tranche budgétaire.",
    icon: Gift,
    defaultLayout: "interactive",
    defaultConfig: {
      giftFinder: {
        enabledOccasions: ["Anniversaire", "Mariage", "Fête des mères", "Saint-Valentin", "Sans occasion"],
        enabledRecipients: ["Partenaire", "Famille", "Ami(e)", "Pour moi"],
        enabledBudgets: ["<200", "200-500", "500-1000", ">2000"],
        enabledInterests: ["Tech", "Maison", "Beauté", "Mode", "Sport", "Premium"],
      },
    },
  },

  // 4. Promotions & Fidélité
  {
    type: "offers",
    name: "Offres du Moment (Publicités & Visuels)",
    nameAr: "عروض اللحظة والإعلانات",
    category: "offers",
    description: "Multiples bannières publicitaires avec images haute résolution et liens de redirection ciblés.",
    icon: FileText,
    defaultLayout: "carousel",
    defaultConfig: {
      advertisements: [],
    },
  },
  {
    type: "coupons",
    name: "Aperçu des Bons d'Achat & Coupons",
    nameAr: "معاينة القسائم والتخفيضات",
    category: "offers",
    description: "Vitrine des coupons de réduction actifs avec code à copier d'un clic et conditions d'application.",
    icon: Tag,
    defaultLayout: "grid",
    defaultConfig: {
      limit: 4,
      destinationPage: {
        enabled: true,
        titleFr: "Bons d'achat exclusifs",
        titleAr: "قسائم شراء حصرية",
        showHero: true,
      },
    },
  },
  {
    type: "smart-journey",
    name: "Parcours Client Intelligent (Smart Journey)",
    nameAr: "المسار الذكي للعميل",
    category: "offers",
    description: "3 étapes natives : Découverte, Exploration du catalogue et Favoris personnalisés.",
    icon: Compass,
    defaultLayout: "steps",
    defaultConfig: {
      enabled: true,
      stages: [
        { key: "discover", order: 0, title: { fr: "Découvrir", ar: "اكتشف" } },
        { key: "explore", order: 1, title: { fr: "Explorer", ar: "استكشف" } },
        { key: "favorites", order: 2, title: { fr: "Favoris", ar: "المفضلة" } },
      ],
    },
  },
  {
    type: "nexplay",
    name: "NexPlay & Récompenses Fidélité",
    nameAr: "ألعاب ومكافآت نيكسبلاي",
    category: "offers",
    description: "Bannière d'accès direct au programme de gamification, tirages au sort et portefeuille de points de fidélité.",
    icon: Award,
    defaultLayout: "banner",
    defaultConfig: {
      titleFr: "NexPlay Fidélité",
      titleAr: "مكافآت نيكسبلاي",
    },
  },

  // 5. Engagement & Popups
  {
    type: "welcome-offer",
    name: "Offre de Bienvenue & Modale d'accueil",
    nameAr: "عرض الترحيب بالعملاء الجدد",
    category: "popups",
    description: "Fenêtre surgissante automatique ou incitation flottante destinée aux nouveaux visiteurs de l'application.",
    icon: Gift,
    defaultLayout: "modal",
    defaultConfig: {
      template: "welcome-offer",
      trigger: "home-entry",
      displayFrequency: "once",
      ctaText: "En profiter maintenant",
      ctaTextAr: "استفد الآن",
      enabled: true,
    },
  },
  {
    type: "gift-quest",
    name: "Quête Cadeau (Gift Quest)",
    nameAr: "مغامرة الهدايا التفاعلية",
    category: "popups",
    description: "Jeu incitatif invitant l'utilisateur à débloquer des cadeaux selon son volume d'achats ou ses visites.",
    icon: Sparkles,
    defaultLayout: "interactive",
    defaultConfig: {
      maxGifts: 3,
      frequency: "once",
      enabled: true,
    },
  },
  {
    type: "announcement-popup",
    name: "Pop-up d'Annonces & Notifications",
    nameAr: "نافذة الإعلانات والإشعارات",
    category: "popups",
    description: "Pop-up programmable pour annonces importantes, alertes météo de livraison, jours fériés ou soldes.",
    icon: Bell,
    defaultLayout: "modal",
    defaultConfig: {
      trigger: "home-entry",
      displayFrequency: "session",
      enabled: true,
    },
  },
  {
    type: "personal",
    name: "Sélection Personnalisée « Pour Vous »",
    nameAr: "تشكيلة مخصصة لك",
    category: "popups",
    description: "Recommandations algorithmiques personnalisées basées sur l'historique de commande du client.",
    icon: Heart,
    defaultLayout: "grid",
    defaultConfig: {},
  },
];

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (registryType: RegistrySectionType) => void;
}

const CATEGORIES = [
  { id: "all", label: "Toutes les sections" },
  { id: "hero", label: "En-tête & Vitrines" },
  { id: "products", label: "Catalogue & Produits" },
  { id: "navigation", label: "Navigation" },
  { id: "offers", label: "Offres & Promotions" },
  { id: "popups", label: "Popups & Engagement" },
];

export function AddSectionModal({ isOpen, onClose, onAddSection }: AddSectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  if (!isOpen) return null;

  const filtered = SECTION_REGISTRY.filter((sec) => {
    const matchCat = selectedCategory === "all" || sec.category === selectedCategory;
    const matchSearch =
      !search ||
      sec.name.toLowerCase().includes(search.toLowerCase()) ||
      sec.nameAr.includes(search) ||
      sec.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ajouter une section à l'accueil mobile
              </h3>
              <p className="text-xs text-slate-500">
                Sélectionnez un modèle parmi les 17 types certifiés NexMart Mobile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="border-b border-slate-200 p-4 space-y-3 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une section (ex: Hero, Vente Flash, Marques, Bannière)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.type + item.name}
                  onClick={() => {
                    onAddSection(item);
                    onClose();
                  }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                        <IconComp className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                        {item.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs font-arabic text-slate-500 mt-0.5">
                        {item.nameAr}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Instancier la section</span>
                    <Plus className="h-4 w-4 transform group-hover:rotate-90 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
