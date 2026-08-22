"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Hash, Mail, PackageSearch, Phone, ShieldCheck, Truck } from "lucide-react";

export default function TrackOrderEntryPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const canSubmit = orderNumber.trim().length > 0 && (email.trim().length > 0 || phone.trim().length > 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const params = new URLSearchParams();
    if (email.trim()) params.set("email", email.trim());
    if (phone.trim()) params.set("phone", phone.trim());

    const query = params.toString();
    router.push(`/track-order/${encodeURIComponent(orderNumber.trim())}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfbf7_0%,#f4efe3_46%,#0f1115_100%)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 moroccan-pattern-bg opacity-[0.04]" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(200,155,60,0.2),transparent_56%)]" />
        <div className="container-main relative py-12 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/25 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6722] backdrop-blur">
                  <PackageSearch className="h-3.5 w-3.5" />
                  Suivi premium
                </div>
                <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-stone-950 md:text-5xl">
                  Suivez votre commande en toute simplicite.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 md:text-base">
                  Entrez votre numero de commande avec votre email ou votre telephone pour consulter
                  l&apos;etat, le transporteur, la livraison estimee et le recapitulatif complet.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, title: "Acces securise", text: "Verification par email ou telephone." },
                    { icon: Truck, title: "Suivi clair", text: "Statut, progression et details de livraison." },
                    { icon: ArrowRight, title: "Parcours rapide", text: "Entree simple puis detail complet." },
                  ].map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0d7a5e]/8 text-[#0d7a5e]">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <h2 className="mt-4 text-sm font-semibold text-stone-950">{title}</h2>
                      <p className="mt-2 text-xs leading-6 text-stone-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/65 bg-white/88 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-500">
                    Recherche de commande
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-stone-950">
                    Retrouver une commande
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="order-number" className="mb-2 block text-sm font-medium text-stone-700">
                      Numero de commande
                    </label>
                    <div className="relative">
                      <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        id="order-number"
                        type="text"
                        value={orderNumber}
                        onChange={(event) => setOrderNumber(event.target.value)}
                        placeholder="Ex: NX-AB12CD34"
                        className="h-14 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] pl-11 pr-4 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#0d7a5e]/45 focus:ring-4 focus:ring-[#0d7a5e]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tracking-email" className="mb-2 block text-sm font-medium text-stone-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        id="tracking-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="vous@exemple.com"
                        className="h-14 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] pl-11 pr-4 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#0d7a5e]/45 focus:ring-4 focus:ring-[#0d7a5e]/10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-stone-200" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">ou</span>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>

                  <div>
                    <label htmlFor="tracking-phone" className="mb-2 block text-sm font-medium text-stone-700">
                      Telephone
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        id="tracking-phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+212 6 XX XX XX XX"
                        className="h-14 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] pl-11 pr-4 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#0d7a5e]/45 focus:ring-4 focus:ring-[#0d7a5e]/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0d7a5e] px-6 text-sm font-semibold text-white transition-all hover:bg-[#0b6a51] hover:shadow-[0_20px_40px_rgba(13,122,94,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Acceder au suivi
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#fcfbf8] p-4 text-sm leading-7 text-stone-600">
                  Utilisez le meme email ou numero de telephone que lors de votre commande pour acceder au suivi.
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                Retourner a la boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
