import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Carrières | Rejoignez l'équipe NexMart",
    description: "Découvrez les opportunités de carrière chez NexMart. Rejoignez une équipe passionnée qui réinvente l'e-commerce au Maroc.",
    keywords: ["carrières", "emploi", "recrutement", "offres d'emploi", "NexMart"],
    openGraph: {
      title: "Carrières | Rejoignez l'équipe",
      description: "Découvrez nos opportunités de carrière et rejoignez notre équipe.",
      type: "website",
    },
  };
}

export default function CareersPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Carrières NexMart",
    description: "Page de recrutement et carrières de NexMart",
  };

  const jobCategories = [
    {
      title: "Technologie",
      icon: "💻",
      jobs: ["Développeur Full Stack", "Développeur Frontend", "Développeur Backend", "Ingénieur DevOps", "Data Scientist"],
    },
    {
      title: "Logistique",
      icon: "📦",
      jobs: ["Responsable Entrepôt", "Coordinateur Logistique", "Gestionnaire Stock", "Chauffeur Livreur"],
    },
    {
      title: "Marketing",
      icon: "📢",
      jobs: ["Responsable Marketing", "Social Media Manager", "Content Creator", "SEO Specialist"],
    },
    {
      title: "Support Client",
      icon: "🎧",
      jobs: ["Support Client", "Customer Success Manager", "Community Manager"],
    },
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        <div className="border-b border-border relative overflow-hidden bg-gradient-to-b from-surface to-background">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main py-20 md:py-28">
            <div className="max-w-4xl">
              <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mb-6">
                <span className="bg-gradient-to-r gradient-emerald">Carrières</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Rejoignez une équipe passionnée qui réinvente l'e-commerce au Maroc
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Pourquoi NexMart?</h2>
              <p className="text-muted-foreground leading-relaxed">
                NexMart est une marketplace en pleine croissance qui révolutionne l'expérience e-commerce au Maroc. En rejoignant notre équipe, vous aurez l'opportunité de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Travailler avec des technologies de pointe (Next.js, React, AI)</li>
                <li>Contribuer à un projet à fort impact social et économique</li>
                <li>Évoluer dans un environnement stimulant et innovant</li>
                <li>Bénéficier d'un package salarial compétitif et d'avantages</li>
                <li>Participer à la construction d'une entreprise en croissance</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-6">Postes Ouverts</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {jobCategories.map((category, idx) => (
                  <div key={idx} className="p-6 rounded-xl border border-border/50 bg-surface/50">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="font-display text-xl font-semibold mb-4">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.jobs.map((job, jobIdx) => (
                        <li key={jobIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {job}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Comment Postuler?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour postuler à l'un de nos postes ou nous proposer votre candidature spontanée:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Préparez votre CV et une lettre de motivation</li>
                <li>Envoyez votre dossier à <a href="mailto:careers@nexmart.ma" className="text-emerald-600 hover:underline">careers@nexmart.ma</a></li>
                <li>Indiquez le poste souhaité dans le sujet de l'email</li>
                <li>Nous vous contacterons si votre profil correspond à nos besoins</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Nos Valeurs</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">Nous encourageons la créativité et l'expérimentation</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">Nous visons la qualité dans tout ce que nous faisons</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Collaboration</h3>
                  <p className="text-sm text-muted-foreground">Nous travaillons ensemble pour atteindre nos objectifs</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Intégrité</h3>
                  <p className="text-sm text-muted-foreground">Nous agissons avec honnêteté et transparence</p>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <h2 className="font-display text-2xl font-semibold mb-4">Prêt à nous rejoindre?</h2>
              <p className="text-muted-foreground mb-6">
                Envoyez-nous votre candidature et rejoignez l'aventure NexMart!
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:careers@nexmart.ma"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Envoyer ma Candidature
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-lg hover:bg-surface transition-colors"
                >
                  En savoir plus sur NexMart
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
