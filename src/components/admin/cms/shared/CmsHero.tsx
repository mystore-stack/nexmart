import Link from "next/link";
import {
  Zap,
  LayoutDashboard,
  Palette,
  Search,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Settings,
} from "lucide-react";

const BENEFITS = [
  { icon: Zap, text: "Mises à jour en temps réel" },
  { icon: LayoutDashboard, text: "Gestion centralisée du contenu" },
  { icon: Palette, text: "Contrôle total de l'identité visuelle" },
  { icon: Search, text: "Optimisation SEO simplifiée" },
  { icon: Sparkles, text: "Expérience d'administration professionnelle" },
];

const EDITABLE_ITEMS = [
  "Logo et identité visuelle",
  "Numéro de téléphone et adresse email",
  "Paramètres SEO avancés",
  "Couleurs et branding",
  "Menus de navigation",
  "Footer et liens utiles",
  "Annonces et contenu marketing",
];

interface CmsHeroProps {
  variant?: "full" | "compact";
  showCta?: boolean;
}

export function CmsHero({ variant = "full", showCta = true }: CmsHeroProps) {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Modifiez facilement le téléphone, l&apos;email, le logo, les paramètres SEO, les couleurs de la marque,
          la navigation et le footer. Chaque modification est appliquée automatiquement sur le site en ligne,
          sans intervention technique ni redéploiement.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {BENEFITS.slice(0, 3).map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-moroccan-navy via-moroccan-navy to-primary/30 text-white">
      <div className="absolute inset-0 moroccan-pattern-bg opacity-10" />
      <div
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
      />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold-300">
            <Sparkles className="h-3.5 w-3.5" />
            CMS NexMart
          </span>

          <h2 className="mt-4 font-display text-2xl font-light leading-tight sm:text-3xl lg:text-4xl">
            Gestion complète de votre boutique
            <span className="block font-semibold text-gold-400">depuis un seul dashboard</span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
            Prenez le contrôle total de votre site NexMart sans toucher au code. Modifiez facilement le téléphone,
            l&apos;email, le logo, les paramètres SEO, les couleurs de la marque, la navigation et le footer
            directement depuis le dashboard. Toutes les modifications sont appliquées automatiquement et reflétées
            instantanément sur le site en ligne, sans intervention technique ni redéploiement.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold-400/90">
              Modifiez instantanément
            </h3>
            <ul className="space-y-2">
              {EDITABLE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold-400/90">
              Pourquoi c&apos;est puissant ?
            </h3>
            <ul className="space-y-2.5">
              {[
                ...BENEFITS,
                { icon: LayoutDashboard, text: "Aucune intervention technique requise" },
                { icon: Sparkles, text: "Architecture CMS inspirée des grandes plateformes e-commerce" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-3.5 w-3.5 text-gold-300" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/60">
          NexMart vous permet de gérer votre boutique comme une plateforme e-commerce de nouvelle génération,
          avec rapidité, flexibilité et contrôle total. Chaque modification est automatiquement synchronisée
          avec le site public et visible immédiatement par vos visiteurs.
        </p>

        {showCta && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/cms/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-moroccan-navy transition-colors hover:bg-gold-400"
            >
              <Settings className="h-4 w-4" />
              Paramètres du site
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/cms/homepage"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              Homepage Builder
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
