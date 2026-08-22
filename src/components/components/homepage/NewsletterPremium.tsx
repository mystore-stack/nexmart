"use client";

import React, { useState } from "react";
import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import {
  homeLuxuryBenefits,
  LuxuryFeatureStrip,
} from "@/components/homepage/luxury-homepage-shared";

const NewsletterPremium: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#07201a_0%,#0d7a5e_54%,#0a5e49_100%)] py-20">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(200,155,60,0.22),transparent_55%)]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_68%)] blur-3xl" />

      <div className="container-main relative">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/30 bg-[#c89b3c]/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f0d69d]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Newsletter privee</span>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Rejoignez le cercle privé NexMart.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/74 sm:text-base">
            Lancements exclusifs, edits produits et recommandations curatoriales — une newsletter aussi soignée que notre homepage.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] border border-white/12 bg-stone-950/28 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/30 bg-[#c89b3c]/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f0d69d]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Private access</span>
            </div>

            <h3 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              Recevez des selections premium, pas des emails generiques.
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/74 sm:text-base">
              Accedez aux lancements prives, aux editos produits et aux recommandations qui prolongent l&apos;experience luxe du homepage jusque dans votre boite mail.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-white">2x</p>
                <p className="mt-2 text-sm leading-6 text-white/65">moins de bruit, plus d&apos;edits utiles et de vraies nouveautes.</p>
              </div>
              <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-white">48h</p>
                <p className="mt-2 text-sm leading-6 text-white/65">d&apos;acces anticipe aux capsules et offres privees.</p>
              </div>
              <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-white">100%</p>
                <p className="mt-2 text-sm leading-6 text-white/65">curation premium, sans visuels vides ni contenus faibles.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/12 bg-white/10 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-10">
            <div className="rounded-[28px] border border-white/12 bg-white/95 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d7a5e]/8 text-[#0d7a5e]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a6722]">Concierge newsletter</p>
                  <p className="mt-1 text-sm text-stone-500">Mode, maison, cadeaux et edits saisonniers.</p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="mt-6 rounded-[24px] border border-[#0d7a5e]/15 bg-[#f4faf8] p-5 text-sm text-stone-700">
                  <p className="font-semibold text-stone-950">Inscription confirmee.</p>
                  <p className="mt-2 leading-7">
                    Merci. Vous recevrez bientot des recommandations premium, des lancements prives et des capsules organisees avec plus de clarte.
                  </p>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <label htmlFor="newsletter-premium-email" className="text-sm font-medium text-stone-700">
                    Votre email
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="newsletter-premium-email"
                      aria-label="Votre email"
                      placeholder="exemple@nexmart.ma"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 flex-1 rounded-full border border-stone-200 bg-stone-50 px-5 text-sm text-stone-900 outline-none transition focus:border-[#0d7a5e]/35 focus:bg-white focus:ring-4 focus:ring-[#0d7a5e]/10"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0d7a5e] px-6 text-sm font-semibold text-white transition hover:bg-[#0b6a51]"
                    >
                      <span>Je m&apos;inscris</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-950">Respect de votre rythme</p>
                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      Une ligne editoriale plus elegante, un meilleur tri des recommandations et une frequence qui reste premium.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <LuxuryFeatureStrip items={homeLuxuryBenefits} dark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

NewsletterPremium.displayName = "NewsletterPremium";

export default React.memo(NewsletterPremium);
