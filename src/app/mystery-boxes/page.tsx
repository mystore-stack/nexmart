// src/app/mystery-boxes/page.tsx — Mystery Boxes Standalone Page
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { MysteryBoxCard } from "@/components/mystery-box/MysteryBoxCard";
import { Gift, Sparkles, RefreshCw } from "lucide-react";

interface MysteryBox {
  id: string;
  title: string;
  description: string | null;
  image: string;
  price: number;
  oldPrice: number | null;
  minGuaranteedValue: number | null;
  maxProfitPercent: number | null;
  itemCount: number;
  openCount: number;
  items: any[];
  startDate: string | null;
  endDate: string | null;
}

export default function MysteryBoxesPage() {
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMysteryBoxes = async () => {
      try {
        const res = await fetch("/api/mystery-boxes");
        const data = await res.json();
        if (data.success && data.boxes) {
          setMysteryBoxes(data.boxes);
        }
      } catch (error) {
        console.error("Error fetching mystery boxes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMysteryBoxes();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 space-y-10">
      <PageHeader
        title="Mystery Boxes"
        description="Explorez des boîtes mystères soigneusement composées pour offrir une expérience luxueuse, surprenante et exclusive au Maroc."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Mystery Boxes" },
        ]}
      />

      <section className="container-main">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-900 p-8 text-white shadow-luxury border border-white/10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                <Sparkles className="h-4 w-4" /> Surprise Premium
              </div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight">Mystery Boxes exclusives</h2>
              <p className="max-w-2xl text-sm text-white/80 leading-relaxed">
                Choisissez une boîte mystère et recevez une sélection de produits haut de gamme, avec une valeur surprise supérieure à votre achat.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/products?tag=mystery-box" className="rounded-2xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800">
                  Voir toute la collection
                </Link>
                <Link href="/promotions" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Autres offres
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-fuchsia-100 text-fuchsia-700">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">À partir de</p>
                <h3 className="text-xl font-semibold text-foreground">
                  {mysteryBoxes.length > 0 
                    ? Math.min(...mysteryBoxes.map(b => b.price)).toLocaleString("fr-MA")
                    : "199"} DH
                </h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-6">
              Profitez de prix d'appel attractifs et recevez un assortiment de produits sélectionnés spécialement pour vous.
            </p>
            <div className="rounded-3xl bg-surface p-5 border border-border/70">
              <p className="text-sm text-muted-foreground">Sélection du moment</p>
              <p className="mt-3 text-lg font-semibold text-foreground">{mysteryBoxes.length} boîtes disponibles</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Mystery Boxes</p>
            <h2 className="font-display text-3xl font-semibold text-foreground">Nos boîtes mystères</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Chaque boîte contient des produits soigneusement sélectionnés pour faire plaisir et étonner vos proches ou vous-même.
          </p>
        </div>

        {loading ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto animate-spin" />
            <p className="font-bold text-foreground">Chargement des boîtes mystères...</p>
          </div>
        ) : mysteryBoxes.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {mysteryBoxes.map((box) => (
              <MysteryBoxCard key={box.id} box={box} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 text-center text-muted-foreground">
            Aucune boîte mystère active pour le moment. Revenez bientôt pour de nouvelles surprises.
          </div>
        )}
      </section>
    </div>
  );
}
